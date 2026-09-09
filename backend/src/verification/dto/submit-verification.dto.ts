import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitVerificationDto {
  @ApiProperty({
    example: 'data:image/jpeg;base64,... or https://images.unsplash.com/...',
    description: 'Selfie capture photo data URI or image URL',
  })
  @IsNotEmpty()
  @IsString()
  selfieUri: string;
}
