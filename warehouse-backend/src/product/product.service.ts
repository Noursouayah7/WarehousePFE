import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async findBloc(blocId: number) {
    const bloc = await this.prisma.bloc.findUnique({ where: { id: blocId } });
    if (!bloc) {
      throw new NotFoundException(`Bloc #${blocId} not found`);
    }
    return bloc;
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  async create(dto: CreateProductDto) {
    const bloc = await this.findBloc(dto.blocId);

    // Check duplicate product name within the same bloc
    const existing = await this.prisma.product.findFirst({
      where: { name: dto.name, blocId: dto.blocId },
    });
    if (existing) {
      throw new ConflictException(
        `Product "${dto.name}" already exists in bloc #${dto.blocId}`,
      );
    }

    // Check bloc capacity before adding
    const incomingQuantity = dto.quantity ?? 0;
    if (bloc.currentUsage + incomingQuantity > bloc.capacity) {
      throw new BadRequestException(
        `Not enough capacity in bloc #${dto.blocId}. Available: ${bloc.capacity - bloc.currentUsage}, requested: ${incomingQuantity}`,
      );
    }

    // Create product and update bloc currentUsage in a transaction
    const product = await this.prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          quantity: incomingQuantity,
          blocId: dto.blocId,
        },
      });
      await tx.bloc.update({
        where: { id: dto.blocId },
        data: { currentUsage: { increment: incomingQuantity } },
      });
      return newProduct;
    });

    return this.prisma.product.findUnique({
      where: { id: product.id },
      include: { bloc: true },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { bloc: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { bloc: true },
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async findByBloc(blocId: number) {
    await this.findBloc(blocId);
    return this.prisma.product.findMany({
      where: { blocId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    // If quantity is being changed, update bloc currentUsage accordingly
    if (dto.quantity !== undefined && dto.quantity !== product.quantity) {
      const bloc = await this.findBloc(product.blocId);
      const diff = dto.quantity - product.quantity;

      if (bloc.currentUsage + diff > bloc.capacity) {
        throw new BadRequestException(
          `Not enough capacity in bloc #${product.blocId}. Available: ${bloc.capacity - bloc.currentUsage}, requested increase: ${diff}`,
        );
      }

      const [updated] = await this.prisma.$transaction([
        this.prisma.product.update({
          where: { id },
          data: dto,
          include: { bloc: true },
        }),
        this.prisma.bloc.update({
          where: { id: product.blocId },
          data: { currentUsage: { increment: diff } },
        }),
      ]);

      return updated;
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { bloc: true },
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    // Free up the bloc capacity when product is deleted
    await this.prisma.$transaction([
      this.prisma.product.delete({ where: { id } }),
      this.prisma.bloc.update({
        where: { id: product.blocId },
        data: { currentUsage: { decrement: product.quantity } },
      }),
    ]);

    return { message: `Product #${id} deleted successfully` };
  }
}