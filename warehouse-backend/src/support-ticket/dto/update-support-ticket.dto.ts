import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SupportTicketPriority, SupportTicketStatus } from '@prisma/client';
import { CreateSupportTicketDto } from './create-support-ticket.dto';

export class UpdateSupportTicketDto extends PartialType(CreateSupportTicketDto) {
  @IsEnum(SupportTicketStatus)
  @IsOptional()
  status?: SupportTicketStatus;

  @IsEnum(SupportTicketPriority)
  @IsOptional()
  priority?: SupportTicketPriority;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  managerNote?: string;
}