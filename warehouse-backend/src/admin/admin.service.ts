import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { ...dto, password: hashed },
      });
      const { password: _pwd, ...result } = user;
      return result;
    } catch (error) {
      if (error?.code === 'P1001' || /connection refused/i.test(error?.message)) {
        throw new ServiceUnavailableException('Database is unreachable');
      }
      throw error;
    }
  }

  async findAllUsers() {
    try {
      return await this.prisma.user.findMany({
        select: { id: true, email: true, name: true, address: true, phone: true, cin: true, roles: true, createdAt: true, updatedAt: true },
      });
    } catch (error) {
      if (error?.code === 'P1001' || /connection refused/i.test(error?.message)) {
        throw new ServiceUnavailableException('Database is unreachable');
      }
      throw error;
    }
  }

  async findOneUser(id: number) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, address: true, phone: true, cin: true, roles: true, createdAt: true, updatedAt: true },
      });
    } catch (error) {
      if (error?.code === 'P1001' || /connection refused/i.test(error?.message)) {
        throw new ServiceUnavailableException('Database is unreachable');
      }
      throw error;
    }
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      const { password: _pwd, ...result } = user;
      return result;
    } catch (error) {
      if (error?.code === 'P1001' || /connection refused/i.test(error?.message)) {
        throw new ServiceUnavailableException('Database is unreachable');
      }
      throw error;
    }
  }

  removeUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
