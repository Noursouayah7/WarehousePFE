import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  @IsOptional()
  quantity?: number;

  @IsInt()
  @IsPositive()
  blocId: number;
}