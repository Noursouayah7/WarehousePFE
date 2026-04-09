import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'Phone must contain exactly 8 digits' })
  phone: string;

  // Numeric string, exactly 8 characters
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'CIN must be at least 8 characters' })
  @MaxLength(8, { message: 'CIN must be exactly 8 characters' })
  @Matches(/^\d{8}$/, { message: 'CIN must contain exactly 8 numeric digits' })
  cin: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsEnum(UserRole)
  @IsOptional()
  roles?: UserRole;
}