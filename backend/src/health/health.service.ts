import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    server: {
      status: 'up';
    };
    database: {
      status: 'up' | 'down';
      message?: string;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async getHealth(): Promise<HealthResponse> {
    const dbHealth = await this.prismaService.checkHealth();
    const isOk = dbHealth.status === 'up';

    return {
      status: isOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      services: {
        server: {
          status: 'up',
        },
        database: dbHealth,
      },
    };
  }
}
