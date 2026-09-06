import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReflectionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, date: Date, content: string, insights?: string) {
    return this.prisma.reflection.create({
      data: {
        userId,
        date,
        content,
        insights,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.reflection.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const reflection = await this.prisma.reflection.findFirst({
      where: { id, userId },
    });
    if (!reflection) {
      throw new NotFoundException('Reflection not found');
    }
    return reflection;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.reflection.delete({
      where: { id },
    });
  }
}
