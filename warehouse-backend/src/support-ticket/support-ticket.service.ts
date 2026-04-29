import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Injectable()
export class SupportTicketService {
  constructor(private readonly prisma: PrismaService) {}

  create(createdById: number, dto: CreateSupportTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        createdById,
        title: dto.title,
        category: dto.category,
        description: dto.description,
        priority: dto.priority,
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true, roles: true },
        },
      },
    });
  }

  findAll() {
    return this.prisma.supportTicket.findMany({
      include: {
        createdBy: {
          select: { id: true, email: true, name: true, roles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findMine(createdById: number) {
    return this.prisma.supportTicket.findMany({
      where: { createdById },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true, roles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true, roles: true },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket #${id} not found`);
    }

    return ticket;
  }

  async update(id: number, dto: UpdateSupportTicketDto) {
    await this.findOne(id);

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        title: dto.title,
        category: dto.category,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        managerNote: dto.managerNote,
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true, roles: true },
        },
      },
    });
  }
}