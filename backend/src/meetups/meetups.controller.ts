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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { QueryMeetupsDto } from './dto/query-meetups.dto';
import { MeetupsService } from './meetups.service';

@ApiTags('Meetups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetups')
export class MeetupsController {
  constructor(private readonly meetupsService: MeetupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create and send a meetup invitation (Status: PENDING)' })
  @ApiResponse({ status: 201, description: 'Meetup invitation created successfully' })
  createMeetup(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMeetupDto,
  ) {
    return this.meetupsService.createMeetup(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List meetups for current user with optional status filter' })
  @ApiResponse({ status: 200, description: 'List of meetups returned' })
  getMeetups(
    @CurrentUser('id') userId: string,
    @Query() query: QueryMeetupsDto,
  ) {
    return this.meetupsService.getMeetups(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a specific meetup' })
  @ApiParam({ name: 'id', description: 'Meetup ID' })
  @ApiResponse({ status: 200, description: 'Meetup details returned' })
  @ApiResponse({ status: 403, description: 'User is not a participant' })
  @ApiResponse({ status: 404, description: 'Meetup not found' })
  getMeetupById(
    @CurrentUser('id') userId: string,
    @Param('id') meetupId: string,
  ) {
    return this.meetupsService.getMeetupById(meetupId, userId);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a meetup invitation (State: PENDING -> ACCEPTED)' })
  @ApiParam({ name: 'id', description: 'Meetup ID' })
  @ApiResponse({ status: 200, description: 'Meetup accepted' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  acceptMeetup(
    @CurrentUser('id') userId: string,
    @Param('id') meetupId: string,
  ) {
    return this.meetupsService.acceptMeetup(meetupId, userId);
  }

  @Patch(':id/decline')
  @ApiOperation({ summary: 'Decline a meetup invitation (State: PENDING -> DECLINED)' })
  @ApiParam({ name: 'id', description: 'Meetup ID' })
  @ApiResponse({ status: 200, description: 'Meetup declined' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  declineMeetup(
    @CurrentUser('id') userId: string,
    @Param('id') meetupId: string,
  ) {
    return this.meetupsService.declineMeetup(meetupId, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a meetup invitation (State: PENDING/ACCEPTED -> CANCELLED)' })
  @ApiParam({ name: 'id', description: 'Meetup ID' })
  @ApiResponse({ status: 200, description: 'Meetup cancelled' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  cancelMeetup(
    @CurrentUser('id') userId: string,
    @Param('id') meetupId: string,
  ) {
    return this.meetupsService.cancelMeetup(meetupId, userId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark meetup as completed (State: ACCEPTED -> COMPLETED)' })
  @ApiParam({ name: 'id', description: 'Meetup ID' })
  @ApiResponse({ status: 200, description: 'Meetup marked completed' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  completeMeetup(
    @CurrentUser('id') userId: string,
    @Param('id') meetupId: string,
  ) {
    return this.meetupsService.completeMeetup(meetupId, userId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get current status and allowed transitions for a meetup' })
  @ApiParam({ name: 'id', description: 'Meetup ID' })
  @ApiResponse({ status: 200, description: 'Meetup status and allowed transitions returned' })
  getMeetupStatus(
    @CurrentUser('id') userId: string,
    @Param('id') meetupId: string,
  ) {
    return this.meetupsService.getMeetupStatus(meetupId, userId);
  }
}
