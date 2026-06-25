import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { AuditLog } from '../audit-logs/audit-log.entity';
import { LoginAttempt } from '../security/login-attempt.entity';
import { Role } from '../roles/role.entity';
import { RolePermission } from '../roles/role-permission.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(LoginAttempt)
    private loginAttemptRepository: Repository<LoginAttempt>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {}

  async register(fullname: string, email: string, password: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    this.validatePasswordPolicy(password);

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User();
    user.fullname = fullname;
    user.email = email;
    user.passwordHash = passwordHash;
    user.status = 'active';

    await this.userRepository.save(user);

    await this.auditLogService.log(user.id, 'User Registered', email, 'success', null);

    return { id: user.id, fullname: user.fullname, email: user.email };
  }

  async login(email: string, password: string, ipAddress: string, device?: string, browser?: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      await this.recordLoginAttempt(email, ipAddress, 'failed');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') throw new UnauthorizedException('Account is deactivated');

    if (user.isLocked && user.lockedUntil && new Date() < user.lockedUntil) {
      throw new UnauthorizedException('Account is locked due to multiple failed attempts');
    }

    if (user.isLocked && user.lockedUntil && new Date() >= user.lockedUntil) {
      user.isLocked = false;
      user.lockedUntil = undefined as any;
      await this.userRepository.save(user);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.recordLoginAttempt(email, ipAddress, 'failed');
      await this.handleFailedLogin(email, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.recordLoginAttempt(email, ipAddress, 'success');

    const tokens = await this.generateTokens(user);
    const country = this.getCountryFromIp(ipAddress);

    const session = this.sessionRepository.create({
      userId: user.id,
      ipAddress,
      device: device || 'Unknown',
      browser: browser || 'Unknown',
      country,
      status: 'active',
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    await this.sessionRepository.save(session);

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    await this.auditLogService.log(user.id, 'Login Success', email, 'success', ipAddress);

    return {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        roleId: user.roleId,
        role: tokens.roleName,
        permissions: tokens.permissions,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: session.id,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const session = await this.sessionRepository.findOne({
        where: { refreshToken, status: 'active' },
      });
      if (!session) throw new UnauthorizedException('Invalid refresh token');

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      const tokens = await this.generateTokens(user);
      session.token = tokens.accessToken;
      session.refreshToken = tokens.refreshToken;
      session.lastActivity = new Date();
      await this.sessionRepository.save(session);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, sessionId: string) {
    await this.sessionRepository.update({ id: sessionId, userId }, { status: 'terminated' });
    await this.auditLogService.log(userId, 'Logout', sessionId, 'success', null);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.loginAttemptRepository.manager.query(
      `INSERT INTO password_resets (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)`,
      [uuidv4(), user.id, token, expiresAt],
    );

    await this.auditLogService.log(user.id, 'Password Reset Requested', email, 'success', null);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    this.validatePasswordPolicy(newPassword);

    const resets = await this.loginAttemptRepository.manager.query(
      `SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token],
    );
    if (!resets || resets.length === 0) throw new BadRequestException('Invalid or expired reset token');

    const passwordReset = resets[0];

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(
      { id: passwordReset.user_id },
      { passwordHash: passwordHash as any },
    );

    await this.loginAttemptRepository.manager.query(
      `UPDATE password_resets SET used = true WHERE id = $1`,
      [passwordReset.id],
    );

    await this.auditLogService.log(null, 'Password Reset Completed', null, 'success', null);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) throw new BadRequestException('Current password is incorrect');

    this.validatePasswordPolicy(newPassword);

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 12;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.save(user);

    await this.auditLogService.log(userId, 'Password Changed', userId, 'success', null);

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(user: User) {
    let roleName = '';
    let permissions: string[] = [];

    if (user.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: user.roleId },
        relations: ['rolePermissions', 'rolePermissions.permission'],
      });
      if (role) {
        roleName = role.name;
        permissions = role.rolePermissions?.map(rp => rp.permission?.name).filter(Boolean) || [];
      }
    }

    const payload = { sub: user.id, email: user.email, role: roleName, permissions };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken, roleName, permissions };
  }

  private validatePasswordPolicy(password: string) {
    if (password.length < 8) throw new BadRequestException('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) throw new BadRequestException('Password must contain an uppercase letter');
    if (!/[a-z]/.test(password)) throw new BadRequestException('Password must contain a lowercase letter');
    if (!/[0-9]/.test(password)) throw new BadRequestException('Password must contain a number');
    if (!/[!@#$%^&*]/.test(password)) throw new BadRequestException('Password must contain a symbol (!@#$%^&*)');
  }

  private async recordLoginAttempt(email: string, ipAddress: string, status: string) {
    const attempt = this.loginAttemptRepository.create({ email, ipAddress, status });
    await this.loginAttemptRepository.save(attempt);
  }

  private async handleFailedLogin(email: string, ipAddress: string) {
    const windowMinutes = this.configService.get<number>('lockout.windowMinutes') || 10;
    const maxAttempts = this.configService.get<number>('lockout.maxAttempts') || 5;
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const recentAttempts = await this.loginAttemptRepository.count({
      where: {
        email,
        status: 'failed',
        timestamp: MoreThan(windowStart),
      },
    });

    if (recentAttempts >= maxAttempts) {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user) {
        const durationMinutes = this.configService.get<number>('lockout.durationMinutes') || 15;
        user.isLocked = true;
        user.lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
        await this.userRepository.save(user);
        await this.auditLogService.log(user.id, 'Account Locked', email, 'warning', ipAddress);
      }
    }
  }

  private getCountryFromIp(ip: string): string {
    if (ip === '127.0.0.1' || ip === '::1') return 'Localhost';
    return 'Unknown';
  }
}
