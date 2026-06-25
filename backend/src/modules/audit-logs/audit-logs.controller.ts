import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  @Roles('Super Admin', 'Auditor')
  @Permissions('view_audit_logs')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('status') status?: string,
  ) {
    return this.auditLogService.findAll(page || 1, limit || 20, { userId, action, status });
  }

  @Get('failed-today')
  @Roles('Super Admin', 'Auditor')
  async getFailedLoginsToday() {
    const count = await this.auditLogService.getFailedLoginsToday();
    return { failedToday: count };
  }

  @Get('recent')
  async getRecentEvents(@Query('limit') limit?: number) {
    return this.auditLogService.getRecentEvents(limit || 10);
  }
}
