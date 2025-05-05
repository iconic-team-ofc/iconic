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

  /**
   * Busca um usuário pelo e-mail, ou cria um novo se não existir.
   */
  async findOrCreate(data: {
    uid: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    phone_number?: string;
    date_of_birth?: Date;
  }) {
    const {
      email,
      full_name,
      profile_picture_url,
      phone_number,
      date_of_birth,
    } = data;

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

  /**
   * Retorna um usuário pelo ID.
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Lista todos os usuários.
   */
  async findAll() {
    return this.prisma.user.findMany();
  }

  /**
   * Atualiza os dados de um usuário.
   * Converte date_of_birth de string ISO para Date antes de salvar.
   */
  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };
    if (dto.date_of_birth) {
      data.date_of_birth = new Date(dto.date_of_birth);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta um usuário.
   */
  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * Deleta usuário e suas fotos, removendo também do bucket Supabase.
   */
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

    await this.prisma.userPhoto.deleteMany({ where: { user_id: id } });
    await this.prisma.eventParticipation.deleteMany({ where: { user_id: id } });
    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * Promove um usuário a ICONIC.
   */
  async promoteToIconic(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        is_iconic: true,
        iconic_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 dias
      },
    });
  }

  /**
   * Promove um usuário a SCANNER.
   */
  async promoteToScanner(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        role: Role.scanner,
      },
    });
  }

  /**
   * Remove o papel SCANNER de um usuário.
   */
  async demoteScanner(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        role: Role.user,
      },
    });
  }

  /**
   * Lista usuários ICONIC válidos.
   */
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

  /**
   * Lista usuários com perfil público.
   */
  async findPublicUsers() {
    return this.prisma.user.findMany({
      where: {
        show_public_profile: true,
      },
    });
  }

  /**
   * Retorna perfil público completo com até 6 fotos.
   */
  async getPublicProfileWithPhotos(
    userId: string,
    requesterId: string | null = null,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, position: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // verifica visibilidade
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

  /**
   * Atualiza a foto de perfil principal.
   */
  async updateProfilePicture(userId: string, url: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { profile_picture_url: url },
    });
  }
}