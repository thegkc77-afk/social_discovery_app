import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class TalkNowDto {
  @ApiProperty({ example: 'Gaming', description: 'Selected topic or vibe for conversation' })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiPropertyOptional({ example: 50, description: 'Maximum distance in km', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  maxDistanceKm?: number;

  @ApiPropertyOptional({ description: 'Client Socket.IO connection ID for direct real-time push' })
  @IsOptional()
  @IsString()
  socketId?: string;
}
