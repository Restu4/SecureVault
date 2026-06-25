import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Session } from '../sessions/session.entity';
import { AuditLog } from '../audit-logs/audit-log.entity';
import { PasswordReset } from '../password/password-reset.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  fullname: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @OneToMany(() => Session, (session: Session) => session.user)
  sessions: Session[];

  @OneToMany(() => AuditLog, (log: AuditLog) => log.user)
  auditLogs: AuditLog[];

  @OneToMany(() => PasswordReset, (reset: PasswordReset) => reset.user)
  passwordResets: PasswordReset[];
}
