export const OTP_PROVIDER = 'OTP_PROVIDER';

export interface IOtpProvider {
  /**
   * Dispatches the OTP to the specified phone number.
   * Can be implemented by DevOtpProvider, TwilioProvider, FirebaseProvider, AWS SNS, etc.
   */
  sendOtp(phoneNumber: string, otp: string): Promise<boolean>;
}
