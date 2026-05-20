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
import { ReclamationService } from './reclamation.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { RolesGuard } from '../auth_old/guards/roles.guard';
import { Roles } from '../auth_old/guards/roles.decorator';
import { RequestUser } from '../auth/strategies/Jwt.strategy';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reclamation')
export class ReclamationController {
  constructor(private readonly reclamationService: ReclamationService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: { user: RequestUser }, @Body() dto: CreateReclamationDto) {
    return this.reclamationService.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll() {
    return this.reclamationService.findAll();
  }

  @Get('my-reclamations')
  @Roles(UserRole.CUSTOMER)
  findMyReclamations(@Request() req: { user: RequestUser }) {
    return this.reclamationService.findByCustomerId(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reclamationService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReclamationDto,
  ) {
    return this.reclamationService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reclamationService.remove(id);
  }
}
