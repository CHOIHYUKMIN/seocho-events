import { Controller, Get, Post, HttpCode } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';

@Controller('data-sources')
export class DataSourcesController {
    constructor(private readonly dataSourcesService: DataSourcesService) { }

    @Get()
    async findAll() {
        return this.dataSourcesService.findAll();
    }

    @Post('collect')
    @HttpCode(200)
    async triggerCollection() {
        // 수동으로 데이터 수집 트리거 (테스트용)
        return this.dataSourcesService.collectAll();
    }
}
