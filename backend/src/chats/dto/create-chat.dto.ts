import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Target user ID to start a 1-on-1 chat with',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  @IsUUID()
  targetUserId: string;
}
