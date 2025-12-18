import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';
import { SchedulerService } from './scheduler.service';
import { TestCrawlerService } from './test-crawler.service';
import { TestCrawlerController } from './test-crawler.controller';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [TestCrawlerController],
    providers: [CrawlerService, SchedulerService, TestCrawlerService],
    exports: [CrawlerService, TestCrawlerService],
})
export class CrawlerModule { }
