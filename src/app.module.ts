import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';

// Modules
import { ScrapperModule } from './scrapper/scrapper.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RatesModule } from './rates/rates.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      useFactory: () => ({
        stores: [createKeyv(process.env.REDIS_URL)],
        ttl: 60 * 60 * 1000,
      }),
      isGlobal: true,
    }),
    ScrapperModule,
    TasksModule,
    ScheduleModule.forRoot(),
    RatesModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
