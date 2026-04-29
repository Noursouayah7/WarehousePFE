import {
	IsDateString,
	IsInt,
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	Matches,
	MaxLength,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
	@IsArray()
	@IsOptional()
	items?: CreateOrderItemDto[];

	@IsString()
	@IsOptional()
	@MaxLength(120)
	productName?: string;

	@IsInt()
	@IsOptional()
	@IsPositive()
	quantity?: number;

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
