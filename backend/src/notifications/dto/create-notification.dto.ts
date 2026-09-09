import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Target User UUID' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Notification type (e.g. MATCH, MESSAGE, MEETUP_INVITE, VERIFICATION, SYSTEM)', example: 'MATCH' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Notification Title', example: 'New Match!' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message body', example: 'You and Priya matched on Gaming vibes 🎮' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Optional custom metadata payload' })
  @IsOptional()
  data?: Record<string, any>;
}
