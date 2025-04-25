import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  @ApiOperation({ summary: 'Create a new event (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'ICONIC Drop',
        location: 'Av Paulista, SP',
        category: 'party',
        is_exclusive: true,
      },
    },
  })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get('public')
  @ApiOperation({ summary: 'List all public events' })
  @ApiResponse({
    status: 200,
    description: 'List of public events',
  })
  findPublic() {
    return this.eventsService.findAllPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  @ApiOperation({ summary: 'List all exclusive events (requires login)' })
  @ApiResponse({
    status: 200,
    description: 'List of private (exclusive) events',
  })
  findPrivate() {
    return this.eventsService.findAllExclusive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns event data',
    schema: {
      example: {
        id: 'uuid',
        title: 'ICONIC Dinner',
        date: '2025-07-12T00:00:00.000Z',
        time: '18:00',
        is_public: false,
      },
    },
  })
  findById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update event data (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
  })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete event (admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Event deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  @ApiOperation({ summary: 'List recommended events for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a curated list of events for the user',
  })
  findRecommended(@Req() req) {
    return this.eventsService.findRecommendedForUser(req.user.sub);
  }
}
