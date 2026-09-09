import { Injectable, Logger } from '@nestjs/common';
import { IVerificationProvider, VerificationResult } from './verification-provider.interface';

@Injectable()
export class DevVerificationProvider implements IVerificationProvider {
  private readonly logger = new Logger(DevVerificationProvider.name);

  async verifyLiveness(userId: string, selfieDataOrUri: string): Promise<VerificationResult> {
    this.logger.log(`[DEV VERIFICATION] Processing liveness check for user '${userId}'...`);

    // In dev mode, auto-approve valid inputs with high confidence
    return {
      isVerified: true,
      confidence: 0.98,
      notes: 'Automated simulated liveness check passed (Dev Mode)',
    };
  }
}
