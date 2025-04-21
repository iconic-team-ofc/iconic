// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { EventParticipationModule } from './event-participations/event-participation.module';
import { EventCheckinModule } from './event-checkins/event-checkin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    EventsModule,
    EventParticipationModule,
    EventCheckinModule, 
  ],
})
export class AppModule {}
