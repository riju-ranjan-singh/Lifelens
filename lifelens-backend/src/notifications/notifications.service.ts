import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string, body: string, scheduledFor: Date) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        scheduledFor,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async markAsSent(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isSent: true },
    });
  }

  async generateMorningBriefing(userId: string) {
    // In a real app, we'd query the LLM to write a custom message based on today's schedule
    const title = "Good Morning!";
    const body = "Your daily schedule is ready. You have 3 tasks prioritized for today. Let's conquer the day!";
    
    // Schedule for right now (or could be 8 AM)
    return this.create(userId, title, body, new Date());
  }

  async generateNightReflection(userId: string) {
    const title = "Evening Reflection";
    const body = "Great job today! Take 5 minutes to write down your thoughts and reflect on what you accomplished.";
    
    return this.create(userId, title, body, new Date());
  }
}
