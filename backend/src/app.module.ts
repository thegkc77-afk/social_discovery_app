import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { InterestsModule } from './interests/interests.module';
import { PhotosModule } from './photos/photos.module';
import { PreferencesModule } from './preferences/preferences.module';
import { VerificationModule } from './verification/verification.module';
import { LocationsModule } from './locations/locations.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { MatchingModule } from './matching/matching.module';
import { ChatsModule } from './chats/chats.module';
import { MeetupsModule } from './meetups/meetups.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env', '.env.example'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    InterestsModule,
    PhotosModule,
    PreferencesModule,
    VerificationModule,
    LocationsModule,
    DiscoveryModule,
    MatchingModule,
    ChatsModule,
    MeetupsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
