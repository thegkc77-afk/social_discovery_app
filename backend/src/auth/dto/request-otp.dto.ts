import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'User mobile phone number in E.164 format' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: '+91', description: 'Country dialing code', default: '+91' })
  @IsOptional()
  @IsString()
  countryCode?: string = '+91';
}
