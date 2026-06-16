import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { ContactRequestStatusValue, UpdateContactRequestDto } from './dto/update-contact-request.dto';

@Injectable()
export class ContactRequestService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactRequestDto) {
    return this.prisma.contactRequest.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone.trim(),
        reason: dto.reason,
      },
    });
  }

  findAll(status?: ContactRequestStatusValue) {
    return this.prisma.contactRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const request = await this.prisma.contactRequest.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Contact request #${id} not found`);
    }

    return request;
  }

  async update(id: number, dto: UpdateContactRequestDto) {
    await this.findOne(id);

    return this.prisma.contactRequest.update({
      where: { id },
      data: {
        status: dto.status,
        managerNote: dto.managerNote,
      },
    });
  }
}
