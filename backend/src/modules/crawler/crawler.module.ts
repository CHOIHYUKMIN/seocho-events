import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';
import { SchedulerService } from './scheduler.service';
import { TestCrawlerService } from './test-crawler.service';
import { TestCrawlerController } from './test-crawler.controller';
import { RealCrawlerService } from './real-crawler.service';
import { RealCrawlerController } from './real-crawler.controller';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [TestCrawlerController, RealCrawlerController],
    providers: [CrawlerService, SchedulerService, TestCrawlerService, RealCrawlerService],
    exports: [CrawlerService, TestCrawlerService, RealCrawlerService],
})
export class CrawlerModule { }
