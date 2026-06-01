import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { Roles } from '../auth_old/guards/roles.decorator';
import { RolesGuard } from '../auth_old/guards/roles.guard';
import { RequestUser } from '../auth/strategies/Jwt.strategy';
import { CreateRestockAlertDto } from './dto/create-restock-alert.dto';
import { ExecuteRestockAlertDto } from './dto/execute-restock-alert.dto';
import { UpdateRestockAlertLocationDto } from './dto/update-restock-alert-location.dto';
import { RestockAlertsService } from './restock-alerts.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN)
@Controller('restock-alerts')
export class RestockAlertsController {
  constructor(private readonly restockAlertsService: RestockAlertsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Request() req: { user: RequestUser }, @Body() dto: CreateRestockAlertDto) {
    return this.restockAlertsService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.restockAlertsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restockAlertsService.findOne(id);
  }

  @Patch(':id/location')
  updateLocation(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRestockAlertLocationDto) {
    return this.restockAlertsService.updateLocation(id, dto);
  }

  @Patch(':id/confirm-restock')
  confirmRestock(@Request() req: { user: RequestUser }, @Param('id', ParseIntPipe) id: number, @Body() dto: ExecuteRestockAlertDto) {
    return this.restockAlertsService.confirmRestock(id, dto, req.user.id);
  }

  @Patch(':id/transfer')
  transfer(@Request() req: { user: RequestUser }, @Param('id', ParseIntPipe) id: number, @Body() dto: ExecuteRestockAlertDto) {
    return this.restockAlertsService.transfer(id, dto, req.user.id);
  }

  @Patch(':id/complete')
  complete(@Request() req: { user: RequestUser }, @Param('id', ParseIntPipe) id: number) {
    return this.restockAlertsService.complete(id, req.user.id);
  }
}