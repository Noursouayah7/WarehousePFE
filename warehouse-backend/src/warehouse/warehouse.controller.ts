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
import { JwtAuthGuard } from '../auth/guards/Jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER) // TECHNICIEN cannot manage warehouses
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWarehouse(@Body() body: { name: string; surface: number; description?: string }) {
    return this.warehouseService.createWarehouse(body.name, body.surface, body.description);
  }

  @Get()
  findAllWarehouses() {
    return this.warehouseService.findAllWarehouses();
  }

  @Get(':id')
  findOneWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.findOneWarehouse(id);
  }

  @Patch(':id')
  updateWarehouse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; surface?: number; description?: string },
  ) {
    return this.warehouseService.updateWarehouse(id, body.name, body.surface, body.description);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  removeWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.removeWarehouse(id);
  }
}