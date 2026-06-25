import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { AuditLog } from '../audit-logs/audit-log.entity';
import { LoginAttempt } from './login-attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, AuditLog, LoginAttempt])],
  controllers: [SecurityController],
})
export class SecurityModule {}
