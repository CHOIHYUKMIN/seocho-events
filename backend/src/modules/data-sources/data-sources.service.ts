import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DataSourcesService {
    private readonly logger = new Logger(DataSourcesService.name);

    constructor(private prisma: PrismaService) { }

    async findAll() {
        const dataSources = await this.prisma.dataSource.findMany({
            where: { isActive: true },
            include: {
                district: true,
            },
            orderBy: { name: 'asc' },
        });

        return { data: dataSources };
    }

    async collectAll() {
        this.logger.log('수동 데이터 수집 트리거됨');

        const sources = await this.prisma.dataSource.findMany({
            where: {
                isActive: true,
                district: { isActive: true },
            },
            include: { district: true },
        });

        const results: Array<{ source: string; status: string; message: string }> = [];
        for (const source of sources) {
            this.logger.log(`수집 시작: ${source.name}`);
            results.push({
                source: source.name,
                status: 'scheduled',
                message: '크롤러 구현 예정',
            });
        }

        return {
            message: '수집 작업이 예약되었습니다',
            results
        };
    }
}
