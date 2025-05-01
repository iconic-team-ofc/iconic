import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { EventParticipationService } from './event-participation.service';

@Processor('participation')
@Injectable()
export class ParticipationProcessor {
  constructor(private readonly service: EventParticipationService) {}

  @Process('register-user')
  async handleRegistration(job: Job<{ userId: string; eventId: string }>) {
    const { userId, eventId } = job.data;
    await this.service.registerLogic(userId, eventId);
  }
}
