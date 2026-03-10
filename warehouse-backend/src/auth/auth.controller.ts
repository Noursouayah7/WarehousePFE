import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/Jwt.auth.guard';
import { RequestUser } from './strategies/Jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  
  // No DB call needed — data is decoded directly from the token
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: RequestUser }) {
    return req.user;
  }
}