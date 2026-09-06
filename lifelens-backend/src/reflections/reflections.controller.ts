import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReflectionsService } from './reflections.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('reflections')
export class ReflectionsController {
  constructor(private readonly reflectionsService: ReflectionsService) {}

  @Post()
  create(@Request() req, @Body() createReflectionDto: any) {
    const date = createReflectionDto.date ? new Date(createReflectionDto.date) : new Date();
    return this.reflectionsService.create(
      req.user.userId, 
      date,
      createReflectionDto.content,
      createReflectionDto.insights
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.reflectionsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.reflectionsService.findOne(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.reflectionsService.remove(id, req.user.userId);
  }
}
