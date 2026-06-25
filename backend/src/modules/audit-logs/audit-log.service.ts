import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(userId: string | null, action: string, target: string | null, status: string, ipAddress: string | null, metadata?: object) {
    const log = new AuditLog();
    log.userId = userId || null as any;
    log.action = action;
    log.target = target || null as any;
    log.status = status;
    log.ipAddress = ipAddress || null as any;
    log.metadata = metadata || null as any;
    return this.auditLogRepository.save(log);
  }

  async findAll(page = 1, limit = 20, filters?: { userId?: string; action?: string; status?: string; from?: Date; to?: Date }) {
    const query = this.auditLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.timestamp', 'DESC');

    if (filters?.userId) query.andWhere('log.userId = :userId', { userId: filters.userId });
    if (filters?.action) query.andWhere('log.action ILIKE :action', { action: `%${filters.action}%` });
    if (filters?.status) query.andWhere('log.status = :status', { status: filters.status });
    if (filters?.from) query.andWhere('log.timestamp >= :from', { from: filters.from });
    if (filters?.to) query.andWhere('log.timestamp <= :to', { to: filters.to });

    const [logs, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { logs, total, page, limit };
  }

  async getFailedLoginsToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.auditLogRepository.count({
      where: {
        action: 'Login Failed',
        timestamp: Between(today, new Date()),
      },
    });
  }

  async getRecentEvents(limit = 10) {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
