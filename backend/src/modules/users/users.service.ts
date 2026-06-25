import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const query = this.userRepository.createQueryBuilder('user');
    if (search) {
      query.where('user.fullname ILIKE :search OR user.email ILIKE :search', {
        search: `%${search}%`,
      });
    }
    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();
    return { users: users.map(u => ({ ...u, passwordHash: undefined })), total, page, limit };
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) delete (user as any).passwordHash;
    return user;
  }

  async create(data: { fullname: string; email: string; password: string; roleId?: string }) {
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);
    const user = new User();
    user.fullname = data.fullname;
    user.email = data.email;
    user.passwordHash = passwordHash;
    user.roleId = data.roleId || null as any;
    user.status = 'active';
    return this.userRepository.save(user).then(u => ({ ...u, passwordHash: undefined }));
  }

  async update(id: string, data: Partial<User>) {
    if (data.passwordHash) {
      const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 12;
      const hash = await bcrypt.hash(data.passwordHash as string, saltRounds);
      data.passwordHash = hash;
    }
    await this.userRepository.update(id, data as any);
    return this.findById(id);
  }

  async deactivate(id: string) {
    await this.userRepository.update(id, { status: 'inactive' });
    return this.findById(id);
  }

  async delete(id: string) {
    await this.userRepository.delete(id);
    return { message: 'User deleted' };
  }

  async getStats() {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { status: 'active' } });
    const locked = await this.userRepository.count({ where: { isLocked: true } });
    return { total, active, locked };
  }
}
