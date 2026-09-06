import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { AiModule } from './ai/ai.module.js';
import { MemoryModule } from './memory/memory.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ReflectionsModule } from './reflections/reflections.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, TasksModule, SchedulesModule, AiModule, MemoryModule, NotificationsModule, ReflectionsModule, AnalyticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
