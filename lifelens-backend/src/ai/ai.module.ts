import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { TasksModule } from '../tasks/tasks.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [TasksModule, MemoryModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
