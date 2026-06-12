import { Body, Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContactRequestStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/Jwt.auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContactRequestService } from './contact-request.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { UpdateContactRequestDto } from './dto/update-contact-request.dto';

@Controller('contact-requests')
export class ContactRequestController {
  constructor(private readonly contactRequestService: ContactRequestService) {}

  @Post()
  create(@Body() dto: CreateContactRequestDto) {
    return this.contactRequestService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get()
  findAll(
    @Query('status', new ParseEnumPipe(ContactRequestStatus, { optional: true }))
    status?: ContactRequestStatus,
  ) {
    return this.contactRequestService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContactRequestDto) {
    return this.contactRequestService.update(id, dto);
  }
}
