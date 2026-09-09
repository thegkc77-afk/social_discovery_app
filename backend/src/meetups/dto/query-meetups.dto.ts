import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { MeetupStatus } from '@prisma/client';

export class QueryMeetupsDto {
  @ApiPropertyOptional({
    description: 'Filter meetups by state machine status',
    enum: MeetupStatus,
  })
  @IsOptional()
  @IsEnum(MeetupStatus)
  status?: MeetupStatus;

  @ApiPropertyOptional({
    description: 'Filter meetups where user is creator, recipient, or all',
    enum: ['created', 'received', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['created', 'received', 'all'])
  type?: 'created' | 'received' | 'all' = 'all';
}
