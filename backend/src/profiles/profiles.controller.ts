import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Body,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially update current user profile' })
  updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(userId, updateProfileDto);
  }

  @Post('me/onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete onboarding for current authenticated user' })
  completeMyOnboarding(
    @CurrentUser('id') userId: string,
    @Body() completeOnboardingDto: CompleteOnboardingDto,
  ) {
    return this.profilesService.completeOnboarding(userId, completeOnboardingDto);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Create or replace user profile (upsert)' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile created or updated' })
  upsert(
    @Param('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profilesService.upsert(userId, createProfileDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by User ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Profile not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Partially update user profile' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  update(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(userId, updateProfileDto);
  }

  @Post(':userId/onboarding')
  @ApiOperation({ summary: 'Complete full user onboarding in one step by user ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Onboarding completed and profile populated' })
  completeOnboarding(
    @Param('userId') userId: string,
    @Body() completeOnboardingDto: CompleteOnboardingDto,
  ) {
    return this.profilesService.completeOnboarding(userId, completeOnboardingDto);
  }
}
