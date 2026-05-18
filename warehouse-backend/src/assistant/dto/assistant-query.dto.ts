import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AssistantQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  message!: string;
}