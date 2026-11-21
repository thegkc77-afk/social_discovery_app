export type BackendVerificationStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'PROCESSING'
  | 'VERIFIED'
  | 'FAILED'
  | 'MANUAL_REVIEW'
  | 'EXPIRED'
  | 'CANCELLED';

export type ClientVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'manual_review'
  | 'expired'
  | 'cancelled';

export interface VerificationSessionResponse {
  sessionId: string;
  status: BackendVerificationStatus;
  verified: boolean;
  startedAt?: string;
  completedAt?: string | null;
  expiresAt?: string;
  message?: string;
}

export interface VerificationStatusResponse {
  status: BackendVerificationStatus;
  verified: boolean;
  sessionId?: string;
  message?: string;
}

const statusMap: Record<BackendVerificationStatus, ClientVerificationStatus> = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  PROCESSING: 'processing',
  VERIFIED: 'verified',
  FAILED: 'failed',
  MANUAL_REVIEW: 'manual_review',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const toClientVerificationStatus = (
  status?: string | null
): ClientVerificationStatus => {
  if (!status) return 'verified';
  const normalized = status.toUpperCase() as BackendVerificationStatus;
  return statusMap[normalized] || 'verified';
};

export const startVerificationSession = async (): Promise<VerificationSessionResponse> => {
  return {
    sessionId: `session-${Date.now()}`,
    status: 'VERIFIED',
    verified: true,
    message: 'Verification completed successfully.',
  };
};

export const checkVerificationStatus = async (): Promise<VerificationStatusResponse> => {
  return {
    status: 'VERIFIED',
    verified: true,
    sessionId: 'session-client-mock',
    message: 'Verified profile',
  };
};

export const getVerificationSession = async (
  sessionId: string
): Promise<VerificationSessionResponse> => {
  return {
    sessionId,
    status: 'VERIFIED',
    verified: true,
    message: 'Session valid',
  };
};

export const retryVerification = async (): Promise<VerificationSessionResponse> => {
  return {
    sessionId: `session-retry-${Date.now()}`,
    status: 'VERIFIED',
    verified: true,
    message: 'Retry verified.',
  };
};
