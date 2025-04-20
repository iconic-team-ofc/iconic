// src/event-checkins/event-checkin.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { differenceInSeconds } from 'date-fns';

@Injectable()
export class EventCheckinService {
  constructor(private prisma: PrismaService) {}

  async generate(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const participation = await this.prisma.eventParticipation.findFirst({
      where: { user_id: userId, event_id: eventId, status: 'confirmed' },
    });
    if (!participation)
      throw new ForbiddenException('You are not confirmed for this event');

    // ❌ Se já escaneou, não pode gerar
    const alreadyCheckedIn = await this.prisma.eventCheckin.findFirst({
      where: {
        user_id: userId,
        event_id: eventId,
        NOT: { checkin_time: new Date(0) },
      },
    });
    if (alreadyCheckedIn)
      throw new ConflictException('You have already checked in');

    // ⏱️ Verifica geração recente
    const lastPending = await this.prisma.eventCheckin.findFirst({
      where: {
        user_id: userId,
        event_id: eventId,
        checkin_time: new Date(0),
      },
      orderBy: { created_at: 'desc' },
    });

    if (lastPending) {
      const seconds = differenceInSeconds(new Date(), lastPending.created_at);
      if (seconds < 15) {
        throw new ConflictException(
          'Please wait 15 seconds before generating a new QR code',
        );
      }
    }

    return this.prisma.eventCheckin.create({
      data: {
        user_id: userId,
        event_id: eventId,
        qr_token: uuidv4(),
        scanned_by_admin_id: null, // será preenchido no scan
        checkin_time: new Date(0),
      },
    });
  }

  async scan(qr_token: string, adminId: string) {
    const checkin = await this.prisma.eventCheckin.findUnique({
      where: { qr_token },
    });

    if (!checkin) throw new NotFoundException('QR code not found');

    // ❌ Já escaneado
    if (checkin.checkin_time.getTime() !== new Date(0).getTime()) {
      throw new ConflictException('This QR code has already been used');
    }

    // ⏳ Expirado
    const secondsSinceCreated = differenceInSeconds(
      new Date(),
      checkin.created_at,
    );
    if (secondsSinceCreated > 60) {
      throw new ForbiddenException('QR code has expired');
    }

    return this.prisma.eventCheckin.update({
      where: { id: checkin.id },
      data: {
        checkin_time: new Date(),
        scanned_by_admin_id: adminId,
      },
    });
  }

  async findByEvent(eventId: string) {
    return this.prisma.eventCheckin.findMany({
      where: { event_id: eventId },
      include: { user: true, scanned_by: true },
    });
  }

  async delete(checkinId: string) {
    const checkin = await this.prisma.eventCheckin.findUnique({
      where: { id: checkinId },
    });
    if (!checkin) throw new NotFoundException('Check-in not found');

    return this.prisma.eventCheckin.delete({ where: { id: checkinId } });
  }
}
