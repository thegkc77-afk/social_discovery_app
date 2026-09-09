import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryMessagesDto {
  @ApiPropertyOptional({
    description: 'Number of messages to retrieve (pagination limit)',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Cursor message ID to fetch messages before this ID (for infinite scrolling)',
  })
  @IsOptional()
  @IsString()
  before?: string;
}
