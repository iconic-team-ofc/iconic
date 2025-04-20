import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { EventCheckinService } from './event-checkin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { GenerateCheckinDto } from './dtos/generate-checkin.dto';
import { AdminCheckinDto } from './dtos/admin-checkin.dto';

@ApiTags('Event Checkins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event-checkins')
export class EventCheckinController {
  constructor(private readonly service: EventCheckinService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate QR code for event (user must be confirmed)',
  })
  generate(@Req() req, @Body() dto: GenerateCheckinDto) {
    const userId = req.user.sub;
    return this.service.generate(userId, dto.event_id);
  }

  @Post('scan')
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({ summary: 'Scan QR code and confirm check-in (admin only)' })
  scan(@Req() req, @Body() dto: AdminCheckinDto) {
    const adminId = req.user.sub;
    return this.service.scan(dto.qr_token, adminId);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'List all check-ins for a specific event' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Delete(':checkin_id')
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a check-in (admin only)' })
  @ApiForbiddenResponse({ description: 'Only admins can delete check-ins' })
  delete(@Param('checkin_id') checkin_id: string) {
    return this.service.delete(checkin_id);
  }
}