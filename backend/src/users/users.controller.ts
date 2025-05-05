import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile returned successfully',
  })
  async getMe(@Req() req) {
    const userId = req.user?.sub;
    return this.usersService.findById(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post('iconic/:id')
  @ApiOperation({ summary: 'Promote a user to ICONIC (admin only)' })
  @ApiResponse({ status: 200, description: 'User promoted to ICONIC' })
  promoteToIconic(@Param('id') id: string) {
    return this.usersService.promoteToIconic(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post('scanner/:id')
  @ApiOperation({ summary: 'Promote a user to SCANNER (admin only)' })
  @ApiResponse({ status: 200, description: 'User promoted to SCANNER' })
  promoteToScanner(@Param('id') id: string) {
    return this.usersService.promoteToScanner(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post('scanner/:id/remove')
  @ApiOperation({ summary: 'Remove SCANNER role from a user (admin only)' })
  @ApiResponse({ status: 200, description: 'SCANNER role removed from user' })
  demoteScanner(@Param('id') id: string) {
    return this.usersService.demoteScanner(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('iconic')
  @ApiOperation({ summary: 'Get all ICONIC users (valid ones)' })
  @ApiResponse({ status: 200, description: 'List of ICONIC users' })
  getIconicUsers() {
    return this.usersService.findIconicUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin)
  @Get('public')
  @ApiOperation({ summary: 'Get users with public profiles' })
  @ApiResponse({ status: 200, description: 'List of public users' })
  getPublicUsers() {
    return this.usersService.findPublicUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin)
  @Get()
  @ApiOperation({ summary: 'List all users (admin only recommended)' })
  @ApiResponse({ status: 200, description: 'All users returned' })
  findAll() {
    return this.usersService.findAll();
  }

  // Static route before dynamic to avoid ForbiddenException
  @UseGuards(JwtAuthGuard)
  @Patch('profile-picture')
  @ApiOperation({ summary: 'Update main profile picture' })
  @ApiBody({ schema: { example: { url: 'https://...' } } })
  @ApiResponse({ status: 200, description: 'Profile picture updated' })
  updateProfilePicture(@Req() req, @Body() body: { url: string }) {
    return this.usersService.updateProfilePicture(req.user.sub, body.url);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile (self or admin)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    const requesterId = req.user.sub;
    const isAdmin = req.user.role === Role.admin;
    if (requesterId !== id && !isAdmin) {
      throw new ForbiddenException('Not authorized to update this user');
    }
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user and storage (self or admin)' })
  @ApiResponse({
    status: 204,
    description: 'User and photos deleted successfully',
  })
  async remove(@Req() req, @Param('id') id: string) {
    const requesterId = req.user.sub;
    const isAdmin = req.user.role === Role.admin;
    if (requesterId !== id && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this user');
    }
    return this.usersService.removeWithPhotos(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User returned by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('public/:id')
  @ApiOperation({ summary: 'Get full public user profile and photos by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns full profile and up to 6 photos',
  })
  async getPublicProfile(@Param('id') id: string, @Req() req) {
    return this.usersService.getPublicProfileWithPhotos(id, req.user.sub);
  }
}