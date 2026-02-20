import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ConfigModule } from '@nestjs/config';
import { ScrapperModule } from 'src/scrapper/scrapper.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [ConfigModule, ScrapperModule],
})
export class TasksModule {}
