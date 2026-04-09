import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { Roles } from '../auth_old/guards/roles.decorator';
import { RolesGuard } from '../auth_old/guards/roles.guard';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ReceiveShipmentDto } from './dto/receive-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ShipmentService } from './shipment.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('shipments')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentService.create(dto);
  }

  @Get()
  findAll() {
    return this.shipmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto) {
    return this.shipmentService.update(id, dto);
  }

  @Patch(':id/in-transit')
  markInTransit(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.markInTransit(id);
  }

  @Patch(':id/receive')
  receive(@Param('id', ParseIntPipe) id: number, @Body() dto: ReceiveShipmentDto) {
    return this.shipmentService.receive(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.remove(id);
  }
}
