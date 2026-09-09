import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user location coordinates' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.updateLocation(userId, dto);
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Update user location by ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  updateLocationByUserId(
    @Param('userId') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.updateLocation(userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user location' })
  getMyLocation(@CurrentUser('id') userId: string) {
    return this.locationsService.getLocation(userId);
  }
}
