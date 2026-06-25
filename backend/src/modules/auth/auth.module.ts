import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { AuditLog } from '../audit-logs/audit-log.entity';
import { LoginAttempt } from '../security/login-attempt.entity';
import { Role } from '../roles/role.entity';
import { RolePermission } from '../roles/role-permission.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../common/guards/jwt.strategy';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, AuditLog, LoginAttempt, Role, RolePermission]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessExpiresIn'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditLogService],
  exports: [AuthService],
})
export class AuthModule {}
