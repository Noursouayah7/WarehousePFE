import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/Jwt.auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '../auth/strategies/Jwt.strategy';
import { BiService } from './bi.service';

@Controller('bi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get('admin-summary')
  @Roles(UserRole.ADMIN)
  adminSummary() {
    return this.biService.summary('ADMIN');
  }

  @Get('manager-summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  managerSummary() {
    return this.biService.summary('MANAGER');
  }

  @Get('technician-summary')
  @Roles(UserRole.TECHNICIEN)
  technicianSummary(@Req() req: { user: RequestUser }) {
    return this.biService.summary('TECHNICIEN', req.user.id);
  }
}
