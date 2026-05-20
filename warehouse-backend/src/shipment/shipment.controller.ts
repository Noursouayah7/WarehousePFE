import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/Jwt.auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '../auth/strategies/Jwt.strategy';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ReceiveShipmentDto } from './dto/receive-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ShipmentService } from './shipment.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Request() req: { user: RequestUser }, @Body() dto: CreateShipmentDto) {
    return this.shipmentService.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll() {
    return this.shipmentService.findAll();
  }

  @Get('my-shipments')
  @Roles(UserRole.CUSTOMER)
  findMyShipments(@Request() req: { user: RequestUser }) {
    return this.shipmentService.findByCustomerId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto) {
    return this.shipmentService.update(id, dto);
  }

  @Patch(':id/in-transit')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  markInTransit(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.markInTransit(id);
  }

  @Patch(':id/receive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN)
  receive(@Request() req: { user: RequestUser }, @Param('id', ParseIntPipe) id: number, @Body() dto: ReceiveShipmentDto) {
    return this.shipmentService.receive(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.remove(id);
  }
}
