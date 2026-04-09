import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ShipmentType } from '@prisma/client';

export class CreateShipmentDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  orderId?: number;

  @IsEnum(ShipmentType)
  @IsOptional()
  type?: ShipmentType;

  @IsString()
  @MaxLength(120)
  productName: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsInt()
  @IsPositive()
  blocId: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  supplierName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  trackingNumber?: string;

  @IsDateString()
  @IsOptional()
  expectedAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
