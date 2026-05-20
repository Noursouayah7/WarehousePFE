import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateRestockAlertLocationDto {
  @IsInt()
  @IsPositive()
  warehouseId: number;

  @IsInt()
  @IsPositive()
  blocId: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}