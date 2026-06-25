import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Permissions('view_users')
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.usersService.findAll(page || 1, limit || 10, search);
  }

  @Get(':id')
  @Permissions('view_users')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('Super Admin', 'Admin')
  @Permissions('create_user')
  async create(@Body() data: { fullname: string; email: string; password: string; roleId?: string }) {
    return this.usersService.create(data);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin')
  @Permissions('edit_user')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Put(':id/deactivate')
  @Roles('Super Admin', 'Admin')
  @Permissions('deactivate_user')
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @Permissions('delete_user')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get('stats/summary')
  @Permissions('view_users')
  async getStats() {
    return this.usersService.getStats();
  }
}
