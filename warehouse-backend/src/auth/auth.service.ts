import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  /**
   * Verify credentials. Returns user without password if valid, otherwise throws.
   */
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // remove password field before returning
    const { password: _pwd, ...result } = user;
    return result;
  }
}
