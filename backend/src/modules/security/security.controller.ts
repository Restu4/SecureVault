import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { AuditLog } from '../audit-logs/audit-log.entity';
import { LoginAttempt } from './login-attempt.entity';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('security')
export class SecurityController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(LoginAttempt)
    private loginAttemptRepository: Repository<LoginAttempt>,
  ) {}

  @Get('dashboard')
  @Roles('Super Admin', 'Admin', 'Auditor')
  async getDashboard() {
    const totalUsers = await this.userRepository.count();
    const activeSessions = await this.sessionRepository.count({ where: { status: 'active' } });
    const lockedAccounts = await this.userRepository.count({ where: { isLocked: true } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const failedLoginsToday = await this.loginAttemptRepository.count({
      where: { status: 'failed', timestamp: today },
    });

    const recentEvents = await this.auditLogRepository.find({
      relations: ['user'],
      order: { timestamp: 'DESC' },
      take: 10,
    });

    const securityScore = this.calculateSecurityScore(totalUsers, lockedAccounts, failedLoginsToday, activeSessions);

    return {
      totalUsers,
      activeSessions,
      failedLoginsToday,
      lockedAccounts,
      recentEvents,
      securityScore,
    };
  }

  @Get('analytics')
  @Roles('Super Admin', 'Admin', 'Auditor')
  async getAnalytics() {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const failedLoginTrend = await this.loginAttemptRepository
      .createQueryBuilder('la')
      .select("DATE(la.timestamp)", 'date')
      .addSelect("COUNT(*)", 'count')
      .where('la.status = :status', { status: 'failed' })
      .andWhere('la.timestamp >= :from', { from: last7Days })
      .groupBy('DATE(la.timestamp)')
      .orderBy('DATE(la.timestamp)', 'ASC')
      .getRawMany();

    const roleDistribution = await this.userRepository
      .createQueryBuilder('u')
      .select('u.role_id', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role_id')
      .getRawMany();

    const activeUsersByDay = await this.loginAttemptRepository
      .createQueryBuilder('la')
      .select("DATE(la.timestamp)", 'date')
      .addSelect("COUNT(DISTINCT la.email)", 'count')
      .where('la.status = :status', { status: 'success' })
      .andWhere('la.timestamp >= :from', { from: last7Days })
      .groupBy('DATE(la.timestamp)')
      .orderBy('DATE(la.timestamp)', 'ASC')
      .getRawMany();

    const securityEvents = await this.auditLogRepository
      .createQueryBuilder('log')
      .select("DATE(log.timestamp)", 'date')
      .addSelect("COUNT(*)", 'count')
      .where('log.status = :status', { status: 'warning' })
      .andWhere('log.timestamp >= :from', { from: last7Days })
      .groupBy('DATE(log.timestamp)')
      .orderBy('DATE(log.timestamp)', 'ASC')
      .getRawMany();

    const topCountries = await this.sessionRepository
      .createQueryBuilder('s')
      .select('s.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('s.status = :status', { status: 'active' })
      .groupBy('s.country')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      failedLoginTrend,
      roleDistribution,
      activeUsersByDay,
      securityEvents,
      topCountries,
    };
  }

  private calculateSecurityScore(totalUsers: number, lockedAccounts: number, failedLogins: number, activeSessions: number): number {
    let score = 100;
    if (totalUsers > 0) {
      score -= (lockedAccounts / totalUsers) * 20;
    }
    score -= Math.min(failedLogins * 2, 30);
    score -= Math.min(activeSessions * 0.1, 10);
    return Math.max(0, Math.round(score));
  }
}
