// verification.ts stub

export interface VerificationRequest {
  userId: string;
  selfieUri: string;
}

export const submitUserVerification = async (request: VerificationRequest): Promise<boolean> => {
  console.log('[Verification Service] Submitting photo verification for:', request.userId, 'URI:', request.selfieUri);
  // Simulate facial analysis delays (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
};

export const checkVerificationStatus = async (userId: string): Promise<'unverified' | 'pending' | 'verified'> => {
  console.log('[Verification Service] Querying verification status for:', userId);
  return 'verified';
};
