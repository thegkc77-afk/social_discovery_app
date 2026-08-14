// auth.ts stub

export const sendOTP = async (phoneNumber: string): Promise<boolean> => {
  console.log('[Auth Service] Sending OTP to:', phoneNumber);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
};

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
  console.log('[Auth Service] Verifying OTP:', otp, 'for', phoneNumber);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return otp === '123456' || otp.length === 6; // Standard dev bypass or full digits
};
