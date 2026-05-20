import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { RestockPriority } from '@prisma/client';

export class CreateRestockRequestDto {
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
  priority: RestockPriority;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
