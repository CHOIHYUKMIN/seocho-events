const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
    console.log('=== 데이터베이스 확인 ===\n');

    // 1. 행사 개수
    const eventCount = await prisma.event.count();
    console.log(`✅ 행사 총 개수: ${eventCount}개\n`);

    // 2. 행사 목록
    const events = await prisma.event.findMany({
        take: 10,
        orderBy: { startDate: 'asc' },
    });

    console.log('📋 행사 목록:');
    events.forEach((event, index) => {
        console.log(`${index + 1}. [${event.category}] ${event.title}`);
        console.log(`   📅 ${new Date(event.startDate).toLocaleDateString()}`);
        console.log(`   📍 ${event.location || 'N/A'}`);
        console.log(`   🔗 ${event.originalUrl}`);
        console.log('');
    });

    // 3. 카테고리 개수
    const categoryCount = await prisma.category.count();
    console.log(`✅ 카테고리 총 개수: ${categoryCount}개\n`);

    // 4. 지역 개수
    const districtCount = await prisma.district.count();
    const activeDistricts = await prisma.district.count({ where: { isActive: true } });
    console.log(`✅ 지역: ${districtCount}개 (활성화: ${activeDistricts}개)\n`);

    // 5. 데이터 소스 개수
    const dataSourceCount = await prisma.dataSource.count();
    console.log(`✅ 데이터 소스: ${dataSourceCount}개\n`);

    await prisma.$disconnect();
}

checkDB().catch(console.error);
