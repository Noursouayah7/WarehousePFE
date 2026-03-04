import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()

export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // hash password before creating user
    const hashed = await bcrypt.hash(createUserDto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashed,
        },
      });
      // strip password before returning
      const { password: _pwd, ...result } = user;
      return result;
    } catch (error) {
      // detect common connection error code from Prisma
      if (error?.code === 'P1001' || /connection refused/i.test(error?.message)) {
        throw new ServiceUnavailableException('Database is unreachable');
      }
      throw error;
    }
  }

  async findAll() {
    // exclude password field
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          roles: true,
        },
      });
    } catch (error) {
      if (error?.code === 'P1001' || /connection refused/i.test(error?.message)) {
        throw new ServiceUnavailableException('Database is unreachable');
      }
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          roles: true,
        },
      });
    } catch (error) {
      if (error?.code === 'P1001' || /connection refused/i.test(error?.message)) {
        throw new ServiceUnavailableException('Database is unreachable');
      }
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // if password provided, hash it
    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
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

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * find user by email, including password for authentication
   */
  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
