import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async createWarehouse(name: string, surface: number, description?: string) {
    const existing = await this.prisma.warehouse.findFirst({ where: { name } });
    if (existing) {
      throw new ConflictException(`Warehouse "${name}" already exists`);
    }

    return this.prisma.warehouse.create({
      data: { name, surface, description },
      include: { blocks: true },
    });
  }

  findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { blocks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneWarehouse(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { blocks: true },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse #${id} not found`);
    }
    return warehouse;
  }

  async updateWarehouse(
    id: number,
    name?: string,
    surface?: number,
    description?: string,
  ) {
    await this.findOneWarehouse(id);

    if (name !== undefined) {
      const nameTaken = await this.prisma.warehouse.findFirst({ where: { name } });
      if (nameTaken && nameTaken.id !== id) {
        throw new ConflictException(`Warehouse "${name}" already exists`);
      }
    }

    const data: { name?: string; surface?: number; description?: string } = {};
    if (name !== undefined) data.name = name;
    if (surface !== undefined) data.surface = surface;
    if (description !== undefined) data.description = description;

    return this.prisma.warehouse.update({
      where: { id },
      data,
      include: { blocks: true },
    });
  }

  async removeWarehouse(id: number) {
    await this.findOneWarehouse(id);
    await this.prisma.warehouse.delete({ where: { id } });
    return { message: `Warehouse #${id} deleted successfully` };
  }
}