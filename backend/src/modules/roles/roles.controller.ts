import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @Permissions('view_roles')
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('view_roles')
  async findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @Roles('Super Admin')
  @Permissions('manage_roles')
  async create(@Body() data: { name: string; description?: string }) {
    return this.rolesService.create(data);
  }

  @Put(':id')
  @Roles('Super Admin')
  @Permissions('manage_roles')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @Permissions('manage_roles')
  async delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }

  @Post(':roleId/permissions/:permissionId')
  @Roles('Super Admin')
  @Permissions('manage_roles')
  async assignPermission(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rolesService.assignPermission(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @Roles('Super Admin')
  @Permissions('manage_roles')
  async removePermission(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rolesService.removePermission(roleId, permissionId);
  }
}
