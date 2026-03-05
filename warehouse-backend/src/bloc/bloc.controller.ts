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
import { BlocService } from './bloc.service';
import { JwtAuthGuard } from '../auth/Jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('warehouse/:warehouseId/bloc')
export class BlocController {
  constructor(private readonly blocService: BlocService) {}

  // POST /warehouses/:warehouseId/blocs
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Body() body: { name: string; capacity: number },
  ) {
    return this.blocService.create(warehouseId, body.name, body.capacity);
  }

  // GET /warehouses/:warehouseId/blocs
  @Get()
  findAll(@Param('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.blocService.findAll(warehouseId);
  }

  // GET /warehouses/:warehouseId/blocs/:id
  @Get(':id')
  findOne(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.blocService.findOne(warehouseId, id);
  }

  // PATCH /warehouses/:warehouseId/blocs/:id
  @Patch(':id')
  update(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; capacity?: number },
  ) {
    return this.blocService.update(warehouseId, id, body.name, body.capacity);
  }

  // DELETE /warehouses/:warehouseId/blocs/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.blocService.remove(warehouseId, id);
  }
}