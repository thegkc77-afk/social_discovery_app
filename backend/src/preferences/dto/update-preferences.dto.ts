import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  minAge?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  maxAge?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxDistanceKm?: number;

  @ApiPropertyOptional({ example: ['Woman', 'Non-binary'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredGenders?: string[];

  @ApiPropertyOptional({ example: ['Chatting & Fun', 'Dating & Romance'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredIntents?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}
