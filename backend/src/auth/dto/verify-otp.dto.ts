import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'User mobile phone number' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP received via SMS' })
  @IsNotEmpty()
  @IsString()
  @Length(4, 8)
  otp: string;

  @ApiPropertyOptional({ example: '+91', description: 'Country dialing code', default: '+91' })
  @IsOptional()
  @IsString()
  countryCode?: string = '+91';
}
