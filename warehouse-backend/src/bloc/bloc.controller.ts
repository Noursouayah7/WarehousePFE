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
import { BlocService } from './bloc.service';
import { JwtAuthGuard } from '../auth/guards/Jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER) // TECHNICIEN cannot manage blocs
@Controller('warehouses/:warehouseId/blocs')
export class BlocController {
  constructor(private readonly blocService: BlocService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Body() body: { name: string; capacity: number },
  ) {
    return this.blocService.create(warehouseId, body.name, body.capacity);
  }

  @Get()
  findAll(@Param('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.blocService.findAll(warehouseId);
  }

  @Get(':id')
  findOne(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.blocService.findOne(warehouseId, id);
  }

  @Patch(':id')
  update(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; capacity?: number },
  ) {
    return this.blocService.update(warehouseId, id, body.name, body.capacity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.blocService.remove(warehouseId, id);
  }
}