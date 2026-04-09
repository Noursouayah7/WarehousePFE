import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  reason: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  managerNote?: string;
}
