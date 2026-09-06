import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService
  ) {}

  async create(userId: string, data: any) {
    // data.date should be a valid ISO string
    return this.prisma.schedule.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.schedule.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }
  
  async findByDate(userId: string, date: string) {
    // Naive match for date, in production we'd want date-range logic
    const scheduleDate = new Date(date);
    return this.prisma.schedule.findFirst({
      where: { 
        userId,
        date: scheduleDate
      },
    });
  }

  async findOne(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async update(id: string, userId: string, data: any) {
    await this.findOne(id, userId);
    return this.prisma.schedule.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.schedule.delete({
      where: { id },
    });
  }

  // --- SMART SCHEDULING ENGINE ---
  async generateSmartSchedule(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    
    // 1. Fetch pending tasks for the user
    const pendingTasks = await this.prisma.task.findMany({
      where: { userId, status: 'Pending' },
    });

    if (pendingTasks.length === 0) {
      return { message: 'No pending tasks to schedule.' };
    }

    // 2. Sorting Heuristic: Deadlines first, then Priority (High > Medium > Low)
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    pendingTasks.sort((a, b) => {
      // Prioritize by deadline if existing
      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      
      // Fallback to priority
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    // 3. Simple Allocation (Assume 8 hours of available working time max)
    const maxWorkMinutes = 8 * 60; 
    let allocatedMinutes = 0;
    const scheduledTaskIds = [];

    for (const task of pendingTasks) {
      const duration = task.duration || 60; // default to 60 mins if unestimated
      if (allocatedMinutes + duration <= maxWorkMinutes) {
        scheduledTaskIds.push(task.id);
        allocatedMinutes += duration;
        
        // Add a 15 min break after every task
        allocatedMinutes += 15;
      }
    }

    // 4. Save the generated schedule
    return this.create(userId, {
      date,
      taskIds: scheduledTaskIds,
    });
  }
}
