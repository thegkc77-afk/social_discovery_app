import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { TalkNowDto } from './dto/talk-now.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Matching')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('talk-now')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate Talk Now speed matchmaking request' })
  @ApiResponse({ status: 200, description: 'Match found or entered live search queue' })
  joinTalkNow(
    @CurrentUser('id') userId: string,
    @Body() dto: TalkNowDto,
  ) {
    return this.matchingService.joinTalkNow(
      userId,
      dto.topic,
      dto.socketId,
      dto.maxDistanceKm,
    );
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel current Talk Now search queue request' })
  cancelTalkNow(@CurrentUser('id') userId: string) {
    return this.matchingService.cancelTalkNow(userId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current Talk Now match/queue status' })
  getStatus(@CurrentUser('id') userId: string) {
    return this.matchingService.getStatus(userId);
  }
}
