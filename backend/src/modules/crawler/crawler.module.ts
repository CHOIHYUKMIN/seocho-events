import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';
import { SchedulerService } from './scheduler.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [CrawlerService, SchedulerService],
    exports: [CrawlerService],
})
export class CrawlerModule { }
