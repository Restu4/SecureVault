import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async findByUser(userId: string) {
    return this.sessionRepository.find({
      where: { userId },
      order: { loginTime: 'DESC' },
    });
  }

  async findAllActive() {
    return this.sessionRepository.find({
      where: { status: 'active' },
      relations: ['user'],
      order: { lastActivity: 'DESC' },
    });
  }

  async terminate(sessionId: string) {
    await this.sessionRepository.update({ id: sessionId }, { status: 'terminated' });
    return { message: 'Session terminated' };
  }

  async forceLogout(sessionId: string) {
    await this.sessionRepository.update({ id: sessionId }, { status: 'force_logout' });
    return { message: 'Session force logged out' };
  }

  async getActiveCount() {
    return this.sessionRepository.count({ where: { status: 'active' } });
  }

  async cleanupExpired() {
    const expired = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.sessionRepository.delete({
      status: 'active',
      lastActivity: LessThan(expired),
    });
  }
}
