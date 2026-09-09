import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check server and database health status' })
  @ApiResponse({
    status: 200,
    description: 'Server health report',
    schema: {
      example: {
        success: true,
        data: {
          status: 'ok',
          timestamp: '2026-09-09T00:00:00.000Z',
          uptime: 12.34,
          environment: 'development',
          services: {
            server: { status: 'up' },
            database: { status: 'up' },
          },
        },
        timestamp: '2026-09-09T00:00:00.000Z',
      },
    },
  })
  async check() {
    return this.healthService.getHealth();
  }
}
