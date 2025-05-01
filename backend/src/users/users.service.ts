import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  constructor(private prisma: PrismaService) {}

  async findOrCreate(data: {
    uid: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    phone_number?: string;
    date_of_birth?: Date;
  }) {
    const { email, full_name, profile_picture_url, phone_number, date_of_birth } = data;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          full_name,
          profile_picture_url,
          phone_number,
          role: Role.user,
          nickname: email.split('@')[0],
          date_of_birth,
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

  async removeWithPhotos(id: string) {
    const photos = await this.prisma.userPhoto.findMany({
      where: { user_id: id },
    });

    const paths = photos.map((p) => `${id}/${p.url.split('/').pop()}`);

    if (paths.length > 0) {
      const { error } = await this.supabase.storage
        .from('user-photos')
        .remove(paths);

      if (error) {
        console.error('Erro ao deletar fotos do Supabase:', error);
        throw error;
      }
    }

    // 🧹 Remove do banco: fotos do usuário
    await this.prisma.userPhoto.deleteMany({ where: { user_id: id } });

    // 🧹 Remove participações do usuário em eventos
    await this.prisma.eventParticipation.deleteMany({
      where: { user_id: id },
    });

    // 🧹 Remove o próprio usuário
    return this.prisma.user.delete({ where: { id } });
  }

  async promoteToIconic(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        is_iconic: true,
        iconic_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 dias
      },
    });
  }

  async promoteToScanner(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        role: Role.scanner,
      },
    });
  }

  async demoteScanner(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        role: Role.user,
      },
    });
  }

  async findIconicUsers() {
    return this.prisma.user.findMany({
      where: {
        is_iconic: true,
        iconic_expires_at: {
          gt: new Date(),
        },
      },
    });
  }

  async findPublicUsers() {
    return this.prisma.user.findMany({
      where: {
        show_public_profile: true,
      },
    });
  }

  async getPublicProfileWithPhotos(
    userId: string,
    requesterId: string | null = null,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            url: true,
            position: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.show_public_profile) {
      if (!requesterId) throw new ForbiddenException('Private profile');

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterId },
      });
      if (!requester) throw new ForbiddenException();

      const isIconicRequester = requester.is_iconic;
      if (!user.show_profile_to_iconics || !isIconicRequester) {
        throw new ForbiddenException('Private profile');
      }
    }

    const {
      id,
      full_name,
      nickname,
      bio,
      instagram,
      profile_picture_url,
      is_iconic,
      photos,
    } = user;
    return {
      id,
      full_name,
      nickname,
      bio,
      instagram,
      profile_picture_url,
      is_iconic,
      photos,
    };
  }

  async updateProfilePicture(userId: string, url: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { profile_picture_url: url },
    });
  }
}
