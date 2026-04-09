import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeliveryStatus, OrderStatus, ShipmentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderNoteDto } from './dto/order-note.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { CreateRestockRequestDto } from './dto/create-restock-request.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async customerProducts() {
    const products = await this.prisma.product.findMany({
      where: { quantity: { gt: 0 } },
      select: {
        id: true,
        name: true,
        quantity: true,
      },
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    const grouped = new Map<string, { name: string; availableQuantity: number }>();
    for (const product of products) {
      const current = grouped.get(product.name);
      if (current) {
        current.availableQuantity += product.quantity;
      } else {
        grouped.set(product.name, {
          name: product.name,
          availableQuantity: product.quantity,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  findMine(customerId: number) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { shipments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(customerId: number, dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        customerId,
        productName: dto.productName,
        quantity: dto.quantity,
        deliveryDeadline: new Date(dto.deliveryDeadline),
        deliveryAddress: dto.deliveryAddress,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { shipments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { shipments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  async tracking(customerId: number, id: number) {
    const order = await this.findOne(id);

    if (order.customerId !== customerId) {
      throw new ForbiddenException('You can only track your own orders');
    }

    return {
      id: order.id,
      productName: order.productName,
      quantity: order.quantity,
      deliveryStatus: order.deliveryStatus,
      status: order.status,
      approvedAt: order.approvedAt,
      deliveredAt: order.deliveredAt,
      deliveryDeadline: order.deliveryDeadline,
      managerNote: order.managerNote,
    };
  }

  async approve(id: number, dto: OrderNoteDto) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Order is already completed');
    }

    if (order.status === OrderStatus.APPROVED) {
      throw new BadRequestException('Order is already approved');
    }

    const products = await this.prisma.product.findMany({
      where: {
        name: { equals: order.productName, mode: 'insensitive' },
        quantity: { gt: 0 },
      },
      orderBy: { quantity: 'desc' },
    });

    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
    if (totalStock < order.quantity) {
      throw new BadRequestException(
        `Not enough stock for ${order.productName}. Available: ${totalStock}, required: ${order.quantity}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let remaining = order.quantity;
      const blocUsageDecrement = new Map<number, number>();

      for (const product of products) {
        if (remaining <= 0) {
          break;
        }

        const take = Math.min(product.quantity, remaining);

        await tx.product.update({
          where: { id: product.id },
          data: { quantity: { decrement: take } },
        });

        blocUsageDecrement.set(
          product.blocId,
          (blocUsageDecrement.get(product.blocId) ?? 0) + take,
        );

        remaining -= take;
      }

      for (const [blocId, quantity] of blocUsageDecrement.entries()) {
        await tx.bloc.update({
          where: { id: blocId },
          data: { currentUsage: { decrement: quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.APPROVED,
          deliveryStatus: DeliveryStatus.IN_DELIVERY,
          approvedAt: new Date(),
          managerNote: dto.managerNote,
          rejectionReason: null,
        },
        include: { shipments: true },
      });
    });
  }

  async reject(id: number, dto: RejectOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.REJECTED,
        managerNote: dto.managerNote,
        rejectionReason: dto.reason,
      },
    });
  }

  async createRestockRequest(id: number, dto: CreateRestockRequestDto) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot restock from a completed order');
    }

    const requestedQuantity = dto.quantity ?? order.quantity;
    const productName = dto.productName ?? order.productName;

    await this.prisma.bloc.findUniqueOrThrow({ where: { id: dto.blocId } });

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.RESTOCK_REQUESTED,
          managerNote: dto.note ?? order.managerNote,
          restockAt: new Date(),
        },
      });

      return tx.shipment.create({
        data: {
          orderId: id,
          type: ShipmentType.RESTOCK,
          productName,
          quantity: requestedQuantity,
          blocId: dto.blocId,
          supplierName: dto.supplierName,
          trackingNumber: dto.trackingNumber,
          expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : null,
          note: dto.note,
        },
      });
    });
  }

  async markDelivered(id: number, dto: OrderNoteDto) {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.APPROVED) {
      throw new BadRequestException('Order must be approved before marking delivered');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.COMPLETED,
        deliveryStatus: DeliveryStatus.DELIVERED,
        deliveredAt: new Date(),
        managerNote: dto.managerNote ?? order.managerNote,
      },
      include: { shipments: true },
    });
  }
}
