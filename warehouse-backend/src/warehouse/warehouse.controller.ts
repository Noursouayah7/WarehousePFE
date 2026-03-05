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
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/Jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWarehouse(
    @Body() body: { name: string; surface: number; description?: string },
  ) {
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