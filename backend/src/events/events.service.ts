import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    let dt: Date;

    // Se `dto.date` já vier no formato ISO completo, usa diretamente
    if (dto.date.includes('T')) {
      dt = new Date(dto.date);
    } else {
      // Senão combina date + time
      if (!dto.time) {
        throw new BadRequestException(
          '`time` is required when `date` is not full ISO string',
        );
      }
      const [h, m] = dto.time.split(':').map(Number);
      dt = new Date(dto.date);
      dt.setHours(h, m, 0, 0);
    }

    if (isNaN(dt.getTime())) {
      throw new BadRequestException(
        `Invalid date/time: ${dto.date} / ${dto.time}`,
      );
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        date: dt,
        time: dt,
        category: dto.category,
        is_exclusive: dto.is_exclusive,
        is_public: dto.is_public,
        max_attendees: dto.max_attendees,
        current_attendees: 0,
        partner_name: dto.partner_name,
        partner_logo_url: dto.partner_logo_url,
        cover_image_url: dto.cover_image_url,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.event.findMany({ where: { is_public: true } });
  }

  async findAllExclusive() {
    return this.prisma.event.findMany({ where: { is_exclusive: true } });
  }

  async findById(id: string) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateEventDto) {
    const data: any = { ...dto };

    if (dto.date && dto.time) {
      const [h, m] = dto.time.split(':').map(Number);
      const dt = new Date(dto.date);
      dt.setHours(h, m, 0, 0);
      if (isNaN(dt.getTime())) {
        throw new BadRequestException(
          `Invalid date/time: ${dto.date} / ${dto.time}`,
        );
      }
      data.date = dt;
      data.time = dt;
    }

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }

  async findByIdWithParticipation(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const part = await this.prisma.eventParticipation.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
        status: 'confirmed',
      },
      select: { id: true },
    });

    return {
      ...event,
      is_participating: Boolean(part),
      participation_id: part?.id,
    };
  }

  async findRecommendedForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Iconic vê tudo, users só vêem eventos públicos
    const where = user.is_iconic ? {} : { is_public: true };
    return this.prisma.event.findMany({ where });
  }

  async findRecommendedWithParticipation(userId: string) {
    const events = await this.findRecommendedForUser(userId);

    const parts = await this.prisma.eventParticipation.findMany({
      where: {
        user_id: userId,
        status: 'confirmed',
        event_id: { in: events.map((e) => e.id) },
      },
      select: { event_id: true, id: true },
    });

    const map = new Map(parts.map((p) => [p.event_id, p.id]));

    return events.map((e) => ({
      ...e,
      is_participating: map.has(e.id),
      participation_id: map.get(e.id),
    }));
  }

  async findParticipating(userId: string) {
    const participations = await this.prisma.eventParticipation.findMany({
      where: { user_id: userId, status: 'confirmed' },
      select: { event_id: true, id: true },
    });

    const eventIds = participations.map((p) => p.event_id);
    const events = await this.prisma.event.findMany({
      where: { id: { in: eventIds } },
    });

    return events.map((e) => ({
      ...e,
      is_participating: true,
      participation_id: participations.find((p) => p.event_id === e.id)?.id,
    }));
  }
}
