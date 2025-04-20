import { Module } from '@nestjs/common';
import { EventCheckinService } from './event-checkin.service';
import { EventCheckinController } from './event-checkin.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EventCheckinController],
  providers: [EventCheckinService, PrismaService],
})
export class EventCheckinModule {}
