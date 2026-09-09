import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class DiscoveryQueryDto {
  @ApiPropertyOptional({ example: 12.9352, description: 'Override query latitude' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 77.6245, description: 'Override query longitude' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ example: 50, description: 'Search radius in kilometers', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  maxDistanceKm?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  @Type(() => Number)
  minAge?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  @Type(() => Number)
  maxAge?: number;

  @ApiPropertyOptional({ example: 'Woman' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'Chatting & Fun' })
  @IsOptional()
  @IsString()
  intent?: string;

  @ApiPropertyOptional({ example: 'Gaming', description: 'Vibe/interest tag filter' })
  @IsOptional()
  @IsString()
  interest?: string;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
