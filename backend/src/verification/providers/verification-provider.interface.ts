export const VERIFICATION_PROVIDER = 'VERIFICATION_PROVIDER';

export interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  notes?: string;
}

export interface IVerificationProvider {
  /**
   * Performs face liveness and likeness verification for identity validation.
   * Can be implemented by DevVerificationProvider, AWS Rekognition, Persona, Jumio, etc.
   */
  verifyLiveness(userId: string, selfieDataOrUri: string): Promise<VerificationResult>;
}
