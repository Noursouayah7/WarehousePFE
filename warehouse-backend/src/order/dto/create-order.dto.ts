import {
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsPositive,
	IsString,
	Matches,
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

	@IsString()
	@IsNotEmpty()
	@Matches(/^\d{8}$/, { message: 'Customer phone must contain exactly 8 digits' })
	customerPhone: string;
}
