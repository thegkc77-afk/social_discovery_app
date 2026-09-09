import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { SetUserInterestsDto } from './dto/set-user-interests.dto';

@ApiTags('Interests')
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all global interest tags' })
  findAll() {
    return this.interestsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new interest in the global catalog' })
  create(@Body() createInterestDto: CreateInterestDto) {
    return this.interestsService.create(createInterestDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "Get a specific user's selected interests" })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  getUserInterests(@Param('userId') userId: string) {
    return this.interestsService.getUserInterests(userId);
  }

  @Post('user/:userId')
  @ApiOperation({ summary: "Set or replace a user's selected interests" })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  setUserInterests(
    @Param('userId') userId: string,
    @Body() dto: SetUserInterestsDto,
  ) {
    return this.interestsService.setUserInterests(userId, dto.interests);
  }
}
