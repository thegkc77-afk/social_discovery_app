import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class SetUserInterestsDto {
  @ApiProperty({
    example: ['Gaming', 'Music', 'Travel'],
    description: 'Array of interest names or interest UUIDs',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  interests: string[];
}
