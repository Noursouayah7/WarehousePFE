import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InventoryOperationType, OrderStatus, ShipmentStatus, ShipmentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ReceiveShipmentDto } from './dto/receive-shipment.dto';

@Injectable()
export class ShipmentService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateShipmentDto, technicianId?: number) {
		return this.prisma.$transaction(async (tx) => {
			await tx.bloc.findUniqueOrThrow({ where: { id: dto.blocId } });

			if (dto.orderId) {
				await tx.order.findUniqueOrThrow({ where: { id: dto.orderId } });
			}

			const shipment = await tx.shipment.create({
				data: {
					orderId: dto.orderId,
					type: dto.type ?? ShipmentType.RESTOCK,
					productName: dto.productName,
					quantity: dto.quantity,
					blocId: dto.blocId,
					supplierName: dto.supplierName,
					trackingNumber: dto.trackingNumber,
					expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : null,
					note: dto.note,
				},
			});

			await tx.inventoryMovement.create({
				data: {
					productName: dto.productName,
					quantity: dto.quantity,
					operationType: InventoryOperationType.SHIPMENT_CREATED,
					destinationBlocId: dto.blocId,
					orderId: dto.orderId ?? null,
					shipmentId: shipment.id,
					technicianId: technicianId ?? null,
					note: dto.note ?? 'Shipment created',
				},
			});

			return tx.shipment.findUniqueOrThrow({ where: { id: shipment.id }, include: { order: true, bloc: true } });
		});
	}

	findAll() {
		return this.prisma.shipment.findMany({
			include: { order: true, bloc: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	async findOne(id: number) {
		const shipment = await this.prisma.shipment.findUnique({
			where: { id },
			include: { order: true, bloc: true },
		});

		if (!shipment) {
			throw new NotFoundException(`Shipment #${id} not found`);
		}

		return shipment;
	}

	async findByCustomerId(customerId: number) {
		return this.prisma.shipment.findMany({
			where: {
				order: {
					customerId: customerId,
				},
			},
			include: { order: true, bloc: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	async update(id: number, dto: UpdateShipmentDto) {
		await this.findOne(id);

		if (dto.blocId) {
			await this.prisma.bloc.findUniqueOrThrow({ where: { id: dto.blocId } });
		}

		if (dto.orderId) {
			await this.prisma.order.findUniqueOrThrow({ where: { id: dto.orderId } });
		}

		return this.prisma.shipment.update({
			where: { id },
			data: {
				...dto,
				expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : undefined,
			},
			include: { order: true, bloc: true },
		});
	}

	async markInTransit(id: number) {
		const shipment = await this.findOne(id);

		if (shipment.status === ShipmentStatus.RECEIVED) {
			throw new BadRequestException('Received shipment cannot be moved back to transit');
		}

		return this.prisma.shipment.update({
			where: { id },
			data: { status: ShipmentStatus.IN_TRANSIT },
			include: { order: true, bloc: true },
		});
	}

	async receive(id: number, dto: ReceiveShipmentDto, technicianId?: number) {
		const shipment = await this.findOne(id);

		if (shipment.status === ShipmentStatus.RECEIVED) {
			throw new BadRequestException('Shipment already received');
		}

		const receivedQuantity = dto.receivedQuantity ?? shipment.quantity;
		if (receivedQuantity <= 0) {
			throw new BadRequestException('receivedQuantity must be greater than 0');
		}

		return this.prisma.$transaction(async (tx) => {
			const bloc = await tx.bloc.findUnique({ where: { id: shipment.blocId } });
			if (!bloc) {
				throw new NotFoundException(`Bloc #${shipment.blocId} not found`);
			}

			if (bloc.currentUsage + receivedQuantity > bloc.capacity) {
				throw new BadRequestException(
					`Not enough capacity in bloc #${bloc.id}. Available: ${bloc.capacity - bloc.currentUsage}, incoming: ${receivedQuantity}`,
				);
			}

			const product = await tx.product.findFirst({
				where: {
					blocId: shipment.blocId,
					name: { equals: shipment.productName, mode: 'insensitive' },
				},
			});

			if (!product) {
				throw new NotFoundException(
					`No product named \"${shipment.productName}\" exists in bloc #${shipment.blocId}`,
				);
			}

			await tx.product.update({
				where: { id: product.id },
				data: { quantity: { increment: receivedQuantity } },
			});

			await tx.bloc.update({
				where: { id: shipment.blocId },
				data: { currentUsage: { increment: receivedQuantity } },
			});

			if (shipment.orderId) {
				await tx.order.update({
					where: { id: shipment.orderId },
					data: {
						status: OrderStatus.PENDING,
						managerNote: 'Restock received. Order can now be reviewed for approval.',
					},
				});
			}

			await tx.inventoryMovement.create({
				data: {
					productId: product.id,
					productName: product.name,
					quantity: receivedQuantity,
					operationType: InventoryOperationType.STOCK_IN,
					destinationBlocId: shipment.blocId,
					shipmentId: shipment.id,
					orderId: shipment.orderId,
					technicianId: technicianId ?? null,
					note: dto.note ?? shipment.note,
				},
			});

			return tx.shipment.update({
				where: { id },
				data: {
					status: ShipmentStatus.RECEIVED,
					receivedAt: new Date(),
					trackingNumber: dto.trackingNumber ?? shipment.trackingNumber,
					note: dto.note ?? shipment.note,
					quantity: receivedQuantity,
				},
				include: { order: true, bloc: true },
			});
		});
	}

	async remove(id: number) {
		const shipment = await this.findOne(id);

		if (shipment.status === ShipmentStatus.RECEIVED) {
			throw new BadRequestException('Received shipments cannot be deleted; reverse the stock first');
		}

		await this.prisma.shipment.delete({ where: { id } });
		return { message: `Shipment #${id} deleted successfully` };
	}
}
