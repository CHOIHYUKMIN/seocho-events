import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // 1. 지역 데이터
  // ============================================
  const seocho = await prisma.district.upsert({
    where: { code: 'seocho' },
    update: {},
    create: {
      name: '서초구',
      nameEn: 'Seocho-gu',
      code: 'seocho',
      isActive: true,
    },
  });

  await prisma.district.upsert({
    where: { code: 'gangnam' },
    update: {},
    create: {
      name: '강남구',
      nameEn: 'Gangnam-gu',
      code: 'gangnam',
      isActive: false,
    },
  });

  await prisma.district.upsert({
    where: { code: 'songpa' },
    update: {},
    create: {
      name: '송파구',
      nameEn: 'Songpa-gu',
      code: 'songpa',
      isActive: false,
    },
  });

  console.log('✅ Districts created');

  // ============================================
  // 2. 카테고리 데이터
  // ============================================
  const categories = [
    { name: '문화', nameEn: 'Culture', icon: '🎭', order: 1 },
    { name: '체육', nameEn: 'Sports', icon: '⚽', order: 2 },
    { name: '교육', nameEn: 'Education', icon: '📚', order: 3 },
    { name: '축제', nameEn: 'Festival', icon: '🎉', order: 4 },
    { name: '행정', nameEn: 'Administration', icon: '🏛️', order: 5 },
    { name: '복지', nameEn: 'Welfare', icon: '🤝', order: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categories created');

  // ============================================
  // 3. 데이터 소스 (서초구만)
  // ============================================
  const dataSources = [
    {
      name: '서울 열린데이터 광장 (서초구)',
      sourceType: 'API',
      url: 'http://openapi.seoul.go.kr:8088/545a4e4865687975313231706c5a7146/json/culturalEventInfo/1/100',
      districtId: seocho.id,
      isActive: true,
      config: JSON.stringify({
        apiKey: '545a4e4865687975313231706c5a7146',
        districtFilter: '서초구',
        timeout: 20000,
      }),
    },
    {
      name: '서초구청 행사안내',
      sourceType: 'WEB_SCRAPING',
      url: 'https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59',
      districtId: seocho.id,
      isActive: true,
      config: JSON.stringify({
        method: 'static',
        listSelector: 'table.list tbody tr',  // 수정: #content가 아닌 table.list 사용
        titleSelector: 'td:nth-child(2) a',
        dateSelector: 'td:nth-child(4)',
        linkSelector: 'td:nth-child(2) a',
        crawlDetailPage: true,
        detailSelectors: {
          content: '.view_contents',  // 수정: 실제 본문 영역 선택자
        },
        // 첫 페이지만 크롤링 (최신 정보)
        paginationEnabled: false,
        timeout: 15000,
      }),
    },
  ];

  for (const ds of dataSources) {
    await prisma.dataSource.create({
      data: ds,
    });
  }

  console.log('✅ Data sources created');
  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
