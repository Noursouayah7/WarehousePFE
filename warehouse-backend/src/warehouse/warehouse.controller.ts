import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { RolesGuard } from '../auth_old/guards/roles.guard';
import { Roles } from '../auth_old/guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  createWarehouse(@Body() body: { name: string; surface: number; description?: string }) {
    return this.warehouseService.createWarehouse(body.name, body.surface, body.description);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN)
  findAllWarehouses() {
    return this.warehouseService.findAllWarehouses();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN)
  findOneWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.findOneWarehouse(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateWarehouse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; surface?: number; description?: string },
  ) {
    return this.warehouseService.updateWarehouse(id, body.name, body.surface, body.description);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  removeWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.removeWarehouse(id);
  }
}