import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class TypingDto {
  @ApiProperty({ description: 'Chat ID' })
  @IsNotEmpty()
  @IsUUID()
  chatId: string;

  @ApiProperty({ description: 'True if user is actively typing, false when stopped' })
  @IsBoolean()
  isTyping: boolean;
}
