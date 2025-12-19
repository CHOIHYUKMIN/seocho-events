import { Controller, Get } from '@nestjs/common';
import { RealCrawlerService } from './real-crawler.service';

@Controller('real-crawler')
export class RealCrawlerController {
    constructor(private readonly realCrawlerService: RealCrawlerService) { }

    @Get('seocho-tourism')
    async crawlSeochoTourism() {
        return await this.realCrawlerService.crawlSeochoTourism();
    }

    @Get('seocho-culture')
    async crawlSeochoCulture() {
        return await this.realCrawlerService.crawlSeochoCulture();
    }

    @Get('kto')
    async crawlKTO() {
        return await this.realCrawlerService.crawlKTO();
    }

    @Get('naver-local')
    async crawlNaverLocal() {
        return await this.realCrawlerService.crawlNaverLocal();
    }
}
