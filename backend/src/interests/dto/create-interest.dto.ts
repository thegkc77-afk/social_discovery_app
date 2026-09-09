import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInterestDto {
  @ApiProperty({ example: 'Gaming' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Entertainment' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'gamepad-2' })
  @IsOptional()
  @IsString()
  icon?: string;
}
