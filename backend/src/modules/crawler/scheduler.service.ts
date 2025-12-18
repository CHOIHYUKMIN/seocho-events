import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { CrawlerService } from './crawler.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private prisma: PrismaService,
        private crawlerService: CrawlerService,
    ) { }

    // 매일 새벽 2시에 실행
    @Cron('0 2 * * *')
    async handleDailyCollection() {
        this.logger.log('📅 일일 배치 시작');

        const sources = await this.prisma.dataSource.findMany({
            where: {
                isActive: true,
                district: { isActive: true },
            },
            include: { district: true },
        });

        for (const source of sources) {
            const startTime = new Date();

            try {
                this.logger.log(`🔄 수집 중: ${source.name} (${source.district.name})`);

                const result = await this.crawlerService.collectFromSource(source);

                // 수집 로그 기록
                await this.prisma.collectionLog.create({
                    data: {
                        dataSourceId: source.id,
                        status: 'SUCCESS',
                        eventsCollected: result.collected,
                        eventsAdded: result.added,
                        eventsUpdated: result.updated,
                        startedAt: startTime,
                        completedAt: new Date(),
                    },
                });

                this.logger.log(
                    `✅ ${source.name}: ${result.collected}건 수집, ${result.added}건 추가, ${result.updated}건 업데이트`,
                );
            } catch (error) {
                this.logger.error(`❌ ${source.name} 수집 실패:`, error.message);

                // 실패 로그 기록
                await this.prisma.collectionLog.create({
                    data: {
                        dataSourceId: source.id,
                        status: 'FAILED',
                        eventsCollected: 0,
                        eventsAdded: 0,
                        eventsUpdated: 0,
                        errorMessage: error.message,
                        startedAt: startTime,
                        completedAt: new Date(),
                    },
                });
            }
        }

        this.logger.log('✨ 일일 배치 완료');
    }

    // 테스트용: 5분마다 실행 (개발 중에만 사용)
    // @Cron('*/5 * * * *')
    async handleTestCollection() {
        this.logger.log('🧪 테스트 수집 실행');
        // await this.handleDailyCollection();
    }
}
