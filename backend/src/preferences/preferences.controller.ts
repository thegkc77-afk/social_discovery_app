import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('Preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get(':userId')
  @ApiOperation({ summary: "Get user's discovery preferences" })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  findByUserId(@Param('userId') userId: string) {
    return this.preferencesService.findByUserId(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: "Update user's discovery preferences" })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  update(
    @Param('userId') userId: string,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    return this.preferencesService.update(userId, updatePreferencesDto);
  }
}
