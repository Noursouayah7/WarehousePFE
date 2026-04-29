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

type NormalizedOrderLine = {
  productId: number;
  productName: string;
  quantity: number;
};

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async customerProducts() {
    const products = await this.prisma.product.findMany({
      where: { quantity: { gt: 0 } },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        blocId: true,
        bloc: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      blocId: product.blocId,
      blocName: product.bloc.name,
    }));
  }

  findMine(customerId: number) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { shipments: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private normalizeItems(dto: CreateOrderDto): NormalizedOrderLine[] {
    if (dto.items && dto.items.length > 0) {
      const grouped = new Map<number, NormalizedOrderLine>();

      for (const item of dto.items) {
        const current = grouped.get(item.productId);
        if (current) {
          current.quantity += item.quantity;
        } else {
          grouped.set(item.productId, {
            productId: item.productId,
            productName: '',
            quantity: item.quantity,
          });
        }
      }

      return Array.from(grouped.values());
    }

    if (!dto.productName || !dto.quantity) {
      throw new BadRequestException('Order items are required');
    }

    return [
      {
        productId: 0,
        productName: dto.productName,
        quantity: dto.quantity,
      },
    ];
  }

  async create(customerId: number, dto: CreateOrderDto) {
    const normalizedItems = this.normalizeItems(dto);
    const productIds = normalizedItems.filter((item) => item.productId > 0).map((item) => item.productId);

    const products = productIds.length > 0
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, price: true, quantity: true, blocId: true },
        })
      : await this.prisma.product.findMany({
          where: {
            name: { equals: normalizedItems[0].productName, mode: 'insensitive' },
            quantity: { gt: 0 },
          },
          select: { id: true, name: true, price: true, quantity: true, blocId: true },
          orderBy: { quantity: 'desc' },
        });

    if (productIds.length > 0 && products.length !== productIds.length) {
      throw new BadRequestException('One or more requested products were not found');
    }

    const quantityByProductId = new Map<number, number>();
    for (const item of normalizedItems) {
      if (item.productId > 0) {
        quantityByProductId.set(item.productId, (quantityByProductId.get(item.productId) ?? 0) + item.quantity);
      }
    }

    let totalQuantity = 0;
    let totalAmount = 0;

    const orderItems = normalizedItems.map((item) => {
      const product = item.productId > 0
        ? products.find((candidate) => candidate.id === item.productId)
        : products[0];

      if (!product) {
        throw new BadRequestException(`Product not found for order line: ${item.productName || item.productId}`);
      }

      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${product.name}. Available: ${product.quantity}, required: ${item.quantity}`,
        );
      }

      const lineTotal = product.price * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const summaryName = orderItems.length === 1 ? orderItems[0].productName : `${orderItems.length} products`;

    return this.prisma.order.create({
      data: {
        customerId,
        productName: summaryName,
        quantity: totalQuantity,
        totalAmount,
        deliveryDeadline: new Date(dto.deliveryDeadline),
        deliveryAddress: dto.deliveryAddress,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { shipments: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { shipments: true, items: true },
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
      totalAmount: order.totalAmount,
      items: order.items,
      deliveryStatus: order.deliveryStatus,
      status: order.status,
      approvedAt: order.approvedAt,
      deliveredAt: order.deliveredAt,
      deliveryDeadline: order.deliveryDeadline,
      managerNote: order.managerNote,
    };
  }

  async approve(id: number, dto: OrderNoteDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Order is already completed');
    }

    if (order.status === OrderStatus.APPROVED) {
      throw new BadRequestException('Order is already approved');
    }

    const orderLines = order.items.length > 0
      ? order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
        }))
      : [{ productId: 0, productName: order.productName, quantity: order.quantity }];

    return this.prisma.$transaction(async (tx) => {
      const blocUsageDecrement = new Map<number, number>();

      for (const line of orderLines) {
        const products = line.productId > 0
          ? await tx.product.findMany({
              where: { id: line.productId },
            })
          : await tx.product.findMany({
              where: {
                name: { equals: line.productName, mode: 'insensitive' },
                quantity: { gt: 0 },
              },
              orderBy: { quantity: 'desc' },
            });

        const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
        if (totalStock < line.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${line.productName}. Available: ${totalStock}, required: ${line.quantity}`,
          );
        }

        let remaining = line.quantity;

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
        include: { shipments: true, items: true },
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
