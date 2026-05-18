import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class AdjustInventoryDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}