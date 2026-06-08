import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryOperationType, RestockAlertStatus, RestockPriority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestockAlertDto } from './dto/create-restock-alert.dto';
import { ExecuteRestockAlertDto } from './dto/execute-restock-alert.dto';
import { UpdateRestockAlertLocationDto } from './dto/update-restock-alert-location.dto';

@Injectable()
export class RestockAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly alertInclude = {
    product: true,
    warehouse: true,
    bloc: { include: { warehouse: true } },
    manager: { select: { id: true, name: true, email: true } },
    technician: { select: { id: true, name: true, email: true } },
    inventoryMovements: {
      include: {
        product: true,
        sourceBloc: { include: { warehouse: true } },
        destinationBloc: { include: { warehouse: true } },
        technician: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    },
  } as const;

  findAll() {
    return this.prisma.restockAlert.findMany({
      include: this.alertInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateRestockAlertDto, managerId?: number) {
    const warehouse = await this.prisma.warehouse.findUniqueOrThrow({ where: { id: dto.warehouseId } });
    const bloc = await this.prisma.bloc.findUnique({ where: { id: dto.blocId }, include: { warehouse: true } });

    if (!bloc) {
      throw new NotFoundException(`Bloc #${dto.blocId} not found`);
    }

    if (bloc.warehouseId !== warehouse.id) {
      throw new BadRequestException('Selected bloc does not belong to the selected warehouse');
    }

    const product = dto.productId
      ? await this.prisma.product.findUnique({ where: { id: dto.productId } })
      : await this.prisma.product.findFirst({
          where: {
            blocId: dto.blocId,
            name: { equals: dto.productName, mode: 'insensitive' },
          },
        });

    const currentStock = product?.quantity ?? dto.currentStock;
    const priority = dto.priority ?? RestockPriority.MEDIUM;

    return this.prisma.$transaction(async (tx) => {
      const alert = await tx.restockAlert.create({
        data: {
          productId: product?.id ?? dto.productId ?? null,
          productName: product?.name ?? dto.productName,
          currentStock,
          requestedQuantity: dto.requestedQuantity,
          warehouseId: warehouse.id,
          blocId: bloc.id,
          priority,
          managerNote: dto.note ?? null,
          status: RestockAlertStatus.PENDING,
          managerId: managerId ?? null,
        },
        include: this.alertInclude,
      });

      await tx.inventoryMovement.create({
        data: {
          productId: product?.id ?? dto.productId ?? null,
          productName: product?.name ?? dto.productName,
          quantity: dto.requestedQuantity,
          operationType: InventoryOperationType.RESTOCK_ALERT,
          destinationBlocId: bloc.id,
          technicianId: managerId ?? null,
          note: dto.note ?? 'Restock alert created',
          restockAlertId: alert.id,
        },
      });

      return alert;
    });
  }

  async findOne(id: number) {
    const alert = await this.prisma.restockAlert.findUnique({
      where: { id },
      include: this.alertInclude,
    });

    if (!alert) {
      throw new NotFoundException(`Restock alert #${id} not found`);
    }

    return alert;
  }

  async updateLocation(id: number, dto: UpdateRestockAlertLocationDto) {
    await this.findOne(id);

    const bloc = await this.prisma.bloc.findUnique({ where: { id: dto.blocId }, include: { warehouse: true } });
    if (!bloc) {
      throw new NotFoundException(`Bloc #${dto.blocId} not found`);
    }

    if (bloc.warehouseId !== dto.warehouseId) {
      throw new BadRequestException('Bloc does not belong to the selected warehouse');
    }

    return this.prisma.restockAlert.update({
      where: { id },
      data: {
        warehouseId: dto.warehouseId,
        blocId: dto.blocId,
      },
      include: this.alertInclude,
    });
  }

  async markInTransit(id: number, technicianId?: number) {
    const alert = await this.findOne(id);

    if (alert.status === RestockAlertStatus.COMPLETED) {
      throw new BadRequestException('Completed restock alert cannot be moved to transit');
    }

    return this.prisma.restockAlert.update({
      where: { id },
      data: {
        status: RestockAlertStatus.IN_PROGRESS,
        technicianId: technicianId ?? alert.technicianId ?? null,
      },
      include: this.alertInclude,
    });
  }

  async confirmRestock(id: number, dto: ExecuteRestockAlertDto, technicianId?: number) {
    const alert = await this.findOne(id);

    if (alert.status === RestockAlertStatus.COMPLETED) {
      throw new BadRequestException('Completed restock alert cannot be confirmed again');
    }

    const quantity = dto.quantity ?? alert.requestedQuantity;
    if (quantity <= 0) {
      throw new BadRequestException('quantity must be greater than 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const bloc = await tx.bloc.findUnique({ where: { id: alert.blocId } });
      if (!bloc) {
        throw new NotFoundException(`Bloc #${alert.blocId} not found`);
      }

      if (bloc.currentUsage + quantity > bloc.capacity) {
        throw new BadRequestException(
          `Not enough capacity in bloc #${bloc.id}. Available: ${bloc.capacity - bloc.currentUsage}, incoming: ${quantity}`,
        );
      }

      const product = alert.productId
        ? await tx.product.findUnique({ where: { id: alert.productId } })
        : await tx.product.findFirst({
            where: {
              blocId: alert.blocId,
              name: { equals: alert.productName, mode: 'insensitive' },
            },
          });

      if (!product) {
        throw new NotFoundException(`Product "${alert.productName}" not found in bloc #${alert.blocId}`);
      }

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { increment: quantity } },
      });

      await tx.bloc.update({
        where: { id: alert.blocId },
        data: { currentUsage: { increment: quantity } },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          productName: product.name,
          quantity,
          operationType: InventoryOperationType.RESTOCK,
          destinationBlocId: alert.blocId,
          technicianId: technicianId ?? null,
          note: dto.note ?? alert.managerNote ?? 'Restock confirmed',
          restockAlertId: alert.id,
        },
      });

      return tx.restockAlert.update({
        where: { id },
        data: {
          status: RestockAlertStatus.IN_PROGRESS,
          technicianId: technicianId ?? alert.technicianId ?? null,
        },
        include: this.alertInclude,
      });
    });
  }

  async transfer(id: number, dto: ExecuteRestockAlertDto, technicianId?: number) {
    const alert = await this.findOne(id);

    if (!dto.destinationBlocId) {
      throw new BadRequestException('destinationBlocId is required for a transfer');
    }

    const quantity = dto.quantity ?? alert.requestedQuantity;
    if (quantity <= 0) {
      throw new BadRequestException('quantity must be greater than 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const sourceBloc = await tx.bloc.findUnique({ where: { id: alert.blocId } });
      if (!sourceBloc) {
        throw new NotFoundException(`Bloc #${alert.blocId} not found`);
      }

      const destinationBloc = await tx.bloc.findUnique({ where: { id: dto.destinationBlocId } });
      if (!destinationBloc) {
        throw new NotFoundException(`Bloc #${dto.destinationBlocId} not found`);
      }

      if (sourceBloc.id === destinationBloc.id) {
        throw new BadRequestException('Source and destination blocs must be different');
      }

      const sourceProduct = alert.productId
        ? await tx.product.findUnique({ where: { id: alert.productId } })
        : await tx.product.findFirst({
            where: {
              blocId: alert.blocId,
              name: { equals: alert.productName, mode: 'insensitive' },
            },
          });

      if (!sourceProduct) {
        throw new NotFoundException(`Product "${alert.productName}" not found in bloc #${alert.blocId}`);
      }

      if (sourceProduct.quantity < quantity) {
        throw new BadRequestException(
          `Not enough stock for ${sourceProduct.name}. Available: ${sourceProduct.quantity}, requested: ${quantity}`,
        );
      }

      if (destinationBloc.currentUsage + quantity > destinationBloc.capacity) {
        throw new BadRequestException(
          `Not enough capacity in bloc #${destinationBloc.id}. Available: ${destinationBloc.capacity - destinationBloc.currentUsage}, incoming: ${quantity}`,
        );
      }

      const destinationProduct = await tx.product.findFirst({
        where: {
          blocId: destinationBloc.id,
          name: { equals: sourceProduct.name, mode: 'insensitive' },
        },
      });

      await tx.product.update({
        where: { id: sourceProduct.id },
        data: { quantity: { decrement: quantity } },
      });

      if (destinationProduct) {
        await tx.product.update({
          where: { id: destinationProduct.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        await tx.product.create({
          data: {
            name: sourceProduct.name,
            description: sourceProduct.description,
            price: sourceProduct.price,
            quantity,
            blocId: destinationBloc.id,
          },
        });
      }

      await tx.bloc.update({
        where: { id: sourceBloc.id },
        data: { currentUsage: { decrement: quantity } },
      });

      await tx.bloc.update({
        where: { id: destinationBloc.id },
        data: { currentUsage: { increment: quantity } },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: sourceProduct.id,
          productName: sourceProduct.name,
          quantity,
          operationType: InventoryOperationType.TRANSFER,
          sourceBlocId: sourceBloc.id,
          destinationBlocId: destinationBloc.id,
          technicianId: technicianId ?? null,
          note: dto.note ?? alert.managerNote ?? 'Restock transfer completed',
          restockAlertId: alert.id,
        },
      });

      return tx.restockAlert.update({
        where: { id },
        data: {
          blocId: destinationBloc.id,
          warehouseId: destinationBloc.warehouseId,
          status: RestockAlertStatus.IN_PROGRESS,
          technicianId: technicianId ?? alert.technicianId ?? null,
        },
        include: this.alertInclude,
      });
    });
  }

  async complete(id: number, technicianId?: number) {
    const alert = await this.findOne(id);

    return this.prisma.restockAlert.update({
      where: { id },
      data: {
        status: RestockAlertStatus.COMPLETED,
        completedAt: new Date(),
        technicianId: technicianId ?? alert.technicianId ?? null,
      },
      include: this.alertInclude,
    });
  }
}
