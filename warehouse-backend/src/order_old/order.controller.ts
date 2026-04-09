import {
  Body,
  Controller,
  Get,
  Request,
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
import { RequestUser } from '../auth_old/strategies/Jwt.strategy';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateRestockRequestDto } from './dto/create-restock-request.dto';
import { OrderNoteDto } from './dto/order-note.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  create(@Request() req: { user: RequestUser }, @Body() dto: CreateOrderDto) {
    return this.orderService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get(':id/tracking')
  tracking(@Request() req: { user: RequestUser }, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.tracking(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @Body() dto: OrderNoteDto) {
    return this.orderService.approve(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Body() dto: RejectOrderDto) {
    return this.orderService.reject(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post(':id/restock-request')
  createRestockRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRestockRequestDto,
  ) {
    return this.orderService.createRestockRequest(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id/delivered')
  markDelivered(@Param('id', ParseIntPipe) id: number, @Body() dto: OrderNoteDto) {
    return this.orderService.markDelivered(id, dto);
  }
}
