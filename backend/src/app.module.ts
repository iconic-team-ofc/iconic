// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { EventParticipationModule } from './event-participations/event-participation.module';
import { EventCheckinModule } from './event-checkins/event-checkin.module';
import { UserPhotosModule } from './user-photos/user-photo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    LoggerModule.forRoot({
      pinoHttp: { transport: { target: 'pino-pretty' } },
    }),

    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({ name: 'checkin' }),
    BullModule.registerQueue({ name: 'participation' }),

    // Cache em memória (para produção, troque o store para Redis)
    CacheModule.register({
      ttl: 60, // tempo de vida em segundos
      max: 100, // número máximo de itens
    }),

    AuthModule,
    UsersModule,
    EventsModule,
    EventParticipationModule,
    EventCheckinModule,
    UserPhotosModule,
  ],
  providers: [
    // aplica cache de resposta HTTP em todas as rotas
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    // aplica rate limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
