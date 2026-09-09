import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { MatchingGateway } from './matching.gateway';
import { CompatibilityService } from './services/compatibility.service';
import { MatchingQueueService } from './services/matching-queue.service';

@Module({
  controllers: [MatchingController],
  providers: [
    MatchingService,
    MatchingGateway,
    CompatibilityService,
    MatchingQueueService,
  ],
  exports: [MatchingService, MatchingGateway, CompatibilityService],
})
export class MatchingModule {}
