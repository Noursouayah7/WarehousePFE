import { Controller, Post, Get, Patch, Body, HttpCode, HttpStatus, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth_old/guards/Jwt.auth.guard';
import { RequestUser } from '../auth_old/strategies/Jwt.strategy';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Public — no JWT guard
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: CreateUserDto) {
    return this.userService.create({
      ...dto,
      roles: UserRole.PENDING,
    });
  }

  // Protected — requires JWT
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: RequestUser }) {
    return this.userService.findOne(req.user.id);
  }

  // Protected — requires JWT
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Request() req: { user: RequestUser },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, dto);
  }

  // Get user by ID (admin only, optional for now)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
}