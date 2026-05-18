import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { Roles } from '../auth_old/guards/roles.decorator';
import { RolesGuard } from '../auth_old/guards/roles.guard';
import { RequestUser } from '../auth/strategies/Jwt.strategy';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  movements(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : 50;
    return this.inventoryService.findAll(Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50);
  }

  @Post('stock-in')
  stockIn(@Request() req: { user: RequestUser }, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.stockIn(dto, req.user.id);
  }

  @Post('stock-out')
  stockOut(@Request() req: { user: RequestUser }, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.stockOut(dto, req.user.id);
  }

  @Post('restock')
  restock(@Request() req: { user: RequestUser }, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.restock(dto, req.user.id);
  }

  @Post('damage')
  damage(@Request() req: { user: RequestUser }, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.damage(dto, req.user.id);
  }

  @Post('transfer')
  transfer(@Request() req: { user: RequestUser }, @Body() dto: TransferInventoryDto) {
    return this.inventoryService.transfer(dto, req.user.id);
  }
}