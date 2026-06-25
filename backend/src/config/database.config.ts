import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Permission } from '../modules/permissions/permission.entity';
import { RolePermission } from '../modules/roles/role-permission.entity';
import { Session } from '../modules/sessions/session.entity';
import { AuditLog } from '../modules/audit-logs/audit-log.entity';
import { PasswordReset } from '../modules/password/password-reset.entity';
import { LoginAttempt } from '../modules/security/login-attempt.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5434', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'securevault',
  entities: [
    User,
    Role,
    Permission,
    RolePermission,
    Session,
    AuditLog,
    PasswordReset,
    LoginAttempt,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
});
