import { Controller, Post, Get, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SiteAnalyzerService } from './site-analyzer.service';
import { PrismaService } from '../../common/prisma.service';

@Controller('admin/data-sources')
export class AdminDataSourcesController {
    constructor(
        private readonly siteAnalyzer: SiteAnalyzerService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * 데이터 소스 목록 조회
     * GET /admin/data-sources
     */
    @Get()
    async getAllDataSources(@Query('districtId') districtId?: string) {
        const where = districtId ? { districtId: parseInt(districtId) } : {};

        const sources = await this.prisma.dataSource.findMany({
            where,
            include: {
                district: true,
                _count: {
                    select: {
                        events: true,
                        logs: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            success: true,
            count: sources.length,
            data: sources,
        };
    }

    /**
     * 데이터 소스 상세 조회
     * GET /admin/data-sources/:id
     */
    @Get(':id')
    async getDataSource(@Param('id', ParseIntPipe) id: number) {
        const source = await this.prisma.dataSource.findUnique({
            where: { id },
            include: {
                district: true,
                events: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                logs: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!source) {
            return { success: false, message: 'Data source not found' };
        }

        return {
            success: true,
            data: source,
        };
    }

    /**
     * 데이터 소스 등록
     * POST /admin/data-sources
     */
    @Post()
    async createDataSource(@Body() body: {
        name: string;
        sourceType: 'API' | 'WEB_SCRAPING';
        url: string;
        districtId: number;
        config?: any;
        isActive?: boolean;
    }) {
        const source = await this.prisma.dataSource.create({
            data: {
                name: body.name,
                sourceType: body.sourceType,
                url: body.url,
                districtId: body.districtId,
                config: body.config ? JSON.stringify(body.config) : null,
                isActive: body.isActive ?? true,
            },
            include: {
                district: true,
            },
        });

        return {
            success: true,
            message: 'Data source created successfully',
            data: source,
        };
    }

    /**
     * 데이터 소스 수정
     * PUT /admin/data-sources/:id
     */
    @Put(':id')
    async updateDataSource(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: {
            name?: string;
            sourceType?: 'API' | 'WEB_SCRAPING';
            url?: string;
            districtId?: number;
            config?: any;
            isActive?: boolean;
        },
    ) {
        const source = await this.prisma.dataSource.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.sourceType && { sourceType: body.sourceType }),
                ...(body.url && { url: body.url }),
                ...(body.districtId && { districtId: body.districtId }),
                ...(body.config && { config: JSON.stringify(body.config) }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
            },
            include: {
                district: true,
            },
        });

        return {
            success: true,
            message: 'Data source updated successfully',
            data: source,
        };
    }

    /**
     * 데이터 소스 삭제
     * DELETE /admin/data-sources/:id
     */
    @Delete(':id')
    async deleteDataSource(@Param('id', ParseIntPipe) id: number) {
        await this.prisma.dataSource.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Data source deleted successfully',
        };
    }

    /**
     * 사이트 분석 (기존 기능)
     * POST /admin/data-sources/analyze
     */
    @Post('analyze')
    async analyzeSite(@Body() body: { url: string }) {
        const analysis = await this.siteAnalyzer.analyzeSite(body.url);
        return {
            success: true,
            data: analysis
        };
    }

    /**
     * 데이터 소스 활성화/비활성화 토글
     * POST /admin/data-sources/:id/toggle
     */
    @Post(':id/toggle')
    async toggleActive(@Param('id', ParseIntPipe) id: number) {
        const source = await this.prisma.dataSource.findUnique({
            where: { id },
        });

        if (!source) {
            return { success: false, message: 'Data source not found' };
        }

        const updated = await this.prisma.dataSource.update({
            where: { id },
            data: { isActive: !source.isActive },
        });

        return {
            success: true,
            message: `Data source ${updated.isActive ? 'activated' : 'deactivated'}`,
            data: updated,
        };
    }

    /**
     * 데이터 소스 크롤링 테스트
     * POST /admin/data-sources/:id/test
     */
    @Post(':id/test')
    async testDataSource(@Param('id', ParseIntPipe) id: number) {
        const source = await this.prisma.dataSource.findUnique({
            where: { id },
            include: { district: true },
        });

        if (!source) {
            return { success: false, message: 'Data source not found' };
        }

        // Note: This would require injecting CrawlerService
        // For now, return a placeholder response
        return {
            success: true,
            message: 'Test endpoint available. Implement crawler injection for full functionality.',
            source: source.name,
        };
    }
}
