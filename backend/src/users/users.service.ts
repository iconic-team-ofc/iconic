import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(data: {
    uid: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    phone_number?: string;
  }) {
    const { email, full_name, profile_picture_url, phone_number } = data;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          full_name,
          profile_picture_url,
          phone_number,
          role: Role.user,
        },
      });
    }

    return user;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async promoteToIconic(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        is_iconic: true,
        iconic_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // +30 dias
      },
    });
  }

  async findIconicUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        is_iconic: true,
        iconic_expires_at: {
          gt: new Date(),
        },
      },
    });

    return users;
  }

  async findPublicUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        show_public_profile: true,
      },
    });

    return users;
  }
}
