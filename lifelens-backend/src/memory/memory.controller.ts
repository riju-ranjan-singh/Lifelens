import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  create(@Request() req, @Body() createMemoryDto: any) {
    return this.memoryService.create(
      req.user.userId, 
      createMemoryDto.category, 
      createMemoryDto.content,
      createMemoryDto.importance
    );
  }

  @Get()
  findAll(@Request() req, @Query('category') category?: string) {
    if (category) {
      return this.memoryService.findByCategory(req.user.userId, category);
    }
    return this.memoryService.findAllForUser(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.memoryService.remove(id, req.user.userId);
  }
}
