import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or retrieve a direct 1-on-1 chat thread with another user' })
  @ApiResponse({ status: 201, description: 'Chat thread retrieved or created successfully' })
  createOrGetChat(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateChatDto,
  ) {
    return this.chatsService.createOrGetDirectChat(userId, dto.targetUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chat threads for the current user with unread counts' })
  @ApiResponse({ status: 200, description: 'List of active chats returned' })
  getUserChats(@CurrentUser('id') userId: string) {
    return this.chatsService.getUserChats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and participant info for a specific chat thread' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Chat details returned' })
  @ApiResponse({ status: 403, description: 'User is not a member of this chat' })
  getChatById(
    @CurrentUser('id') userId: string,
    @Param('id') chatId: string,
  ) {
    return this.chatsService.getChatById(chatId, userId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get paginated message history for a specific chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'before', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of messages returned' })
  getChatMessages(
    @CurrentUser('id') userId: string,
    @Param('id') chatId: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.chatsService.getChatMessages(chatId, userId, query);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message or meetup invite within a chat thread' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 201, description: 'Message created and delivered' })
  sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id') chatId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatsService.sendMessage(chatId, userId, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark all unread messages in a chat thread as read' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Read status updated' })
  markChatAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') chatId: string,
  ) {
    return this.chatsService.markAsRead(chatId, userId);
  }
}
