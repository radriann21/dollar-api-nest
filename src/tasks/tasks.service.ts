import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScrapperService } from '../scrapper/scrapper.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly scrapperService: ScrapperService,
  ) {}
  onApplicationBootstrap() {
    this.logger.log('TasksService initialized');
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async getBCVPrice() {
    this.logger.log('Getting price');
    const price = await this.scrapperService.scrapeWebsite(
      this.configService.get<string>('WEBSITE_URL')!,
    );
    this.logger.log(`Price: ${price}`);
  }
}
