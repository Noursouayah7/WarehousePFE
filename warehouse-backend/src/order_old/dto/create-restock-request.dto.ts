import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRestockRequestDto {
  @IsInt()
  @IsPositive()
  blocId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  productName?: string;

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
