import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarehouseService } from '../warehouse/warehouse.service';

@Injectable()
export class BlocService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}

  async create(warehouseId: number, name: string, capacity: number) {
    await this.warehouseService.findOneWarehouse(warehouseId); // 404 if not found

    const existing = await this.prisma.bloc.findFirst({
      where: { name, warehouseId },
    });
    if (existing) {
      throw new ConflictException(`Bloc "${name}" already exists in this warehouse`);
    }

    return this.prisma.bloc.create({
      data: { name, capacity, warehouseId },
    });
  }
  
  async findAll(warehouseId: number) {
    await this.warehouseService.findOneWarehouse(warehouseId); // 404 if not found

    return this.prisma.bloc.findMany({
      where: { warehouseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(warehouseId: number, id: number) {
    await this.warehouseService.findOneWarehouse(warehouseId); // 404 if not found

    const bloc = await this.prisma.bloc.findUnique({ where: { id } });
    if (!bloc) {
      throw new NotFoundException(`Bloc #${id} not found`);
    }
    return bloc;
  }

  async update(warehouseId: number, id: number, name?: string, capacity?: number) {
    const bloc = await this.findOne(warehouseId, id);

    if (capacity !== undefined && capacity < bloc.currentUsage) {
      throw new BadRequestException(
        `Capacity (${capacity}) cannot be less than current usage (${bloc.currentUsage})`,
      );
    }

    if (name) {
      const nameTaken = await this.prisma.bloc.findFirst({
        where: { name, warehouseId },
      });
      if (nameTaken && nameTaken.id !== id) {
        throw new ConflictException(`Bloc "${name}" already exists in this warehouse`);
      }
    }

    return this.prisma.bloc.update({
      where: { id },
      data: { name, capacity },
    });
  }

  async remove(warehouseId: number, id: number) {
    await this.findOne(warehouseId, id);
    await this.prisma.bloc.delete({ where: { id } });
    return { message: `Bloc #${id} deleted successfully` };
  }
}