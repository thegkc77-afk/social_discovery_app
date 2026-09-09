import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatsModule } from '../chats/chats.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VERIFICATION_PROVIDER } from './providers/verification-provider.interface';
import { DevVerificationProvider } from './providers/dev-verification.provider';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ChatsModule),
    forwardRef(() => NotificationsModule),
  ],
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
