import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // Cria um evento (admin)
  async create(dto: CreateEventDto) {
    const datetime = new Date(`${dto.date}T${dto.time}:00`);
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        date: datetime,
        time: datetime,
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

  // Lista todos públicos
  async findAllPublic() {
    return this.prisma.event.findMany({ where: { is_public: true } });
  }

  // Lista todos exclusivos (login)
  async findAllExclusive() {
    return this.prisma.event.findMany({ where: { is_exclusive: true } });
  }

  // Busca evento puro
  async findById(id: string) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  // Atualiza evento (admin)
  async update(id: string, dto: UpdateEventDto) {
    let date: Date | undefined;
    let time: Date | undefined;
    if (dto.date && dto.time) {
      const dt = new Date(`${dto.date}T${dto.time}:00`);
      date = dt;
      time = dt;
    }
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        ...(date && { date }),
        ...(time && { time }),
      },
    });
  }

  // Remove evento (admin)
  async remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }

  // --- NOVOS MÉTODOS PARA PARTICIPAÇÃO ---

  /** Busca um evento + is_participating e participation_id */
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

  /** Lógica original de recomendação */
  async findRecommendedForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const where = user.is_iconic ? { is_exclusive: true } : { is_public: true };

    return this.prisma.event.findMany({ where });
  }

  /** Recomendados + flags de participação */
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
}