import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DistrictsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const districts = await this.prisma.district.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: { events: { where: { isActive: true } } },
                },
            },
            orderBy: { name: 'asc' },
        });

        return {
            data: districts.map((d) => ({
                id: d.id,
                name: d.name,
                nameEn: d.nameEn,
                code: d.code,
                eventCount: d._count.events,
            })),
        };
    }
}
