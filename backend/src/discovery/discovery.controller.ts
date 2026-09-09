import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';
import { DiscoveryQueryDto } from './dto/discovery-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('nearby')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Discover nearby active profiles filtered by distance, age, gender, and vibes' })
  @ApiResponse({ status: 200, description: 'List of safe public profiles matching search filters' })
  getNearbyUsers(
    @CurrentUser('id') userId: string,
    @Query() query: DiscoveryQueryDto,
  ) {
    return this.discoveryService.getNearbyUsers(userId, query);
  }

  @Post(':targetUserId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a discovered user and check for mutual match' })
  @ApiParam({ name: 'targetUserId', description: 'Target user UUID' })
  @ApiResponse({ status: 200, description: 'Like registered and match status returned' })
  likeUser(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.discoveryService.likeUser(userId, targetUserId);
  }

  @Delete(':targetUserId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a user' })
  @ApiParam({ name: 'targetUserId', description: 'Target user UUID' })
  unlikeUser(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.discoveryService.unlikeUser(userId, targetUserId);
  }

  @Get('matches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all mutual matches for current user' })
  getMatches(@CurrentUser('id') userId: string) {
    return this.discoveryService.getMatches(userId);
  }

  @Get('likes/sent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List likes sent by current user' })
  getSentLikes(@CurrentUser('id') userId: string) {
    return this.discoveryService.getSentLikes(userId);
  }

  @Get('likes/received')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List likes received by current user' })
  getReceivedLikes(@CurrentUser('id') userId: string) {
    return this.discoveryService.getReceivedLikes(userId);
  }
}
