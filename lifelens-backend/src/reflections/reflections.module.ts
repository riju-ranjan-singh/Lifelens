import { Module } from '@nestjs/common';
import { ReflectionsService } from './reflections.service';
import { ReflectionsController } from './reflections.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReflectionsController],
  providers: [ReflectionsService],
  exports: [ReflectionsService],
})
export class ReflectionsModule {}
