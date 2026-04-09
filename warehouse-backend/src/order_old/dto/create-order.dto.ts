import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  productName: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsDateString()
  deliveryDeadline: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deliveryAddress: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  customerName: string;

  @IsPhoneNumber()
  customerPhone: string;
}
