import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DataSource } from '@prisma/client';

interface CollectionResult {
    collected: number;
    added: number;
    updated: number;
}

interface RawEvent {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    address?: string;
    targetAgeMin?: number;
    targetAgeMax?: number;
    targetGroup?: string[];
    isFree?: boolean;
    fee?: string;
    originalUrl: string;
    registrationUrl?: string;
    imageUrl?: string;
    category: string;
    organizer?: string;
    contact?: string;
    districtId: number;
}

@Injectable()
export class CrawlerService {
    private readonly logger = new Logger(CrawlerService.name);

    constructor(private prisma: PrismaService) { }

    async collectFromSource(source: DataSource & { district: any }): Promise<CollectionResult> {
        this.logger.log(`수집 시작: ${source.name} (${source.sourceType})`);

        let rawEvents: RawEvent[] = [];

        if (source.sourceType === 'API') {
            rawEvents = await this.collectFromApi(source);
        } else if (source.sourceType === 'WEB_SCRAPING') {
            rawEvents = await this.collectFromWeb(source);
        }

        // 중복 제거 및 저장
        const result = await this.saveEvents(rawEvents, source.id);

        // 마지막 수집 시간 업데이트
        await this.prisma.dataSource.update({
            where: { id: source.id },
            data: { lastCollectedAt: new Date() },
        });

        return result;
    }

    private async collectFromApi(source: DataSource): Promise<RawEvent[]> {
        this.logger.log(`API 수집: ${source.url}`);

        // TODO: 실제 API 연동 구현
        // 현재는 빈 배열 반환
        return [];
    }

    private async collectFromWeb(source: DataSource & { district: any }): Promise<RawEvent[]> {
        this.logger.log(`웹 스크래핑: ${source.url}`);

        // TODO: Puppeteer를 사용한 실제 스크래핑 구현
        // 현재는 샘플 데이터 반환 (데모용)

        // 샘플 데이터 생성 (실제로는 웹에서 수집)
        const sampleEvents: RawEvent[] = [
            {
                title: `[자동 수집] ${source.district.name} 신규 행사`,
                description: `${source.name}에서 자동으로 수집된 행사입니다.`,
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
                location: source.district.name,
                targetAgeMin: 0,
                targetAgeMax: 999,
                isFree: true,
                originalUrl: source.url,
                category: '문화',
                organizer: source.name,
                districtId: source.districtId,
            },
        ];

        return sampleEvents;
    }

    private async saveEvents(rawEvents: RawEvent[], dataSourceId: number): Promise<CollectionResult> {
        let added = 0;
        let updated = 0;

        for (const rawEvent of rawEvents) {
            // 중복 체크: 같은 제목 + 같은 시작일
            const existing = await this.prisma.event.findFirst({
                where: {
                    title: rawEvent.title,
                    startDate: rawEvent.startDate,
                },
            });

            if (existing) {
                // 기존 행사 업데이트
                await this.prisma.event.update({
                    where: { id: existing.id },
                    data: {
                        description: rawEvent.description || existing.description,
                        originalUrl: rawEvent.originalUrl, // 원본 URL 갱신
                        lastSyncedAt: new Date(),
                    },
                });
                updated++;
            } else {
                // 신규 행사 추가
                await this.prisma.event.create({
                    data: {
                        ...rawEvent,
                        targetGroup: rawEvent.targetGroup ? JSON.stringify(rawEvent.targetGroup) : null,
                        dataSourceId,
                    },
                });
                added++;
            }
        }

        return {
            collected: rawEvents.length,
            added,
            updated,
        };
    }

    // 중복 체크 헬퍼 함수
    async checkDuplicate(title: string, startDate: Date): Promise<boolean> {
        const existing = await this.prisma.event.findFirst({
            where: {
                title,
                startDate,
            },
        });
        return !!existing;
    }
}
