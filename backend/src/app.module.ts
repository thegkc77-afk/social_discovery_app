import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { InterestsModule } from './interests/interests.module';
import { PhotosModule } from './photos/photos.module';
import { PreferencesModule } from './preferences/preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env', '.env.example'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    InterestsModule,
    PhotosModule,
    PreferencesModule,
  ],
})
export class AppModule {}
