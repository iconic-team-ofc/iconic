import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventParticipationDto } from './dtos/create-event-participation.dto';
import { UpdateEventParticipationDto } from './dtos/update-event-participation.dto';
import { Role } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EventParticipationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('participation') private participationQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateEventParticipationDto) {
    await this.participationQueue.add('register-user', {
      userId,
      eventId: dto.event_id,
    });

    return {
      status: 'queued',
      message: 'Registration is being processed',
    };
  }

  async registerLogic(userId: string, eventId: string) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new NotFoundException('Event not found');

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      if (event.is_exclusive && !user.is_iconic) {
        throw new ForbiddenException('Only ICONIC users can join this event');
      }

      const existing = await tx.eventParticipation.findFirst({
        where: { user_id: userId, event_id: eventId },
      });

      if (existing?.status === 'confirmed') {
        throw new ConflictException('You already joined this event');
      }

      if (existing?.status === 'cancelled') {
        if (event.current_attendees >= event.max_attendees) {
          throw new ForbiddenException('Event is full');
        }

        await tx.event.update({
          where: { id: eventId },
          data: { current_attendees: { increment: 1 } },
        });

        return tx.eventParticipation.update({
          where: { id: existing.id },
          data: {
            status: 'confirmed',
            cancelled_at: null,
          },
        });
      }

      if (event.current_attendees >= event.max_attendees) {
        throw new ForbiddenException('Event is full');
      }

      await tx.event.update({
        where: { id: eventId },
        data: { current_attendees: { increment: 1 } },
      });

      return tx.eventParticipation.create({
        data: {
          user_id: userId,
          event_id: eventId,
          status: 'confirmed',
        },
      });
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
      const participation = await this.prisma.eventParticipation.findUnique({
        where: { id },
      });

      if (!participation)
        throw new NotFoundException('Participation not found');

      await this.prisma.$transaction([
        this.prisma.event.update({
          where: { id: participation.event_id },
          data: { current_attendees: { decrement: 1 } },
        }),
        this.prisma.eventParticipation.update({
          where: { id },
          data: {
            status: 'cancelled',
            cancelled_at: new Date(),
          },
        }),
      ]);

      return { message: 'Participation cancelled' };
    }

    return this.prisma.eventParticipation.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.eventParticipation.delete({ where: { id } });
  }

  async findConfirmedUsersWithProfiles(
    eventId: string,
    requesterId: string,
    requesterRole: Role,
  ) {
    const participations = await this.prisma.eventParticipation.findMany({
      where: { event_id: eventId, status: 'confirmed' },
      include: {
        user: true,
      },
    });

    const isAdmin = requesterRole === 'admin';

    const requesterIsConfirmed = participations.some(
      (p) => p.user_id === requesterId,
    );

    if (!requesterIsConfirmed && !isAdmin) {
      throw new ForbiddenException(
        'Você precisa estar confirmado no evento para ver os perfis',
      );
    }

    return participations.map(({ user }) => {
      const isPublic = user.show_public_profile;
      const isIconicVisible =
        user.show_profile_to_iconics && requesterRole === 'iconic';

      if (isAdmin || isPublic || isIconicVisible || user.id === requesterId) {
        return {
          id: user.id,
          full_name: user.full_name,
          nickname: user.nickname,
          is_iconic: user.is_iconic,
          profile_picture_url: user.profile_picture_url,
        };
      } else {
        return {
          id: user.id,
          nickname: 'Perfil Privado',
          is_iconic: user.is_iconic,
          profile_picture_url: null,
        };
      }
    });
  }
}