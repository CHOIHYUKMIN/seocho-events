import { Controller, Get, Query } from '@nestjs/common';
import { TestCrawlerService } from './test-crawler.service';

@Controller('test-crawler')
export class TestCrawlerController {
    constructor(private readonly testCrawlerService: TestCrawlerService) { }

    @Get('seocho-notice')
    async testSeochoNotice() {
        const results = await this.testCrawlerService.testSeochoNotice();
        return {
            success: true,
            count: results.length,
            data: results,
        };
    }

    @Get('simple')
    async testSimple(@Query('url') url: string) {
        if (!url) {
            return { success: false, message: 'URL parameter required' };
        }

        const result = await this.testCrawlerService.testSimpleCrawl(url);
        return {
            success: true,
            data: result,
        };
    }

    @Get('seoul-api')
    async testSeoulAPI() {
        const results = await this.testCrawlerService.testSeoulOpenDataAPI();
        return {
            success: true,
            count: results.length,
            data: results,
        };
    }
}
