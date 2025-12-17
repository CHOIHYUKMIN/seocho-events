import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const categories = await this.prisma.category.findMany({
            orderBy: { order: 'asc' },
        });

        return { data: categories };
    }
}
