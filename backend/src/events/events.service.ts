import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { NotFoundException } from '@nestjs/common';


@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

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
        partner_name: dto.partner_name,
        partner_logo_url: dto.partner_logo_url,
        cover_image_url: dto.cover_image_url,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.event.findMany({
      where: {
        is_public: true,
      },
    });
  }

  async findAllExclusive() {
    return this.prisma.event.findMany({
      where: {
        is_exclusive: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    let date: Date | undefined;
    let time: Date | undefined;

    if (dto.date && dto.time) {
      const datetime = new Date(`${dto.date}T${dto.time}:00`);
      date = datetime;
      time = datetime;
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

  async remove(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async findRecommendedForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    const whereClause = user.is_iconic
      ? { is_public: false, is_exclusive: true }
      : {
          OR: [
            { is_public: true, is_exclusive: false },
            { is_public: true, is_exclusive: true },
          ],
        };

    return this.prisma.event.findMany({ where: whereClause });
  }
}
