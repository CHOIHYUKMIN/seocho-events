# 서초구 행사/이벤트 맞춤 제공 시스템 - 구현 시작 가이드

## 프로젝트 개요

서초구 내 다양한 공공기관, 협회, 단체에서 제공하는 행사 및 이벤트 정보를 자동 수집하여 사용자 맞춤형으로 제공하는 통합 플랫폼을 개발합니다.

**프로젝트 위치**: `d:\DEVELOP\seocho-events`

## 이미 완료된 설계 문서

다음 설계 문서들이 이미 작성되어 있습니다 (artifacts 폴더):

1. **system_architecture.md** - 전체 시스템 아키텍처
2. **technical_specification.md** - 기술 스택, DB 스키마, API 설계
3. **data_collection_strategy.md** - 데이터 수집 전략
4. **spa_crawling_guide.md** - SPA 크롤링 해결 방법
5. **initial_datasources.md** - 서초구 초기 데이터 소스 목록
6. **implementation_plan.md** - 구현 계획

## 기술 스택

### Backend
- NestJS 10.x
- PostgreSQL 16 (Docker)
- Redis 7 (Docker)
- Prisma ORM 5.x
- Puppeteer (크롤링)

### Frontend
- Next.js 14
- React 18
- Tailwind CSS 3
- Zustand (상태관리)

### DevOps
- Docker Compose
- pnpm (패키지 관리)

## Phase 1 MVP 구현 단계

### 1. 프로젝트 초기 설정

```bash
# seocho-events 폴더에서 실행

# 백엔드 프로젝트 생성
npx @nestjs/cli new backend
# 패키지 관리자: pnpm 선택

# 프론트엔드 프로젝트 생성
npx create-next-app@latest frontend
# TypeScript: Yes
# Tailwind CSS: Yes
# App Router: Yes
# src/ directory: No
```

### 2. Docker 환경 구성

루트에 `docker-compose.yml` 생성:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: seocho-events-db
    environment:
      POSTGRES_USER: eventuser
      POSTGRES_PASSWORD: eventpass
      POSTGRES_DB: seocho_events
      TZ: Asia/Seoul
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: seocho-events-cache
    command: redis-server --appendonly yes --requirepass redispass
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Prisma 설정

```bash
cd backend
pnpm add -D prisma
pnpm add @prisma/client
npx prisma init
```

`backend/.env` 파일:
```
DATABASE_URL="postgresql://eventuser:eventpass@localhost:5432/seocho_events"
JWT_SECRET="your-secret-key-change-this"
```

`backend/prisma/schema.prisma`에 데이터베이스 스키마 작성 (technical_specification.md 참고)

### 4. 주요 구현 항목

#### Backend (NestJS)
- [ ] Auth 모듈 (회원가입, 로그인, JWT)
- [ ] Events 모듈 (행사 CRUD)
- [ ] Categories 모듈
- [ ] Locations 모듈
- [ ] Crawler 모듈 (기본)
  - API 클라이언트 (서울 열린데이터)
  - 웹 스크래퍼 (2-3개 사이트)
  - 데이터 정규화
  - 중복 제거
- [ ] 스케줄러 (node-cron)

#### Frontend (Next.js)
- [ ] 홈페이지
- [ ] 행사 목록 페이지
- [ ] 행사 상세 페이지
- [ ] 로그인/회원가입
- [ ] 반응형 디자인

### 5. 필수 패키지 설치

#### Backend
```bash
cd backend

# 핵심 패키지
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add @nestjs/schedule @nestjs/axios axios
pnpm add bcrypt class-validator class-transformer
pnpm add puppeteer cheerio
pnpm add date-fns

# 개발 의존성
pnpm add -D @types/passport-jwt @types/bcrypt @types/node
```

#### Frontend
```bash
cd frontend

# 핵심 패키지
pnpm add axios zustand
pnpm add react-hook-form @hookform/resolvers zod
pnpm add date-fns
```

### 6. Docker 시작

```bash
# 루트 폴더에서
docker compose up -d

# 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f postgres
```

### 7. Prisma 마이그레이션

```bash
cd backend

# 마이그레이션 생성 및 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# DB 확인 (Prisma Studio)
npx prisma studio
```

### 8. 개발 서버 실행

```bash
# 백엔드 (터미널 1)
cd backend
pnpm run start:dev

# 프론트엔드 (터미널 2)
cd frontend
pnpm run dev
```

## 데이터 소스 설정 (중요!)

### 초기 데이터 소스 목록

**우선순위 높음 (먼저 구현)**:
1. 서울 열린데이터 광장 API
   - URL: https://data.seoul.go.kr
   - API 키 발급 필요
   
2. 서초구청
   - URL: https://www.seocho.go.kr
   - 공지사항/행사 페이지 조사 필요
   
3. 서초문화재단
   - URL: https://www.seochocf.or.kr
   - SPA 가능성 있음

### 수동 조사 프로세스

각 사이트별로:
1. 브라우저에서 사이트 접속
2. 행사/공지사항 페이지 찾기
3. F12 → Network 탭에서 API 확인
4. 페이지 소스 확인 (SSR vs SPA)
5. 셀렉터 확인
6. DB에 data_sources 레코드 추가

```sql
INSERT INTO data_sources (name, source_type, url, config, is_active)
VALUES (
  '서초구청 공지사항',
  'WEB_SCRAPING',
  'https://www.seocho.go.kr/notice',
  '{"method": "static", "selector": ".board-list tr"}'::jsonb,
  true
);
```

## 프로젝트 구조

```
seocho-events/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── events/
│   │   │   ├── categories/
│   │   │   ├── locations/
│   │   │   └── crawler/
│   │   ├── common/
│   │   └── config/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 다음 작업

### Agent에게 요청할 내용:

```
d:\DEVELOP\seocho-events 폴더에서 서초구 행사/이벤트 시스템 구현을 시작해줘.

이미 완료된 설계:
- 시스템 아키텍처
- 기술 스택 (NestJS, Next.js, PostgreSQL, Redis)
- DB 스키마 (Prisma)
- API 설계

Phase 1 MVP 구현 시작:
1. NestJS 백엔드 프로젝트 생성
2. Next.js 프론트엔드 프로젝트 생성
3. Docker Compose 설정 (PostgreSQL, Redis)
4. Prisma 스키마 작성 및 마이그레이션
5. 기본 Auth 모듈 구현
6. Events 모듈 구현

단계별로 진행해줘.
```

## 참고 문서 위치

설계 문서들은 이전 대화의 artifacts에 저장되어 있습니다:
- `C:\Users\hyukc\.gemini\antigravity\brain\ff889071-ceaf-4a64-bd44-7004d6245d4c\`

필요시 해당 문서들을 참고하세요.

---

**작성일**: 2025-12-17  
**상태**: 구현 준비 완료
