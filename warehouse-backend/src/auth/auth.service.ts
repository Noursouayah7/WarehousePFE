import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async registerCustomer(dto: CustomerRegisterDto) {
		return this.userService.create({
			...dto,
			roles: UserRole.CUSTOMER,
		});
	}

	async validateUser(email: string, password: string) {
		const user = await this.userService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Wrong email');
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			throw new UnauthorizedException('Wrong password');
		}

		const { password: _pwd, ...result } = user;
		return result;
	}

	async login(email: string, password: string): Promise<{ access_token: string; role: string }> {
		const user = await this.validateUser(email, password);

		const payload = {
			sub: user.id,
			email: user.email,
			name: user.name,
			phone: user.phone,
			roles: user.roles,
		};

		return {
			access_token: this.jwtService.sign(payload),
			role: user.roles,
		};
	}
}
