import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryOperationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly movementInclude = {
    product: true,
    sourceBloc: { include: { warehouse: true } },
    destinationBloc: { include: { warehouse: true } },
    order: true,
    shipment: true,
    technician: {
      select: { id: true, name: true, email: true },
    },
  } as const;

  findAll(limit = 50) {
    return this.prisma.inventoryMovement.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: this.movementInclude,
    });
  }

  stockIn(dto: AdjustInventoryDto, technicianId?: number) {
    return this.adjustStock(dto, technicianId, InventoryOperationType.STOCK_IN);
  }

  stockOut(dto: AdjustInventoryDto, technicianId?: number) {
    return this.adjustStock(dto, technicianId, InventoryOperationType.STOCK_OUT);
  }

  restock(dto: AdjustInventoryDto, technicianId?: number) {
    return this.adjustStock(dto, technicianId, InventoryOperationType.RESTOCK);
  }

  damage(dto: AdjustInventoryDto, technicianId?: number) {
    return this.adjustStock(dto, technicianId, InventoryOperationType.DAMAGE);
  }

  transfer(dto: TransferInventoryDto, technicianId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const sourceProduct = await tx.product.findUnique({
        where: { id: dto.productId },
        include: { bloc: true },
      });

      if (!sourceProduct) {
        throw new NotFoundException(`Product #${dto.productId} not found`);
      }

      if (sourceProduct.blocId === dto.destinationBlocId) {
        throw new BadRequestException('Source and destination blocs must be different');
      }

      if (dto.quantity > sourceProduct.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${sourceProduct.name}. Available: ${sourceProduct.quantity}, requested: ${dto.quantity}`,
        );
      }

      const destinationBloc = await tx.bloc.findUnique({ where: { id: dto.destinationBlocId } });
      if (!destinationBloc) {
        throw new NotFoundException(`Bloc #${dto.destinationBlocId} not found`);
      }

      if (destinationBloc.currentUsage + dto.quantity > destinationBloc.capacity) {
        throw new BadRequestException(
          `Not enough capacity in bloc #${destinationBloc.id}. Available: ${destinationBloc.capacity - destinationBloc.currentUsage}, incoming: ${dto.quantity}`,
        );
      }

      await tx.product.update({
        where: { id: sourceProduct.id },
        data: { quantity: { decrement: dto.quantity } },
      });

      const destinationProduct = await tx.product.findFirst({
        where: {
          blocId: dto.destinationBlocId,
          name: { equals: sourceProduct.name, mode: 'insensitive' },
        },
      });

      if (destinationProduct) {
        await tx.product.update({
          where: { id: destinationProduct.id },
          data: { quantity: { increment: dto.quantity } },
        });
      } else {
        await tx.product.create({
          data: {
            name: sourceProduct.name,
            description: sourceProduct.description,
            price: sourceProduct.price,
            quantity: dto.quantity,
            blocId: dto.destinationBlocId,
          },
        });
      }

      await tx.bloc.update({
        where: { id: sourceProduct.blocId },
        data: { currentUsage: { decrement: dto.quantity } },
      });

      await tx.bloc.update({
        where: { id: dto.destinationBlocId },
        data: { currentUsage: { increment: dto.quantity } },
      });

      return tx.inventoryMovement.create({
        data: {
          productId: sourceProduct.id,
          productName: sourceProduct.name,
          quantity: dto.quantity,
          operationType: InventoryOperationType.TRANSFER,
          sourceBlocId: sourceProduct.blocId,
          destinationBlocId: dto.destinationBlocId,
          technicianId: technicianId ?? null,
          note: dto.note ?? null,
        },
        include: this.movementInclude,
      });
    });
  }

  private async adjustStock(dto: AdjustInventoryDto, technicianId: number | undefined, operationType: InventoryOperationType) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
        include: { bloc: true },
      });

      if (!product) {
        throw new NotFoundException(`Product #${dto.productId} not found`);
      }

      if (operationType === InventoryOperationType.STOCK_IN || operationType === InventoryOperationType.RESTOCK) {
        if (product.bloc.currentUsage + dto.quantity > product.bloc.capacity) {
          throw new BadRequestException(
            `Not enough capacity in bloc #${product.blocId}. Available: ${product.bloc.capacity - product.bloc.currentUsage}, incoming: ${dto.quantity}`,
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: { quantity: { increment: dto.quantity } },
        });

        await tx.bloc.update({
          where: { id: product.blocId },
          data: { currentUsage: { increment: dto.quantity } },
        });
      } else {
        if (product.quantity < dto.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${product.name}. Available: ${product.quantity}, requested: ${dto.quantity}`,
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: { quantity: { decrement: dto.quantity } },
        });

        await tx.bloc.update({
          where: { id: product.blocId },
          data: { currentUsage: { decrement: dto.quantity } },
        });
      }

      return tx.inventoryMovement.create({
        data: {
          productId: product.id,
          productName: product.name,
          quantity: dto.quantity,
          operationType,
          sourceBlocId: operationType === InventoryOperationType.STOCK_IN || operationType === InventoryOperationType.RESTOCK ? null : product.blocId,
          destinationBlocId: operationType === InventoryOperationType.STOCK_OUT || operationType === InventoryOperationType.DAMAGE ? null : product.blocId,
          technicianId: technicianId ?? null,
          note: dto.note ?? null,
        },
        include: this.movementInclude,
      });
    });
  }
}