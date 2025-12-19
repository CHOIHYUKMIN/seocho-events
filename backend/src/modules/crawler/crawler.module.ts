import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';
import { SchedulerService } from './scheduler.service';
import { TestCrawlerService } from './test-crawler.service';
import { TestCrawlerController } from './test-crawler.controller';
import { RealCrawlerService } from './real-crawler.service';
import { RealCrawlerController } from './real-crawler.controller';
import { SiteAnalyzerService } from './site-analyzer.service';
import { AdminDataSourcesController } from './admin-data-sources.controller';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [
        TestCrawlerController,
        RealCrawlerController,
        AdminDataSourcesController,
    ],
    providers: [
        CrawlerService,
        SchedulerService,
        TestCrawlerService,
        RealCrawlerService,
        SiteAnalyzerService,
    ],
    exports: [
        CrawlerService,
        TestCrawlerService,
        RealCrawlerService,
        SiteAnalyzerService,
    ],
})
export class CrawlerModule { }
