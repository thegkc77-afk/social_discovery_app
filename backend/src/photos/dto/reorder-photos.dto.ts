import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PhotoOrderItem {
  @ApiProperty({ example: 'photo-uuid' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsInt()
  order: number;
}

export class ReorderPhotosDto {
  @ApiProperty({ type: [PhotoOrderItem] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PhotoOrderItem)
  photos: PhotoOrderItem[];
}
