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
  Request,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { RolesGuard } from '../auth_old/guards/roles.guard';
import { Roles } from '../auth_old/guards/roles.decorator';
import { RequestUser } from '../auth/strategies/Jwt.strategy';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIEN) // all 3 roles can manage products
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: { user: RequestUser }, @Body() dto: CreateProductDto) {
    return this.productService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('bloc/:blocId')
  findByBloc(@Param('blocId', ParseIntPipe) blocId: number) {
    return this.productService.findByBloc(blocId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Request() req: { user: RequestUser }, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Request() req: { user: RequestUser }, @Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id, req.user.id);
  }
}