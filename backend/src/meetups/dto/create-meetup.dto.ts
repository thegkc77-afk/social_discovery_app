import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMeetupDto {
  @ApiProperty({
    description: 'User ID of the recipient invited to the meetup',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;

  @ApiProperty({
    description: 'Place / venue for the meetup',
    example: 'Third Wave Coffee, Koramangala',
  })
  @IsNotEmpty()
  @IsString()
  place: string;

  @ApiProperty({
    description: 'Date for the meetup',
    example: 'Sat, 25 May',
  })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Time for the meetup',
    example: '5:00 PM',
  })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiPropertyOptional({
    description: 'Optional personal note for the meetup invite',
    example: 'Looking forward to trying that hazelnut latte! ☕',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Optional associated chat thread ID',
  })
  @IsOptional()
  @IsUUID()
  chatId?: string;
}
