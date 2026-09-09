import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompleteOnboardingDto {
  @ApiProperty({ example: 'Alex Rivera' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'rivera_vibe' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: '2000-05-15' })
  @IsNotEmpty()
  @IsDateString()
  birthdate: string;

  @ApiProperty({ example: 'Non-binary' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiPropertyOptional({ example: 'Exploring the city & good vibes ☕✨' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: ['Gaming', 'Music', 'Travel'], description: 'Selected interest tags' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  interests: string[];

  @ApiProperty({ example: 'Chatting & Fun' })
  @IsNotEmpty()
  @IsString()
  intent: string;

  @ApiProperty({
    example: ['https://images.unsplash.com/...', 'https://images.unsplash.com/...'],
    description: 'Array of gallery photos (first photo will be main cover)',
  })
  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @ApiPropertyOptional({ example: 'Koramangala, Bangalore' })
  @IsOptional()
  @IsString()
  locationName?: string;
}
