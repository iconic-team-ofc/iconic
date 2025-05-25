// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Options,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PromoteIconicGuard } from './promote-iconic.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfilePictureDto } from './dtos/update-profile-picture.dto';
import { Role } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ------------------------------------------------------------------
  // CORS pre-flight (somente para dev)
  // ------------------------------------------------------------------
  @Options('*')
  @Header('Access-Control-Allow-Origin', 'http://localhost:5173')
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  )
  @Header(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization, X-Transaction-Id',
  )
  options() {}

  // ------------------------------------------------------------------
  // PERFIL PRÓPRIO
  // ------------------------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.sub);
  }

  // ------------------------------------------------------------------
  // FOTO DE PERFIL (estático, vem antes do :id)
  // ------------------------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Patch('profile-picture')
  @ApiOperation({ summary: 'Atualiza a foto de perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada' })
  async updateProfilePicture(@Req() req, @Body() dto: UpdateProfilePictureDto) {
    return this.usersService.updateProfilePicture(req.user.sub, dto.url);
  }

  // ------------------------------------------------------------------
  // LISTA TODOS (admin)
  // ------------------------------------------------------------------
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async findAll() {
    return this.usersService.findAll();
  }

  // ------------------------------------------------------------------
  // OBTÉM USUÁRIO POR ID
  // ------------------------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findById(id);
  }

  // ------------------------------------------------------------------
  // ATUALIZA USUÁRIO POR ID (admin)
  // ------------------------------------------------------------------
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  // ------------------------------------------------------------------
  // REMOVE USUÁRIO (admin)
  // ------------------------------------------------------------------
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }

  // ------------------------------------------------------------------
  // PROMOVE A ICONIC
  // ------------------------------------------------------------------
  @UseGuards(JwtAuthGuard, PromoteIconicGuard)
  @Post('iconic/:id')
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  async promoteToIconic(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.promoteToIconic(id);
  }

  // ------------------------------------------------------------------
  // PERFIL PÚBLICO
  // ------------------------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get('public/:id')
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  async getPublicProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req,
  ) {
    return this.usersService.getPublicProfileWithPhotos(id, req.user.sub);
  }
}
