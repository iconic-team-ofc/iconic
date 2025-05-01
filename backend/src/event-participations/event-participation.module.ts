import { Module } from '@nestjs/common';
import { EventParticipationService } from './event-participation.service';
import { EventParticipationController } from './event-participation.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BullModule } from '@nestjs/bull';
import { ParticipationProcessor } from './participation.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'participation' })],
  controllers: [EventParticipationController],
  providers: [EventParticipationService, PrismaService, ParticipationProcessor],
})
export class EventParticipationModule {}
