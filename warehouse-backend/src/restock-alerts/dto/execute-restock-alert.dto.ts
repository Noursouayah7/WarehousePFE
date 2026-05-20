import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class ExecuteRestockAlertDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  destinationBlocId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}