import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAll() {
    return this.permissionRepository.find();
  }

  async findById(id: string) {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async create(data: { name: string; description?: string }) {
    const permission = this.permissionRepository.create(data);
    return this.permissionRepository.save(permission);
  }

  async update(id: string, data: Partial<Permission>) {
    await this.permissionRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.permissionRepository.delete(id);
    return { message: 'Permission deleted' };
  }
}
