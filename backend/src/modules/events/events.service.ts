import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: QueryEventDto) {
        const {
            page = 1,
            limit = 20,
            district,
            category,
            dateFrom,
            dateTo,
            targetAgeMin,
            targetAgeMax,
            isFree,
            keyword,
            sortBy = 'date',
        } = query;

        const where: any = {
            isActive: true,
        };

        // 지역 필터
        if (district) {
            where.district = { code: district };
        }

        // 카테고리 필터
        if (category) {
            where.category = category;
        }

        // 날짜 필터
        if (dateFrom || dateTo) {
            where.startDate = {};
            if (dateFrom) where.startDate.gte = new Date(dateFrom);
            if (dateTo) where.startDate.lte = new Date(dateTo);
        }

        // 대상 연령 필터
        if (targetAgeMin !== undefined || targetAgeMax !== undefined) {
            if (targetAgeMin !== undefined) {
                where.targetAgeMax = { gte: targetAgeMin };
            }
            if (targetAgeMax !== undefined) {
                where.targetAgeMin = { lte: targetAgeMax };
            }
        }

        // 무료/유료 필터
        if (isFree !== undefined && isFree !== null) {
            where.isFree = typeof isFree === 'string' ? isFree === 'true' : isFree;
        }

        // 키워드 검색
        if (keyword) {
            where.OR = [
                { title: { contains: keyword } },
                { description: { contains: keyword } },
                { location: { contains: keyword } },
            ];
        }

        // 정렬
        let orderBy: any = {};
        switch (sortBy) {
            case 'latest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'popular':
                orderBy = { viewCount: 'desc' };
                break;
            case 'date':
            default:
                orderBy = { startDate: 'asc' };
        }

        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                include: {
                    district: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy,
            }),
            this.prisma.event.count({ where }),
        ]);

        return {
            data: events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { id, isActive: true },
            include: {
                district: true,
                dataSource: true,
            },
        });

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        // 비슷한 행사 추천 (같은 카테고리)
        const related = await this.prisma.event.findMany({
            where: {
                category: event.category,
                id: { not: id },
                isActive: true,
                startDate: { gte: new Date() },
            },
            take: 3,
            orderBy: { startDate: 'asc' },
        });

        return {
            data: event,
            related,
        };
    }

    async incrementViewCount(id: number) {
        await this.prisma.event.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });

        return { success: true };
    }
}
