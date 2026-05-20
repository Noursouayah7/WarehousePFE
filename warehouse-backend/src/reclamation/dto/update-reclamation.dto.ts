import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReclamationStatus } from '@prisma/client';

export class UpdateReclamationDto {
  @IsOptional()
  @IsEnum(ReclamationStatus)
  status?: ReclamationStatus;

  @IsOptional()
  @IsString()
  managerNote?: string;
}
