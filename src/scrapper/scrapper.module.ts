import { Module } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [],
  providers: [ScrapperService],
  imports: [ConfigModule],
  exports: [ScrapperService],
})
export class ScrapperModule {}
