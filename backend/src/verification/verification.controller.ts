import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit facial selfie for identity & liveness verification' })
  @ApiResponse({ status: 200, description: 'Verification check completed' })
  submitVerificationDefault(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitVerificationDto,
  ) {
    return this.verificationService.submitVerification(userId, dto);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit facial selfie for identity & liveness verification (alias)' })
  @ApiResponse({ status: 200, description: 'Verification check completed' })
  submitVerification(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitVerificationDto,
  ) {
    return this.verificationService.submitVerification(userId, dto);
  }

  @Post('submit/:userId')
  @ApiOperation({ summary: 'Submit verification by user ID (useful during onboarding)' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  submitVerificationByUserId(
    @Param('userId') userId: string,
    @Body() dto: SubmitVerificationDto,
  ) {
    return this.verificationService.submitVerification(userId, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user verification status and latest record' })
  getStatus(@CurrentUser('id') userId: string) {
    return this.verificationService.getStatus(userId);
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Get verification status by user ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  getStatusByUserId(@Param('userId') userId: string) {
    return this.verificationService.getStatus(userId);
  }

  @Get('records')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user verification submission history' })
  getRecords(@CurrentUser('id') userId: string) {
    return this.verificationService.getRecords(userId);
  }

  @Get('records/:userId')
  @ApiOperation({ summary: 'Get verification records by user ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  getRecordsByUserId(@Param('userId') userId: string) {
    return this.verificationService.getRecords(userId);
  }
}
