import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _pwd, ...result } = user;
    return result;
  }

  async login(email: string, password: string): Promise<{ access_token: string; role: string }> {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,   // included so /me doesn't need a DB call
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.roles, 
    };
  }
}