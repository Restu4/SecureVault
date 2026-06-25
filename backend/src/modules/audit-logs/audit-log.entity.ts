import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 255, nullable: true })
  target: string;

  @Column({ length: 50, default: 'success' })
  status: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => User, user => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
