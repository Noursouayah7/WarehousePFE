import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export const ContactRequestStatusValues = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ContactRequestStatusValue = (typeof ContactRequestStatusValues)[keyof typeof ContactRequestStatusValues];

export class UpdateContactRequestDto {
  @IsEnum(ContactRequestStatusValues)
  @IsOptional()
  status?: ContactRequestStatusValue;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  managerNote?: string;
}
