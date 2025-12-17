# 데이터베이스 스키마 설계 (다지역 확장 가능)

## 개요

**현재**: 서초구만 구현  
**미래**: 강남구, 송파구 등 다른 지역 추가 가능한 구조

---

## Prisma 스키마

### 완전한 `schema.prisma` 파일

```prisma
// backend/prisma/schema.prisma

// SQLite (개발용)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// PostgreSQL (배포용)
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }

generator client {
  provider = "prisma-client-js"
}

// ============================================
// 지역 (Districts) - 확장 가능
// ============================================
model District {
  id          Int      @id @default(autoincrement())
  name        String   @unique  // "서초구", "강남구", "송파구"
  nameEn      String?  // "Seocho-gu" (선택사항)
  code        String   @unique  // "seocho", "gangnam", "songpa"
  isActive    Boolean  @default(true)
  
  // 관계
  events      Event[]
  dataSources DataSource[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ============================================
// 행사 (Events)
// ============================================
model Event {
  id          Int      @id @default(autoincrement())
  
  // 기본 정보
  title       String
  description String?
  
  // 일정
  startDate   DateTime
  endDate     DateTime?
  registrationStartDate DateTime?
  registrationEndDate   DateTime?
  
  // 장소
  location    String?   // "서초문화예술회관"
  address     String?   // "서울시 서초구 ..."
  
  // 🌍 지역 (다지역 지원)
  districtId  Int
  district    District @relation(fields: [districtId], references: [id])
  
  // 대상
  targetAgeMin   Int    @default(0)
  targetAgeMax   Int    @default(999)
  targetGroup    String?  // JSON string: ["어린이", "가족"]
  capacity       Int?
  
  // 비용
  isFree      Boolean  @default(true)
  fee         String?
  
  // 링크 ⭐⭐⭐
  originalUrl String   // 원본 페이지 (필수)
  registrationUrl String?  // 신청 링크 (선택)
  imageUrl    String?
  
  // 분류
  category    String   // "문화", "체육", "교육", "축제"
  organizer   String?  // "서초구청", "서초문화재단"
  contact     String?
  
  // 메타데이터
  dataSourceId Int?
  dataSource   DataSource? @relation(fields: [dataSourceId], references: [id])
  viewCount    Int      @default(0)
  isActive     Boolean  @default(true)
  
  // 타임스탬프
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  lastSyncedAt DateTime @default(now())
  
  // 인덱스
  @@index([districtId])
  @@index([startDate])
  @@index([category])
  @@index([isFree])
  @@index([targetAgeMin, targetAgeMax])
}

// ============================================
// 데이터 소스 (Data Sources)
// ============================================
model DataSource {
  id          Int      @id @default(autoincrement())
  
  name        String   // "서초구청 공지사항"
  sourceType  String   // "API", "WEB_SCRAPING"
  url         String
  
  // 🌍 지역
  districtId  Int
  district    District @relation(fields: [districtId], references: [id])
  
  // 설정 (JSON)
  config      String?  // JSON string: { "method": "static", "selector": ".board-list" }
  
  isActive    Boolean  @default(true)
  lastCollectedAt DateTime?
  
  // 관계
  events      Event[]
  logs        CollectionLog[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([districtId])
}

// ============================================
// 수집 로그 (Collection Logs)
// ============================================
model CollectionLog {
  id              Int      @id @default(autoincrement())
  
  dataSourceId    Int
  dataSource      DataSource @relation(fields: [dataSourceId], references: [id])
  
  status          String   // "SUCCESS", "FAILED", "PARTIAL"
  eventsCollected Int      @default(0)
  eventsAdded     Int      @default(0)
  eventsUpdated   Int      @default(0)
  errorMessage    String?
  
  startedAt       DateTime
  completedAt     DateTime?
  
  createdAt       DateTime @default(now())
}

// ============================================
// 카테고리 (Categories) - 선택사항
// ============================================
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  nameEn    String?
  icon      String?
  order     Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============================================
// 사용자 (Users) - Phase 2
// ============================================
// model User {
//   id        Int      @id @default(autoincrement())
//   email     String   @unique
//   password  String
//   name      String?
//   role      String   @default("USER")
//   
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }
```

---

## 초기 Seed 데이터

### `backend/prisma/seed.ts`

```typescript
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

  // 🔮 미래 확장용 (현재는 비활성)
  await prisma.district.upsert({
    where: { code: 'gangnam' },
    update: {},
    create: {
      name: '강남구',
      nameEn: 'Gangnam-gu',
      code: 'gangnam',
      isActive: false, // 아직 미구현
    },
  });

  await prisma.district.upsert({
    where: { code: 'songpa' },
    update: {},
    create: {
      name: '송파구',
      nameEn: 'Songpa-gu',
      code: 'songpa',
      isActive: false, // 아직 미구현
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
        method: 'dynamic', // SPA
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
      description: '서초구민이 함께하는 가을 문화축제입니다.',
      startDate: new Date('2025-12-25T10:00:00'),
      endDate: new Date('2025-12-25T18:00:00'),
      location: '서초구청 앞 광장',
      address: '서울시 서초구 서초대로 2584',
      districtId: seocho.id,
      targetAgeMin: 0,
      targetAgeMax: 999,
      targetGroup: JSON.stringify(['가족', '어린이']),
      isFree: true,
      originalUrl: 'https://www.seocho.go.kr/event/123',
      category: '축제',
      organizer: '서초구청',
      contact: '02-2155-6743',
    },
  });

  console.log('✅ Sample event created');
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
```

### `backend/package.json`에 seed 스크립트 추가

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  },
  "devDependencies": {
    "ts-node": "^10.9.1"
  }
}
```

---

## API 변경사항

### 1. 지역 필터 추가

#### GET /api/events (행사 목록)

```typescript
// Query Parameters에 district 추가
interface QueryEventDto {
  page?: number;
  limit?: number;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  isFree?: boolean;
  keyword?: string;
  
  // 🌍 지역 필터 추가
  district?: string;  // "seocho", "gangnam", "songpa"
}

// 사용 예시
GET /api/events?district=seocho&category=문화&isFree=true
```

#### GET /api/districts (지역 목록)

```typescript
// 현재 활성화된 지역 목록
GET /api/districts

// Response
{
  "data": [
    {
      "id": 1,
      "name": "서초구",
      "code": "seocho",
      "eventCount": 145
    }
    // 나중에 강남구, 송파구 등 추가
  ]
}
```

### 2. EventsService 수정

```typescript
// backend/src/modules/events/events.service.ts

@Injectable()
export class EventsService {
  async findAll(query: QueryEventDto) {
    const { district, category, isFree, keyword, page = 1, limit = 20 } = query;
    
    const where: any = {
      isActive: true,
    };
    
    // 🌍 지역 필터
    if (district) {
      where.district = {
        code: district,
      };
    }
    
    // MVP: 서초구만 표시 (다른 지역이 없는 동안)
    // where.district = { code: 'seocho' };
    
    // 다른 필터들...
    if (category) where.category = category;
    if (isFree !== undefined) where.isFree = isFree;
    
    const events = await this.prisma.event.findMany({
      where,
      include: {
        district: true, // 지역 정보 포함
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'asc' },
    });
    
    return events;
  }
}
```

---

## UI 변경사항

### 1. 지역 선택 필터 (나중에 활성화)

```typescript
// frontend/components/DistrictFilter.tsx

export function DistrictFilter() {
  const [districts, setDistricts] = useState([]);
  const [selected, setSelected] = useState('seocho');
  
  useEffect(() => {
    // 활성화된 지역 목록 가져오기
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setDistricts(data.data));
  }, []);
  
  // MVP: 지역이 1개뿐이면 선택 UI 표시 안 함
  if (districts.length <= 1) {
    return null; // 또는 "서초구" 고정 표시
  }
  
  return (
    <select value={selected} onChange={e => setSelected(e.target.value)}>
      {districts.map(d => (
        <option key={d.code} value={d.code}>
          {d.name} ({d.eventCount}개)
        </option>
      ))}
    </select>
  );
}
```

---

## 배치 수집 시 지역 처리

```typescript
// backend/src/modules/crawler/scheduler.service.ts

@Injectable()
export class SchedulerService {
  @Cron('0 2 * * *') // 매일 새벽 2시
  async dailyEventCollection() {
    this.logger.log('일일 배치 시작');
    
    // 현재 활성화된 지역의 데이터 소스만 수집
    const sources = await this.prisma.dataSource.findMany({
      where: {
        isActive: true,
        district: {
          isActive: true, // 🌍 활성화된 지역만
        },
      },
      include: {
        district: true,
      },
    });
    
    for (const source of sources) {
      this.logger.log(`수집 중: ${source.district.name} - ${source.name}`);
      
      // 수집 로직...
      const events = await this.collect(source);
      
      // 각 행사에 districtId 자동 설정
      for (const event of events) {
        event.districtId = source.districtId;
      }
      
      await this.saveEvents(events);
    }
    
    this.logger.log('일일 배치 완료');
  }
}
```

---

## 확장 시나리오 (Phase 2)

### 강남구 추가하기

1. **지역 활성화**
   ```sql
   UPDATE districts SET is_active = true WHERE code = 'gangnam';
   ```

2. **데이터 소스 추가**
   ```typescript
   await prisma.dataSource.create({
     data: {
       name: '강남구청 공지사항',
       sourceType: 'WEB_SCRAPING',
       url: 'https://www.gangnam.go.kr',
       districtId: gangnamId,
       config: JSON.stringify({ ... }),
     },
   });
   ```

3. **크롤러 구현**
   - 강남구청 사이트 분석
   - 셀렉터 정의
   - 테스트

4. **배치 실행**
   - 자동으로 강남구 데이터 수집 시작

5. **UI 업데이트**
   - 지역 필터가 자동으로 표시됨

---

## 마이그레이션 실행

```bash
cd backend

# Prisma 스키마 적용
npx prisma migrate dev --name add_multi_district_support

# Seed 데이터 생성
npx prisma db seed

# 확인
npx prisma studio
```

---

## 요약

### ✅ 변경사항
1. **District 모델 추가** (지역 관리)
2. **Event에 districtId 추가**
3. **DataSource에 districtId 추가**
4. **API에 district 필터 추가**
5. **Seed에 지역 데이터 추가**

### 🎯 MVP (서초구만)
- District 테이블에 서초구만 `isActive: true`
- 다른 지역은 `isActive: false`로 준비
- UI에서 지역 필터 숨김 (1개뿐이므로)

### 🔮 확장 (나중에)
- 강남구, 송파구 등 `isActive: true`로 변경
- 각 지역의 데이터 소스 추가
- 크롤러 구현
- UI 지역 필터 자동 활성화

---

**작성일**: 2025-12-17  
**상태**: 확장 가능한 구조 설계 완료 ✅
