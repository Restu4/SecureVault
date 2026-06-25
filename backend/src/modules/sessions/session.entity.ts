import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  device: string;

  @Column({ length: 255, nullable: true })
  browser: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ name: 'token', type: 'text' })
  token: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string;

  @CreateDateColumn({ name: 'login_time' })
  loginTime: Date;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity: Date;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
