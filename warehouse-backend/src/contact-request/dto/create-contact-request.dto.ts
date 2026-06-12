import { IsEmail, IsIn, IsString, MaxLength } from 'class-validator';

export const contactRequestReasons = [
  'General inquiry',
  'Product information',
  'Visit the factory',
  'Wholesale request',
  'Other',
] as const;

export class CreateContactRequestDto {
  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @MaxLength(40)
  phone: string;

  @IsString()
  @IsIn(contactRequestReasons)
  reason: string;
}
