import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatsModule } from '../chats/chats.module';
import { MeetupsController } from './meetups.controller';
import { MeetupsService } from './meetups.service';

@Module({
  imports: [PrismaModule, forwardRef(() => ChatsModule)],
  controllers: [MeetupsController],
  providers: [MeetupsService],
  exports: [MeetupsService],
})
export class MeetupsModule {}
