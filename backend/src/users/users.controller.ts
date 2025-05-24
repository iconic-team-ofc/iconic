import { Controller, Get, Post, Patch, Param, Delete,
         UseGuards, Req, HttpCode, ForbiddenException,
         Header, Options, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { PromoteIconicGuard } from './promote-iconic.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Preflight CORS handler; consider enabling CORS globally in main.ts
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned successfully' })
  async getMe(@Req() req) {
    const userId = req.user?.sub;
    return this.usersService.findById(userId);
  }

  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User returned successfully' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Endpoint de promoção ICONIC: apenas admins ou Sui TX confirmada
  @UseGuards(JwtAuthGuard, PromoteIconicGuard)
  @Post('iconic/:id')
  @ApiOperation({ summary: 'Promote a user to ICONIC (admin or Sui TX)' })
  @ApiResponse({ status: 200, description: 'User promoted to ICONIC' })
  async promoteToIconic(@Param('id') id: string, @Req() req) {
    return this.usersService.promoteToIconic(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('public/:id')
  @ApiOperation({ summary: 'Get full public user profile and photos by ID' })
  @ApiResponse({ status: 200, description: 'Returns full profile and up to 6 photos' })
  async getPublicProfile(@Param('id') id: string, @Req() req) {
    return this.usersService.getPublicProfileWithPhotos(id, req.user.sub);
  }
}
