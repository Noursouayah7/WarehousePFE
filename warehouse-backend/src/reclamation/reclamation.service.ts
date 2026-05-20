import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import { ReclamationProblemType, ReclamationStatus } from '@prisma/client';

@Injectable()
export class ReclamationService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateReclamationDto, customerId: number) {
    return this.prisma.reclamation.create({
      data: {
        customerId,
        orderId: dto.orderId,
        shipmentId: dto.shipmentId,
        problemType: dto.problemType,
        description: dto.description,
        attachmentUrl: dto.attachmentUrl,
        status: ReclamationStatus.PENDING,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, productName: true, quantity: true, status: true },
        },
        shipment: {
          select: { id: true, productName: true, quantity: true, status: true, trackingNumber: true },
        },
      },
    });
  }

  findAll() {
    return this.prisma.reclamation.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, productName: true, quantity: true, status: true },
        },
        shipment: {
          select: { id: true, productName: true, quantity: true, status: true, trackingNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByCustomerId(customerId: number) {
    return this.prisma.reclamation.findMany({
      where: { customerId },
      include: {
        order: {
          select: { id: true, productName: true, quantity: true, status: true },
        },
        shipment: {
          select: { id: true, productName: true, quantity: true, status: true, trackingNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.reclamation.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, productName: true, quantity: true, status: true },
        },
        shipment: {
          select: { id: true, productName: true, quantity: true, status: true, trackingNumber: true },
        },
      },
    });
  }

  update(id: number, dto: UpdateReclamationDto) {
    return this.prisma.reclamation.update({
      where: { id },
      data: {
        status: dto.status,
        managerNote: dto.managerNote,
        resolvedAt: dto.status === ReclamationStatus.RESOLVED ? new Date() : undefined,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, productName: true, quantity: true, status: true },
        },
        shipment: {
          select: { id: true, productName: true, quantity: true, status: true, trackingNumber: true },
        },
      },
    });
  }

  remove(id: number) {
    return this.prisma.reclamation.delete({
      where: { id },
    });
  }
}
