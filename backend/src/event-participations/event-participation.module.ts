import { Module } from '@nestjs/common';
import { EventParticipationService } from './event-participation.service';
import { EventParticipationController } from './event-participation.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EventParticipationController],
  providers: [EventParticipationService, PrismaService],
})
export class EventParticipationModule {}