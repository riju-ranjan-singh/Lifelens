import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async generateWeeklyReview(userId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 1. Fetch all tasks from the last 7 days
    const tasks = await this.prisma.task.findMany({
      where: { 
        userId,
        createdAt: { gte: oneWeekAgo }
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 2. Determine dominant category
    const categoryCounts: Record<string, number> = {};
    tasks.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    
    let topCategory = 'None';
    let maxCount = 0;
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topCategory = category;
      }
    }

    // 3. Generate Insight String
    let insight = "It looks like a quiet week.";
    if (completionRate > 80) {
      insight = "Incredible focus this week! You crushed most of your goals.";
    } else if (completionRate > 50) {
      insight = "Solid effort this week. Let's aim to push a little harder next week.";
    } else if (totalTasks > 0) {
      insight = "This week was tough, but that's okay. Let's recalibrate our schedule.";
    }

    return {
      period: "Last 7 Days",
      metrics: {
        totalTasks,
        completedTasks,
        completionRate: completionRate.toFixed(1) + "%",
        topFocusArea: topCategory,
      },
      insight,
    };
  }
}
