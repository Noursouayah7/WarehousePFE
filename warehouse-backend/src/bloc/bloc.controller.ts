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
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { RolesGuard } from '../auth_old/guards/roles.guard';
import { Roles } from '../auth_old/guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouses/:warehouseId/blocs')
export class BlocController {
  constructor(private readonly blocService: BlocService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Body() body: { name: string; capacity: number },
  ) {
    return this.blocService.create(warehouseId, body.name, body.capacity);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN)
  findAll(@Param('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.blocService.findAll(warehouseId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN)
  findOne(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.blocService.findOne(warehouseId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; capacity?: number },
  ) {
    return this.blocService.update(warehouseId, id, body.name, body.capacity);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.blocService.remove(warehouseId, id);
  }
}