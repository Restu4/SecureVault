import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ length: 50 })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
