import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VERIFICATION_PROVIDER } from './providers/verification-provider.interface';
import { DevVerificationProvider } from './providers/dev-verification.provider';

@Module({
  controllers: [VerificationController],
  providers: [
    VerificationService,
    {
      provide: VERIFICATION_PROVIDER,
      useClass: DevVerificationProvider,
    },
  ],
  exports: [VerificationService],
})
export class VerificationModule {}
