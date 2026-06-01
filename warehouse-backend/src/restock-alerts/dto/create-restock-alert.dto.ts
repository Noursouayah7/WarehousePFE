import { RestockPriority } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateRestockAlertDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  productId?: number;

  @IsString()
  @MaxLength(120)
  productName: string;

  @IsInt()
  @Min(0)
  currentStock: number;

  @IsInt()
  @IsPositive()
  requestedQuantity: number;

  @IsInt()
  @IsPositive()
  warehouseId: number;

  @IsInt()
  @IsPositive()
  blocId: number;

  @IsEnum(RestockPriority)
  @IsOptional()
  priority?: RestockPriority;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}