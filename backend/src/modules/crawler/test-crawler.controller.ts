import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { TestCrawlerService } from './test-crawler.service';
import { CrawlerService } from './crawler.service';
import { PrismaService } from '../../common/prisma.service';

@Controller('test-crawler')
export class TestCrawlerController {
    constructor(
        private readonly testCrawlerService: TestCrawlerService,
        private readonly crawlerService: CrawlerService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * 특정 데이터 소스 크롤링 테스트
     * GET /test-crawler/source/:id
     */
    @Get('source/:id')
    async testDataSource(@Param('id', ParseIntPipe) id: number) {
        const source = await this.prisma.dataSource.findUnique({
            where: { id },
            include: { district: true },
        });

        if (!source) {
            return { success: false, message: 'Data source not found' };
        }

        const result = await this.crawlerService.collectFromSource(source);
        return {
            success: true,
            dataSource: {
                id: source.id,
                name: source.name,
                type: source.sourceType,
                url: source.url,
            },
            result,
        };
    }

    /**
     * 모든 활성 데이터 소스 크롤링 테스트
     * GET /test-crawler/all
     */
    @Get('all')
    async testAllSources() {
        const sources = await this.prisma.dataSource.findMany({
            where: { isActive: true },
            include: { district: true },
        });

        const results: Array<{
            source: { id: number; name: string; type: string };
            result?: any;
            error?: string;
            success: boolean;
        }> = [];

        for (const source of sources) {
            try {
                const result = await this.crawlerService.collectFromSource(source);
                results.push({
                    source: {
                        id: source.id,
                        name: source.name,
                        type: source.sourceType,
                    },
                    result,
                    success: true,
                });
            } catch (error: any) {
                results.push({
                    source: {
                        id: source.id,
                        name: source.name,
                        type: source.sourceType,
                    },
                    error: error.message,
                    success: false,
                });
            }
        }

        return {
            success: true,
            totalSources: sources.length,
            results,
        };
    }

    /**
     * 서초구청 공지사항 테스트 (레거시)
     */
    @Get('seocho-notice')
    async testSeochoNotice() {
        const results = await this.testCrawlerService.testSeochoNotice();
        return {
            success: true,
            count: results.length,
            data: results,
        };
    }

    /**
     * 간단한 URL 크롤링 테스트 (레거시)
     */
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

    /**
     * 서울 열린데이터 API 테스트 (레거시)
     */
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
