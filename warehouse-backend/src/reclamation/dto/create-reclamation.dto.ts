import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ReclamationProblemType } from '@prisma/client';

export class CreateReclamationDto {
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  shipmentId?: number;

  @IsEnum(ReclamationProblemType)
  problemType: ReclamationProblemType;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
