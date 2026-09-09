import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReadReceiptDto {
  @ApiProperty({ description: 'Chat ID to mark as read' })
  @IsNotEmpty()
  @IsUUID()
  chatId: string;
}
