import { ContactRequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactRequestDto {
  @IsEnum(ContactRequestStatus)
  @IsOptional()
  status?: ContactRequestStatus;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  managerNote?: string;
}
