import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserPhotoDto } from './dtos/create-user-photo.dto';
import { UpdateUserPhotoDto } from './dtos/update-user-photo.dto';

@Injectable()
export class UserPhotosService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.userPhoto.findMany({
      where: { user_id: userId },
      orderBy: { position: 'asc' },
    });
  }

  async upload(userId: string, dto: CreateUserPhotoDto) {
    const existingPhotos = await this.prisma.userPhoto.findMany({
      where: { user_id: userId },
      orderBy: { position: 'asc' },
    });

    if (existingPhotos.length >= 6) {
      throw new BadRequestException('Você já atingiu o limite de 6 fotos.');
    }

    const usedPositions = new Set(existingPhotos.map((p) => p.position));
    const nextPosition =
      [...Array(6).keys()]
        .map((i) => i + 1)
        .find((p) => !usedPositions.has(p)) ?? 6;

    return this.prisma.userPhoto.create({
      data: {
        user_id: userId,
        url: dto.url,
        position: nextPosition,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateUserPhotoDto) {
    const photo = await this.prisma.userPhoto.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photo not found');
    if (photo.user_id !== userId) throw new ForbiddenException();

    if (dto.position && (dto.position < 1 || dto.position > 6)) {
      throw new BadRequestException('Position must be between 1 and 6');
    }

    if (dto.position) {
      const conflict = await this.prisma.userPhoto.findFirst({
        where: {
          user_id: userId,
          position: dto.position,
          NOT: { id },
        },
      });
      if (conflict) {
        throw new BadRequestException('Position already in use');
      }
    }

    return this.prisma.userPhoto.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    const photo = await this.prisma.userPhoto.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photo not found');
    if (photo.user_id !== userId) throw new ForbiddenException();

    await this.prisma.userPhoto.delete({ where: { id } });

    const photos = await this.prisma.userPhoto.findMany({
      where: { user_id: userId },
      orderBy: { position: 'asc' },
    });

    for (let i = 0; i < photos.length; i++) {
      await this.prisma.userPhoto.update({
        where: { id: photos[i].id },
        data: { position: i + 1 },
      });
    }
  }
}
