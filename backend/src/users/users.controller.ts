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
    schema: {
      example: {
        id: 'uuid',
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      },
    },
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

  @UseGuards(JwtAuthGuard)
  @Get('iconic')
  @ApiOperation({ summary: 'Get all ICONIC users (valid ones)' })
  @ApiResponse({ status: 200, description: 'List of ICONIC users' })
  getIconicUsers() {
    return this.usersService.findIconicUsers();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get users with public profiles' })
  @ApiResponse({ status: 200, description: 'List of public users' })
  getPublicUsers() {
    return this.usersService.findPublicUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List all users (admin only recommended)' })
  @ApiResponse({ status: 200, description: 'All users returned' })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile (self or admin)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User returned by ID',
    schema: {
      example: {
        id: 'uuid',
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}