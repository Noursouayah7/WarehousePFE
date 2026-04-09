import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';
import { CreateShipmentDto } from './create-shipment.dto';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;
}
