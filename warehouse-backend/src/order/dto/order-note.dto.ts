import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OrderNoteDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  managerNote?: string;
}
