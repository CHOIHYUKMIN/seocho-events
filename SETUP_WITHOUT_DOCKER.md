# Docker 없이 개발 환경 구성하기

## 개요

Docker 없이 **SQLite**와 **인메모리 캐시**를 사용하여 개발을 시작합니다. 배포 시에는 클라우드 데이터베이스를 사용할 수 있습니다.

---

## 1. 데이터베이스: SQLite 사용 ✅

### 장점
- **설치 불필요**: 파일 기반 데이터베이스
- **개발에 최적**: 빠르고 가벼움
- **Prisma 완벽 지원**: 마이그레이션, 스키마 모두 동일
- **나중에 PostgreSQL로 쉽게 전환 가능**

### 설정 방법

#### `backend/.env` 파일
```env
# SQLite 사용 (파일 기반)
DATABASE_URL="file:./dev.db"

# JWT 비밀키
JWT_SECRET="your-secret-key-change-this"
```

#### `backend/prisma/schema.prisma` 파일
```prisma
datasource db {
  provider = "sqlite"  // ⭐ PostgreSQL 대신 SQLite
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 모델 정의는 동일 (일부 타입만 조정)
model Event {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  
  // DateTime은 SQLite에서도 지원
  startDate   DateTime
  endDate     DateTime?
  
  // JSON은 String으로 저장 (Prisma가 자동 변환)
  targetGroup String?   // JSON.stringify(['어린이', '가족'])
  
  originalUrl String    // ⭐ 원본 페이지 링크
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([startDate])
  @@index([category])
}
```

#### 마이그레이션 실행
```bash
cd backend

# 마이그레이션 생성 및 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# DB 확인 (Prisma Studio)
npx prisma studio
```

---

## 2. 캐싱: 인메모리 캐시 사용 ✅

Redis 대신 NestJS 기본 제공 인메모리 캐시를 사용합니다.

### 설정 방법

#### 패키지 설치
```bash
cd backend
pnpm add @nestjs/cache-manager cache-manager
```

#### `app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // 인메모리 캐시 (Redis 없이)
    CacheModule.register({
      isGlobal: true,
      ttl: 600, // 10분 (초 단위)
      max: 100, // 최대 100개 캐시
    }),
    
    // 다른 모듈들...
  ],
})
export class AppModule {}
```

#### 사용 예시
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class EventsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(filters: any) {
    const cacheKey = `events:${JSON.stringify(filters)}`;
    
    // 캐시 확인
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // DB 조회
    const events = await this.prisma.event.findMany({ ...filters });
    
    // 캐시 저장
    await this.cacheManager.set(cacheKey, events);
    
    return events;
  }
}
```

---

## 3. 배포 옵션 (나중에)

개발이 완료되면 다음 중 선택:

### Option 1: Vercel + Supabase (추천) ⭐
- **프론트엔드**: Vercel (무료)
- **백엔드 API**: Vercel Serverless Functions
- **데이터베이스**: Supabase PostgreSQL (무료 500MB)
- **비용**: 무료

### Option 2: Railway
- **올인원**: 백엔드 + PostgreSQL + Redis
- **비용**: 월 $5부터
- **자동 배포**: GitHub 연동

### Option 3: Render
- **올인원**: 백엔드 + PostgreSQL
- **비용**: 무료 (제한적)

---

## 4. 개발 워크플로우

### 로컬 개발 (Docker 없이)

```bash
# 1. 백엔드 실행
cd backend
pnpm install
npx prisma migrate dev
npx prisma generate
pnpm run start:dev
# → http://localhost:3000

# 2. 프론트엔드 실행 (다른 터미널)
cd frontend
pnpm install
pnpm run dev
# → http://localhost:3001
```

### 데이터베이스 확인

```bash
# Prisma Studio 실행
cd backend
npx prisma studio
# → http://localhost:5555
```

---

## 5. PostgreSQL로 전환하기 (선택사항)

나중에 필요하면 간단히 전환 가능:

### 5-1. 로컬 PostgreSQL 설치
- Windows: https://www.postgresql.org/download/windows/
- 설치 후 포트 5432에서 실행

### 5-2. `.env` 변경
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/seocho_events"
```

### 5-3. `schema.prisma` 변경
```prisma
datasource db {
  provider = "postgresql"  // sqlite → postgresql
  url      = env("DATABASE_URL")
}
```

### 5-4. 마이그레이션 재실행
```bash
npx prisma migrate dev --name switch_to_postgres
```

---

## 6. 비교표

| 항목 | Docker 방식 | Docker 없는 방식 |
|------|------------|-----------------|
| **DB** | PostgreSQL (컨테이너) | SQLite (파일) |
| **캐시** | Redis (컨테이너) | 인메모리 |
| **설치** | Docker Desktop 필요 | 설치 불필요 ✅ |
| **시작 속도** | ~10초 | 즉시 ✅ |
| **메모리** | ~1GB | ~100MB ✅ |
| **프로덕션 전환** | 그대로 사용 | DB 전환 필요 |

---

## 7. 추천 개발 순서

### Phase 1: SQLite로 시작 (지금)
1. ✅ SQLite + 인메모리 캐시로 개발
2. ✅ 모든 기능 구현 및 테스트
3. ✅ 로컬에서 완벽하게 작동 확인

### Phase 2: 배포 준비 (나중에)
1. Supabase 무료 계정 생성
2. PostgreSQL URL 받기
3. `.env` 변경 및 마이그레이션
4. Vercel에 배포

---

## 결론

**Docker 없이도 100% 개발 가능합니다!** 🎉

- 개발 단계: SQLite (더 빠르고 간단)
- 배포 단계: Supabase PostgreSQL (무료)

---

**작성일**: 2025-12-17  
**추천**: Docker 설치 불가 시 이 방법 사용
