import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';
import { SchedulerService } from './scheduler.service';
import { TestCrawlerService } from './test-crawler.service';
import { TestCrawlerController } from './test-crawler.controller';
import { SiteAnalyzerService } from './site-analyzer.service';
import { AdminDataSourcesController } from './admin-data-sources.controller';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [
        TestCrawlerController,
        AdminDataSourcesController,
    ],
    providers: [
        CrawlerService,
        SchedulerService,
        TestCrawlerService,
        SiteAnalyzerService,
    ],
    exports: [
        CrawlerService,
        TestCrawlerService,
        SiteAnalyzerService,
    ],
})
export class CrawlerModule { }
