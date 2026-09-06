import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Request() req, @Body() createScheduleDto: any) {
    return this.schedulesService.create(req.user.userId, createScheduleDto);
  }

  @Get()
  findAll(@Request() req, @Query('date') date?: string) {
    if (date) {
      return this.schedulesService.findByDate(req.user.userId, date);
    }
    return this.schedulesService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.schedulesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateScheduleDto: any) {
    return this.schedulesService.update(id, req.user.userId, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.schedulesService.remove(id, req.user.userId);
  }
}
