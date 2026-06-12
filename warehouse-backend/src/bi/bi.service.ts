import { Injectable } from '@nestjs/common';
import {
  ContactRequestStatus,
  InventoryOperationType,
  OrderStatus,
  ReclamationStatus,
  ShipmentStatus,
  SupportTicketStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type BiRole = 'ADMIN' | 'MANAGER' | 'TECHNICIEN';

@Injectable()
export class BiService {
  private readonly lowStockThreshold = 10;

  constructor(private readonly prisma: PrismaService) {}

  async summary(role: BiRole, userId?: number) {
    const [
      products,
      warehouses,
      totalCustomers,
      totalUsers,
      orderCounts,
      shipmentCounts,
      ticketCounts,
      reclamationCounts,
      movementCounts,
      totalMovements,
      recentMovements,
      myOpenTickets,
      newContactRequests,
      latestContactRequests,
    ] = await Promise.all([
      this.prisma.product.findMany({
        include: {
          bloc: {
            include: {
              warehouse: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { quantity: 'asc' },
      }),
      this.prisma.warehouse.findMany({
        include: {
          blocks: {
            include: {
              products: {
                select: { id: true, name: true, quantity: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where: { roles: UserRole.CUSTOMER } }),
      this.prisma.user.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.shipment.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.supportTicket.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.reclamation.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.inventoryMovement.groupBy({ by: ['operationType'], _count: { _all: true } }),
      this.prisma.inventoryMovement.count(),
      this.prisma.inventoryMovement.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          sourceBloc: { include: { warehouse: { select: { id: true, name: true } } } },
          destinationBloc: { include: { warehouse: { select: { id: true, name: true } } } },
          technician: { select: { id: true, name: true, email: true } },
        },
      }),
      role === 'TECHNICIEN' && userId
        ? this.prisma.supportTicket.count({
            where: {
              createdById: userId,
              status: { in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS] },
            },
          })
        : Promise.resolve(0),
      role === 'MANAGER' || role === 'ADMIN'
        ? this.prisma.contactRequest.count({ where: { status: ContactRequestStatus.NEW } })
        : Promise.resolve(0),
      role === 'MANAGER' || role === 'ADMIN'
        ? this.prisma.contactRequest.findMany({
            where: { status: ContactRequestStatus.NEW },
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    const totalStockQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockProducts = products
      .filter((product) => product.quantity <= this.lowStockThreshold)
      .slice(0, 8)
      .map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        blocName: product.bloc.name,
        warehouseName: product.bloc.warehouse.name,
      }));

    const blocks = warehouses.flatMap((warehouse) =>
      warehouse.blocks.map((bloc) => ({
        id: bloc.id,
        name: bloc.name,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        capacity: bloc.capacity,
        currentUsage: bloc.currentUsage,
        usagePercent: this.percent(bloc.currentUsage, bloc.capacity),
        productCount: bloc.products.length,
        stockQuantity: bloc.products.reduce((sum, product) => sum + product.quantity, 0),
      })),
    );

    const totalCapacity = blocks.reduce((sum, bloc) => sum + bloc.capacity, 0);
    const totalUsage = blocks.reduce((sum, bloc) => sum + bloc.currentUsage, 0);
    const warehouseUsage = warehouses.map((warehouse) => {
      const capacity = warehouse.blocks.reduce((sum, bloc) => sum + bloc.capacity, 0);
      const usage = warehouse.blocks.reduce((sum, bloc) => sum + bloc.currentUsage, 0);

      return {
        id: warehouse.id,
        name: warehouse.name,
        capacity,
        currentUsage: usage,
        usagePercent: this.percent(usage, capacity),
        blockCount: warehouse.blocks.length,
      };
    });

    return {
      role,
      generatedAt: new Date().toISOString(),
      lowStockThreshold: this.lowStockThreshold,
      inventory: {
        totalProducts: products.length,
        totalStockQuantity,
        lowStockProductsCount: products.filter((product) => product.quantity <= this.lowStockThreshold).length,
        lowStockProducts,
        totalInventoryMovements: totalMovements,
        transferMovements: this.getCount(movementCounts, 'operationType', InventoryOperationType.TRANSFER),
        movementTypeCounts: this.enumCounts(movementCounts, 'operationType'),
        recentMovements: recentMovements.map((movement) => ({
          id: movement.id,
          productName: movement.productName,
          quantity: movement.quantity,
          operationType: movement.operationType,
          createdAt: movement.createdAt,
          sourceBlocName: movement.sourceBloc?.name ?? null,
          sourceWarehouseName: movement.sourceBloc?.warehouse.name ?? null,
          destinationBlocName: movement.destinationBloc?.name ?? null,
          destinationWarehouseName: movement.destinationBloc?.warehouse.name ?? null,
          technicianName: movement.technician?.name ?? movement.technician?.email ?? null,
        })),
      },
      warehouse: {
        totalWarehouses: warehouses.length,
        totalBlocks: blocks.length,
        totalCapacity,
        totalUsage,
        capacityUsagePercent: this.percent(totalUsage, totalCapacity),
        highUsageBlocks: blocks.filter((bloc) => bloc.usagePercent >= 80).slice(0, 8),
        blockUsage: blocks.sort((a, b) => b.usagePercent - a.usagePercent).slice(0, 12),
        warehouseUsage,
      },
      users: {
        totalUsers,
        totalCustomers,
      },
      orders: {
        totalOrders: this.sumCounts(orderCounts),
        approvedOrders: this.getCount(orderCounts, 'status', OrderStatus.APPROVED),
        rejectedOrders: this.getCount(orderCounts, 'status', OrderStatus.REJECTED),
        pendingOrders: this.getCount(orderCounts, 'status', OrderStatus.PENDING),
        completedOrders: this.getCount(orderCounts, 'status', OrderStatus.COMPLETED),
        restockRequestedOrders: this.getCount(orderCounts, 'status', OrderStatus.RESTOCK_REQUESTED),
        statusCounts: this.enumCounts(orderCounts, 'status'),
      },
      shipments: {
        activeShipments:
          this.getCount(shipmentCounts, 'status', ShipmentStatus.REQUESTED) +
          this.getCount(shipmentCounts, 'status', ShipmentStatus.IN_TRANSIT),
        receivedShipments: this.getCount(shipmentCounts, 'status', ShipmentStatus.RECEIVED),
        statusCounts: this.enumCounts(shipmentCounts, 'status'),
      },
      support: {
        totalSupportTickets: this.sumCounts(ticketCounts),
        totalReclamations: this.sumCounts(reclamationCounts),
        openSupportTickets:
          this.getCount(ticketCounts, 'status', SupportTicketStatus.OPEN) +
          this.getCount(ticketCounts, 'status', SupportTicketStatus.IN_PROGRESS),
        openReclamations:
          this.getCount(reclamationCounts, 'status', ReclamationStatus.PENDING) +
          this.getCount(reclamationCounts, 'status', ReclamationStatus.IN_PROGRESS),
        myOpenTickets,
        newContactRequests,
        latestContactRequests: latestContactRequests.map((request) => ({
          id: request.id,
          email: request.email,
          phone: request.phone,
          reason: request.reason,
          status: request.status,
          managerNote: request.managerNote,
          createdAt: request.createdAt,
        })),
        ticketStatusCounts: this.enumCounts(ticketCounts, 'status'),
        reclamationStatusCounts: this.enumCounts(reclamationCounts, 'status'),
      },
    };
  }

  private percent(value: number, total: number) {
    if (total <= 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }

  private sumCounts(rows: Array<{ _count: { _all: number } }>) {
    return rows.reduce((sum, row) => sum + row._count._all, 0);
  }

  private getCount<T extends string>(rows: Array<Record<string, unknown> & { _count: { _all: number } }>, key: string, value: T) {
    return rows.find((row) => row[key] === value)?._count._all ?? 0;
  }

  private enumCounts(rows: Array<Record<string, unknown> & { _count: { _all: number } }>, key: string) {
    return rows.reduce<Record<string, number>>((acc, row) => {
      const value = row[key];
      if (typeof value === 'string') {
        acc[value] = row._count._all;
      }

      return acc;
    }, {});
  }
}
