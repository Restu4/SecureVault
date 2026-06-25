import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async findAll() {
    return this.roleRepository.find({ relations: ['rolePermissions', 'rolePermissions.permission'] });
  }

  async findById(id: string) {
    return this.roleRepository.findOne({ where: { id }, relations: ['rolePermissions', 'rolePermissions.permission'] });
  }

  async create(data: { name: string; description?: string }) {
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }

  async update(id: string, data: Partial<Role>) {
    await this.roleRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.rolePermissionRepository.delete({ roleId: id });
    await this.roleRepository.delete(id);
    return { message: 'Role deleted' };
  }

  async assignPermission(roleId: string, permissionId: string) {
    const rp = this.rolePermissionRepository.create({ roleId, permissionId });
    return this.rolePermissionRepository.save(rp);
  }

  async removePermission(roleId: string, permissionId: string) {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
    return { message: 'Permission removed from role' };
  }
}
