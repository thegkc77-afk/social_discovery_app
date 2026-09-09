import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content / body text',
    example: 'Hey! Anyone up for coffee at Third Wave? ☕',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: 'Flag indicating if message contains a meetup invite card',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isInvite?: boolean;

  @ApiPropertyOptional({
    description: 'Meetup invitation details (place, date, time, note, status)',
    example: {
      place: 'Third Wave Coffee, Koramangala',
      date: 'Sat, 25 May',
      time: '5:00 PM',
      note: 'Looking forward to it! ☕',
      status: 'pending',
    },
  })
  @IsOptional()
  @IsObject()
  inviteDetails?: Record<string, any>;
}
