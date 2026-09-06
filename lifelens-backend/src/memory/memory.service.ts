import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MemoryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, category: string, content: string, importance: number = 1) {
    return this.prisma.memory.create({
      data: {
        userId,
        category,
        content,
        importance,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(userId: string, category: string) {
    return this.prisma.memory.findMany({
      where: { userId, category },
      orderBy: { importance: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const memory = await this.prisma.memory.findFirst({
      where: { id, userId },
    });
    if (!memory) {
      throw new NotFoundException('Memory not found');
    }
    return this.prisma.memory.delete({
      where: { id },
    });
  }
}
