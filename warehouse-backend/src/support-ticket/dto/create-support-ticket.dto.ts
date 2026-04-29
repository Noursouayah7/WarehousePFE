import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SupportTicketCategory, SupportTicketPriority } from '@prisma/client';

export class CreateSupportTicketDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsEnum(SupportTicketCategory)
  category: SupportTicketCategory;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsEnum(SupportTicketPriority)
  @IsOptional()
  priority?: SupportTicketPriority;
}