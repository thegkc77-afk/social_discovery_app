import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: 12.9352, description: 'Latitude decimal coordinate (-90 to 90)' })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 77.6245, description: 'Longitude decimal coordinate (-180 to 180)' })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({ example: 10.5, description: 'GPS accuracy in meters' })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({ example: 'Koramangala, Bangalore' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string;
}
