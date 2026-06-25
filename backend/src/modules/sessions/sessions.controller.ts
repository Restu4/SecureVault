import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Req } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get('my')
  async findMySessions(@Req() req: any) {
    return this.sessionsService.findByUser(req.user.id);
  }

  @Get('all')
  @Roles('Super Admin', 'Admin')
  @Permissions('manage_sessions')
  async findAllActive() {
    return this.sessionsService.findAllActive();
  }

  @Post(':id/terminate')
  async terminate(@Param('id') id: string) {
    return this.sessionsService.terminate(id);
  }

  @Post(':id/force-logout')
  @Roles('Super Admin', 'Admin')
  @Permissions('manage_sessions')
  async forceLogout(@Param('id') id: string) {
    return this.sessionsService.forceLogout(id);
  }

  @Get('count')
  async getActiveCount() {
    const count = await this.sessionsService.getActiveCount();
    return { activeSessions: count };
  }
}
