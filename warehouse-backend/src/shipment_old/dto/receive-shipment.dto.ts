import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class ReceiveShipmentDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  receivedQuantity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
