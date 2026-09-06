import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req) {
    return this.notificationsService.findAllForUser(req.user.userId);
  }

  @Post('morning-briefing')
  triggerMorningBriefing(@Request() req) {
    return this.notificationsService.generateMorningBriefing(req.user.userId);
  }

  @Post('night-reflection')
  triggerNightReflection(@Request() req) {
    return this.notificationsService.generateNightReflection(req.user.userId);
  }

  @Post(':id/sent')
  markAsSent(@Param('id') id: string) {
    return this.notificationsService.markAsSent(id);
  }
}
