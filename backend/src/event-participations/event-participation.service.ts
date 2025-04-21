import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateEventParticipationDto } from './dtos/create-event-participation.dto';
  import { UpdateEventParticipationDto } from './dtos/update-event-participation.dto';
  
  @Injectable()
  export class EventParticipationService {
    constructor(private prisma: PrismaService) {}
  
    async create(userId: string, dto: CreateEventParticipationDto) {
      const event = await this.prisma.event.findUnique({
        where: { id: dto.event_id },
      });
  
      if (!event) throw new NotFoundException('Event not found');
  
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (event.is_exclusive && !user?.is_iconic) {
        throw new ForbiddenException('Only ICONIC users can join this event');
      }
  
      const existing = await this.prisma.eventParticipation.findFirst({
        where: { user_id: userId, event_id: dto.event_id },
      });
  
      if (existing?.status === 'confirmed') {
        throw new ConflictException('You already joined this event');
      }
  
      if (existing?.status === 'cancelled') {
        return this.prisma.eventParticipation.update({
          where: { id: existing.id },
          data: { status: 'confirmed', cancelled_at: null },
        });
      }
  
      const currentCount = await this.prisma.eventParticipation.count({
        where: { event_id: dto.event_id, status: 'confirmed' },
      });
  
      if (currentCount >= event.max_attendees) {
        throw new ForbiddenException('This event is full');
      }
  
      return this.prisma.eventParticipation.create({
        data: {
          user_id: userId,
          event_id: dto.event_id,
          status: 'confirmed',
        },
      });
    }
  
    findAll() {
      return this.prisma.eventParticipation.findMany({
        include: { user: true, event: true },
      });
    }
  
    findById(id: string) {
      return this.prisma.eventParticipation.findUnique({
        where: { id },
        include: { user: true, event: true },
      });
    }
  
    async update(id: string, dto: UpdateEventParticipationDto) {
      if (dto.status === 'cancelled') {
        return this.prisma.eventParticipation.update({
          where: { id },
          data: {
            status: 'cancelled',
            cancelled_at: new Date(),
          },
        });
      }
  
      return this.prisma.eventParticipation.update({
        where: { id },
        data: dto,
      });
    }
  
    remove(id: string) {
      return this.prisma.eventParticipation.delete({ where: { id } });
    }
  
    async findConfirmedUsers(eventId: string) {
      return this.prisma.eventParticipation.findMany({
        where: {
          event_id: eventId,
          status: 'confirmed',
        },
        include: {
          user: true,
        },
      });
    }
  }
  