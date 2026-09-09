import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from './otp-provider.interface';

@Injectable()
export class DevOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(DevOtpProvider.name);

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    this.logger.log(
      `\n=========================================\n📲 [DEV OTP DISPATCH]\nPhone: ${phoneNumber}\nOTP Code: ${otp}\n=========================================`,
    );
    return true;
  }
}
