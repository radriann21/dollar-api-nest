import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ConfigModule } from '@nestjs/config';
import { ScrapperModule } from 'src/scrapper/scrapper.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, PrismaService],
  imports: [ConfigModule, ScrapperModule],
})
export class TasksModule {}
