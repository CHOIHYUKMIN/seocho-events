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
      url: 'https://data.seoul.go.kr/api',
      districtId: seocho.id,
      config: JSON.stringify({
        apiKey: 'YOUR_API_KEY',
        endpoint: '/dataList/OA-15488/S/1/1000',
        districtFilter: '서초구',
      }),
    },
    {
      name: '서초구청 공지사항',
      sourceType: 'WEB_SCRAPING',
      url: 'https://www.seocho.go.kr/site/seocho/07/10701020000002015041501.jsp',
      districtId: seocho.id,
      config: JSON.stringify({
        method: 'static',
        selector: '.board-list tr',
        titleSelector: '.title',
        dateSelector: '.date',
      }),
    },
    {
      name: '서초문화재단',
      sourceType: 'WEB_SCRAPING',
      url: 'https://www.seochocf.or.kr',
      districtId: seocho.id,
      config: JSON.stringify({
        method: 'dynamic',
        waitForSelector: '.event-list',
      }),
    },
    {
      name: '서초여성가족플라자',
      sourceType: 'WEB_SCRAPING',
      url: 'https://women.seocho.go.kr',
      districtId: seocho.id,
      config: JSON.stringify({
        method: 'static',
      }),
    },
    {
      name: '서초구립도서관',
      sourceType: 'WEB_SCRAPING',
      url: 'https://seocholib.or.kr',
      districtId: seocho.id,
      config: JSON.stringify({
        method: 'static',
      }),
    },
  ];

  for (const ds of dataSources) {
    await prisma.dataSource.create({
      data: ds,
    });
  }

  console.log('✅ Data sources created');

  // ============================================
  // 4. 샘플 행사 데이터 (테스트용)
  // ============================================
  await prisma.event.create({
    data: {
      title: '서초 가족 문화축제',
      description: '서초구민이 함께하는 겨울 문화축제입니다. 다양한 공연과 체험 프로그램이 준비되어 있습니다.',
      startDate: new Date('2025-12-25T10:00:00'),
      endDate: new Date('2025-12-25T18:00:00'),
      location: '서초구청 앞 광장',
      address: '서울시 서초구 서초대로 2584',
      districtId: seocho.id,
      targetAgeMin: 0,
      targetAgeMax: 999,
      targetGroup: JSON.stringify(['가족', '어린이']),
      isFree: true,
      originalUrl: 'https://www.seocho.go.kr/event/festival2025',
      category: '축제',
      organizer: '서초구청 문화체육과',
      contact: '02-2155-6743',
    },
  });

  await prisma.event.create({
    data: {
      title: '어린이 독서 교실',
      description: '초등학생을 위한 겨울방학 독서 프로그램입니다.',
      startDate: new Date('2026-01-10T14:00:00'),
      endDate: new Date('2026-01-10T16:00:00'),
      registrationStartDate: new Date('2025-12-20T00:00:00'),
      registrationEndDate: new Date('2026-01-05T23:59:00'),
      location: '서초구립반포도서관',
      address: '서울시 서초구 신반포로 201',
      districtId: seocho.id,
      targetAgeMin: 7,
      targetAgeMax: 13,
      targetGroup: JSON.stringify(['어린이']),
      capacity: 30,
      isFree: true,
      originalUrl: 'https://seocholib.or.kr/program/123',
      registrationUrl: 'https://seocholib.or.kr/apply/123',
      category: '교육',
      organizer: '서초구립반포도서관',
      contact: '02-535-4142',
    },
  });

  console.log('✅ Sample events created');
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
