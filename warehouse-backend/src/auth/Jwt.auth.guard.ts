import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Usage: @UseGuards(JwtAuthGuard) on any controller or route
// Passport will call JwtStrategy.validate() automatically.
// If the token is missing or invalid → 401 Unauthorized (automatic).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}