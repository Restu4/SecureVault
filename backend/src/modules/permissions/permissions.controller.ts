import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @Permissions('view_permissions')
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('view_permissions')
  async findById(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @Post()
  @Roles('Super Admin')
  @Permissions('manage_permissions')
  async create(@Body() data: { name: string; description?: string }) {
    return this.permissionsService.create(data);
  }

  @Put(':id')
  @Roles('Super Admin')
  @Permissions('manage_permissions')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.permissionsService.update(id, data);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @Permissions('manage_permissions')
  async delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }
}
