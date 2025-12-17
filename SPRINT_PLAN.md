# 서초구 행사/이벤트 시스템 - 스프린트 계획 (핵심 기능 중심)

## 🎯 핵심 목적
> **사용자가 본인 또는 자녀가 참여할 수 있는 서초구 행사를 쉽게 찾고, 원본 페이지에서 상세 정보를 확인할 수 있는 플랫폼**

## 프로젝트 타임라인

- **총 기간**: 6주 (4 스프린트)
- **스프린트 기간**: 1-2주
- **시작일**: 2025-12-17
- **예상 완료일**: 2026-01-27

---

## Sprint 0: 프로젝트 셋업 및 기반 구축 (1주차)
**목표**: 개발 환경 구성 및 기본 인프라 설정

### 작업 항목

#### 1. 프로젝트 초기화
- [ ] 프로젝트 루트 디렉토리 구조 생성
- [ ] Git 저장소 초기화 및 .gitignore 설정
- [ ] README.md 작성

#### 2. 백엔드 프로젝트 생성 (NestJS)
```bash
npx @nestjs/cli new backend
# 선택: pnpm
```
- [ ] NestJS 프로젝트 생성
- [ ] 기본 폴더 구조 생성 (`modules/`, `common/`, `config/`)
- [ ] ESLint, Prettier 설정
- [ ] 환경변수 설정 (.env.example 생성)

#### 3. 프론트엔드 프로젝트 생성 (Next.js)
```bash
npx create-next-app@latest frontend
# TypeScript: Yes
# Tailwind CSS: Yes
# App Router: Yes
# src/ directory: No
```
- [ ] Next.js 프로젝트 생성
- [ ] Tailwind CSS 기본 설정
- [ ] 폴더 구조 생성 (`components/`, `lib/`, `types/`)
- [ ] ESLint, Prettier 설정

#### 4. 데이터베이스 설정 (두 가지 방법 중 선택)

**방법 A: Docker 사용 (권장, but 선택사항)**
- [ ] `docker-compose.yml` 생성
  - PostgreSQL 16 컨테이너
  - Redis 7 컨테이너
- [ ] Docker 컨테이너 실행: `docker compose up -d`
- [ ] PostgreSQL/Redis 접속 확인

**방법 B: Docker 없이 (간단) ⭐**
- [ ] SQLite 사용 (설치 불필요, 파일 기반 DB)
- [ ] 인메모리 캐시 사용 (Redis 대신)
- [ ] `SETUP_WITHOUT_DOCKER.md` 참고

> **💡 추천**: Docker 설치가 안 되면 **방법 B**를 사용하세요!

#### 5. Prisma ORM 설정
- [ ] Prisma 패키지 설치
  ```bash
  cd backend
  pnpm add -D prisma
  pnpm add @prisma/client
  npx prisma init
  ```
- [ ] `schema.prisma` 파일 수정
  - SQLite: `provider = "sqlite"`
  - PostgreSQL: `provider = "postgresql"`
- [ ] `.env` 파일 설정
  - SQLite: `DATABASE_URL="file:./dev.db"`
  - PostgreSQL: `DATABASE_URL="postgresql://..."`
- [ ] Prisma Client 생성: `npx prisma generate`

### 완료 기준 (Definition of Done)
- ✅ 백엔드/프론트엔드 프로젝트가 생성되고 개발 서버가 정상 실행됨
- ✅ 데이터베이스가 준비됨 (Docker PostgreSQL 또는 SQLite)
- ✅ Prisma가 DB에 연결되고 `npx prisma studio` 실행 가능
- ✅ Git 저장소가 초기화되고 첫 커밋이 완료됨

### 소요 시간 예상: 1-2일

---

## Sprint 1: 데이터베이스 스키마 및 기본 모듈 구현 (2주차)
**목표**: DB 스키마 설계 및 핵심 엔티티 구현

### 작업 항목

#### 1. Prisma 스키마 작성
- [ ] Users 모델 정의
  ```prisma
  model User {
    id         Int      @id @default(autoincrement())
    email      String   @unique
    password   String
    name       String?
    role       Role     @default(USER)
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt
  }
  ```
- [ ] Events 모델 정의 (제목, 설명, 날짜, 장소 등)
- [ ] Categories 모델 정의
- [ ] Locations 모델 정의
- [ ] DataSources 모델 정의
- [ ] 관계(Relations) 설정

#### 2. Prisma 마이그레이션
```bash
npx prisma migrate dev --name init
npx prisma generate
```
- [ ] 초기 마이그레이션 생성
- [ ] DB에 테이블 생성 확인
- [ ] Prisma Studio로 데이터 확인

#### 3. PrismaService 구현
- [ ] `src/common/prisma/prisma.service.ts` 생성
- [ ] PrismaModule 생성 및 전역 설정
- [ ] 연결 테스트

#### 4. 기본 카테고리 및 위치 Seed 데이터
- [ ] `prisma/seed.ts` 생성
- [ ] 기본 카테고리 데이터 추가 (문화, 체육, 교육, 축제 등)
- [ ] 서초구 주요 장소 데이터 추가
- [ ] Seed 스크립트 실행

### 완료 기준
- ✅ Prisma 스키마가 완성되고 마이그레이션이 성공함
- ✅ 모든 테이블이 DB에 생성됨
- ✅ Seed 데이터가 정상적으로 삽입됨
- ✅ Prisma Studio에서 데이터 확인 가능

### 소요 시간 예상: 2-3일

---

## Sprint 2: 행사 관리 모듈 및 기본 UI (2-3주차)
**목표**: 행사 CRUD 기능 및 사용자 중심 화면 구현

### 작업 항목

#### 1. Events 모듈 구현 (Backend) ⭐⭐⭐
- [ ] `modules/events/` 폴더 생성
- [ ] EventsService 구현
  - **행사 목록 조회** (필터링, 페이지네이션)
    - 날짜 범위 필터
    - 카테고리 필터
    - 대상 연령 필터
    - 대상 그룹 필터
    - 무료/유료 필터
    - 장소 필터
    - 키워드 검색
  - 행사 상세 조회 + **원본 URL 포함** ⭐
  - 조회수 증가 로직
  - 비슷한 행사 추천 (같은 카테고리)
- [ ] EventsController 구현
  - GET /events (query params)
  - GET /events/:id
- [ ] DTO 작성
  - QueryEventDto (필터 파라미터)
  - EventResponseDto (originalUrl 필수 포함)

#### 2. Categories & Locations 모듈
- [ ] CategoriesController 구현
  - GET /categories (행사 수 포함)
- [ ] LocationsController 구현
  - GET /locations (서초구 주요 장소 목록)

#### 3. 프론트엔드 메인 화면
- [ ] 홈페이지 (`app/page.tsx`)
  - 헤더/네비게이션
  - **검색 바** (키워드 검색)
  - **빠른 필터 버튼**
    - "이번 주말 행사"
    - "어린이 행사"
    - "무료 행사"
    - "문화 행사"
  - 최신 행사 6개 미리보기
  - "전체 행사 보기" 버튼

#### 4. 행사 목록 페이지
- [ ] 행사 목록 페이지 (`app/events/page.tsx`)
  - 사이드바 필터
    - 카테고리 체크박스
    - 날짜 범위 선택
    - 대상 연령 슬라이더
    - 대상 그룹 선택
    - 무료/유료/전체 라디오
    - 장소 선택
  - 행사 카드 그리드
  - 정렬 옵션 (최신순, 날짜순, 인기순)
  - 페이지네이션

#### 5. 행사 상세 페이지
- [ ] 행사 상세 페이지 (`app/events/[id]/page.tsx`)
  - 행사 전체 정보 표시
  - **"원본 페이지에서 자세히 보기" 큰 버튼** ⭐⭐⭐
  - 공유하기 (카카오톡, URL 복사)
  - 비슷한 행사 추천 (3개)
  - 조회수 표시

#### 6. UI 컴포넌트 개발
- [ ] EventCard 컴포넌트
  - 썸네일, 제목, 날짜, 장소, 태그
  - 무료/유료 배지
  - 대상 연령 표시
- [ ] SearchBar 컴포넌트
- [ ] FilterSidebar 컴포넌트
- [ ] Pagination 컴포넌트
- [ ] QuickFilter 버튼 컴포넌트

### 완료 기준
- ✅ 행사 목록 API 완성 (필터링, 검색, 정렬)
- ✅ 행사 상세 API 완성 (원본 URL 포함)
- ✅ 메인/목록/상세 페이지 작동
- ✅ 필터 5개 이상 정상 작동
- ✅ **원본 링크 클릭 시 외부 페이지 이동**
- ✅ 모바일 반응형 디자인

### 소요 시간 예상: 6-8일

---

## Sprint 3: 데이터 수집 시스템 구현 (4-5주차) ⭐⭐⭐
**목표**: 웹 크롤링 및 API 수집, 일일 배치 시스템 구축

### 작업 항목

#### 1. DataSources 모듈 구현
- [ ] `modules/data-sources/` 폴더 생성
- [ ] DataSourcesService 구현
  - 데이터 소스 목록 조회
  - 데이터 소스 활성화/비활성화
- [ ] data_sources 테이블 Seed 데이터
  ```typescript
  // 초기 데이터 소스 5개
  - 서울 열린데이터 광장 (API)
  - 서초구청 (웹 스크래핑)
  - 서초문화재단 (웹 스크래핑)
  - 서초여성가족플라자 (웹 스크래핑)
  - 서초구립도서관 (웹 스크래핑)
  ```

#### 2. Crawler 모듈 기본 구조
- [ ] `modules/crawler/` 폴더 생성
- [ ] CrawlerService 구현
- [ ] CollectionLogsService 구현 (수집 이력 관리)

#### 3. 서울 열린데이터 API 수집기 ⭐
- [ ] API 키 발급
  - URL: https://data.seoul.go.kr
  - 회원가입 및 키 발급
- [ ] API 클라이언트 구현
  - Axios 기반 HTTP 요청
  - 서초구 필터링 로직
- [ ] 데이터 파싱 및 정규화
  ```typescript
  interface RawApiData {
    title: string;
    date: string;
    location: string;
    // ... API 스펙에 따라
  }
  
  // 정규화 → Event 모델로 변환
  ```
- [ ] Events 테이블에 저장
- [ ] **중복 체크 로직** (제목 + 날짜)

#### 4. 웹 스크래핑 구현 (Puppeteer) ⭐⭐
- [ ] Puppeteer 설치 및 설정
  ```bash
  pnpm add puppeteer
  ```
- [ ] 서초구청 크롤러
  - URL: https://www.seocho.go.kr
  - 행사/공지사항 페이지 분석
  - 셀렉터 정의
  - 페이지네이션 처리
  - 각 행사의 원본 URL 저장 ⭐
- [ ] 서초문화재단 크롤러
  - URL: https://www.seochocf.or.kr
  - SPA 여부 확인
  - 동적 컨텐츠 대기 로직
  - 데이터 추출
- [ ] 추가 사이트 크롤러 (선택)
  - 서초여성가족플라자
  - 서초구립도서관
- [ ] 에러 핸들링
  - 타임아웃 처리
  - 재시도 로직 (3회)
  - 로그 기록

#### 5. 데이터 정규화 및 중복 제거 ⭐
- [ ] 데이터 검증 로직
  ```typescript
  interface EventValidator {
    validateTitle(title: string): boolean;
    validateDate(date: string): Date | null;
    validateUrl(url: string): boolean;
  }
  ```
- [ ] 중복 제거 알고리즘
  ```typescript
  // 같은 제목 + 같은 시작일 = 중복
  async checkDuplicate(event: CreateEventDto) {
    return await this.prisma.event.findFirst({
      where: {
        title: event.title,
        startDate: event.startDate,
      },
    });
  }
  ```
- [ ] 데이터 병합 로직
  - 기존 행사 업데이트 (원본 URL 갱신)
  - 신규 행사 추가

#### 6. 일일 배치 스케줄러 ⭐⭐⭐
- [ ] `@nestjs/schedule` 설치
  ```bash
  pnpm add @nestjs/schedule
  ```
- [ ] Cron Job 설정
  ```typescript
  @Injectable()
  export class SchedulerService {
    @Cron('0 2 * * *') // 매일 새벽 2시
    async dailyEventCollection() {
      this.logger.log('일일 배치 시작');
      
      const sources = await this.dataSourcesService.findAllActive();
      
      for (const source of sources) {
        const startTime = new Date();
        
        try {
          // 1. 데이터 수집
          const rawEvents = await this.crawlerService.collect(source);
          
          // 2. 정규화
          const events = await this.normalizeEvents(rawEvents);
          
          // 3. 중복 제거 및 저장
          const result = await this.saveEvents(events);
          
          // 4. 로그 기록
          await this.logSuccess(source, result, startTime);
        } catch (error) {
          await this.logError(source, error, startTime);
        }
      }
      
      this.logger.log('일일 배치 완료');
    }
  }
  ```
- [ ] 수동 트리거 API
  ```typescript
  POST /api/admin/collect
  // 즉시 수집 실행 (테스트용)
  ```

#### 7. 수집 로그 및 모니터링
- [ ] collection_logs 테이블에 기록
  - 수집 시작/종료 시간
  - 수집 건수 (전체/신규/업데이트)
  - 에러 메시지
- [ ] 관리자 대시보드 (선택사항)
  - 수집 이력 조회
  - 성공률 통계

### 완료 기준
- ✅ 최소 3개 사이트에서 데이터 수집 가능
- ✅ 일일 배치 스케줄러가 정상 작동
- ✅ 중복 데이터가 필터링됨 (중복률 5% 이하)
- ✅ **원본 URL이 모든 행사에 포함됨** ⭐
- ✅ 에러 처리 및 로그 기록 완성
- ✅ 수집 성공률 90% 이상

### 소요 시간 예상: 8-10일

---

## Sprint 4: 최적화, 테스트 및 배포 준비 (6주차)
**목표**: 성능 최적화, 테스트, 문서화, 배포 준비

### 작업 항목

#### 1. Redis 캐싱 시스템
- [ ] Cache Module 설정
  ```typescript
  @Module({
    imports: [CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 600, // 10분
    })],
  })
  ```
- [ ] 행사 목록 캐싱
  - 필터 조합별 캐시 키 생성
  - Cache-Aside 패턴 적용
- [ ] 카테고리/장소 캐싱 (거의 변하지 않음)
- [ ] Cache Invalidation
  - 새로운 행사 수집 시 캐시 클리어

#### 2. 검색 기능 고도화
- [ ] PostgreSQL Full-text search
  ```sql
  CREATE INDEX idx_event_search 
  ON events USING GIN(to_tsvector('korean', title || ' ' || description));
  ```
- [ ] 검색어 하이라이팅
- [ ] 검색 결과 정확도 개선

#### 3. 성능 최적화
- [ ] 데이터베이스 인덱스 추가
  ```sql
  CREATE INDEX idx_events_start_date ON events(start_date);
  CREATE INDEX idx_events_category ON events(category);
  CREATE INDEX idx_events_is_free ON events(is_free);
  ```
- [ ] API 응답 시간 측정 (Interceptor)
- [ ] N+1 쿼리 문제 해결
- [ ] 이미지 최적화 (Next.js Image)

#### 4. 선택 기능 구현
- [ ] 공유하기 (카카오톡, URL 복사)
- [ ] 좋아요/관심 표시 (로컬 스토리지)
- [ ] 최근 본 행사 (쿠키)

#### 5. 테스트 작성
- [ ] 단위 테스트 (Jest)
  - EventsService 테스트
  - CrawlerService 테스트
  - 필터링 로직 테스트
- [ ] E2E 테스트
  - 행사 목록 조회 플로우
  - 필터링 플로우
  - 상세 페이지 플로우

#### 6. 에러 처리 및 로깅
- [ ] 전역 Exception Filter
  ```typescript
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      // 모든 에러 로깅 및 표준화된 응답
    }
  }
  ```
- [ ] Winston 로깅 시스템
- [ ] 프론트엔드 에러 페이지
  - 404 Not Found
  - 500 Internal Server Error
  - 네트워크 에러

#### 7. 문서화
- [ ] API 문서 (Swagger)
  ```typescript
  @ApiTags('events')
  @ApiOperation({ summary: '행사 목록 조회' })
  @ApiQuery({ name: 'category', required: false })
  ```
- [ ] README 업데이트
  - 프로젝트 소개
  - 설치 방법
  - 실행 방법
  - 환경 변수 설정
- [ ] 배포 가이드 작성

#### 8. 배포 준비
- [ ] 환경 변수 관리
  - `.env.example` 파일 생성
  - 프로덕션 환경 변수 설정
- [ ] Docker 프로덕션 이미지
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install --production
  COPY . .
  RUN npm run build
  CMD ["npm", "run", "start:prod"]
  ```
- [ ] 보안 설정
  - CORS 설정
  - Rate Limiting (DDoS 방어)
  - Helmet (보안 헤더)
  - SQL Injection 방지 (Prisma 자동)
- [ ] Health Check 엔드포인트
  ```typescript
  GET /health
  // { status: 'ok', database: 'connected', redis: 'connected' }
  ```

#### 9. 최종 QA
- [ ] 전체 기능 테스트
  - 행사 목록/상세 조회
  - 필터링 (5가지 이상)
  - 검색
  - 외부 링크 클릭
  - 공유하기
- [ ] 모바일 반응형 확인
  - iOS Safari
  - Android Chrome
- [ ] 브라우저 호환성
  - Chrome, Firefox, Safari, Edge
- [ ] 성능 테스트
  - Lighthouse 점수 (60점 이상)
  - 페이지 로드 시간 < 3초
- [ ] 보안 점검
  - OWASP Top 10 체크

### 완료 기준
- ✅ 모든 핵심 기능 정상 작동
- ✅ Redis 캐싱 적용 (응답 시간 개선)
- ✅ 테스트 커버리지 50% 이상
- ✅ API 문서 완성
- ✅ 배포 가능한 상태 (Docker)
- ✅ 모바일 반응형 완성

### 소요 시간 예상: 5-7일

---

## 선택 기능 (Phase 2 - MVP 이후)

### 회원 기능
**목표**: 개인화 기능 및 성능 최적화

### 작업 항목

#### 1. 사용자 선호도 시스템
- [ ] UserPreferences 모델 추가
  - 선호 카테고리
  - 선호 지역
  - 알림 설정
- [ ] 선호도 설정 페이지
- [ ] 맞춤 행사 추천 알고리즘

#### 2. 북마크/관심 행사 기능
- [ ] UserEventBookmarks 모델 추가
- [ ] 북마크 API 구현
  - POST /events/:id/bookmark
  - DELETE /events/:id/bookmark
  - GET /my/bookmarks
- [ ] 마이페이지 구현

#### 3. 캐싱 시스템 (Redis)
- [ ] Cache Module 설정
- [ ] 행사 목록 캐싱
- [ ] Cache Invalidation 전략
- [ ] TTL 설정

#### 4. 검색 기능 고도화
- [ ] 전문 검색(Full-text search) 구현
- [ ] 자동완성 기능
- [ ] 검색어 하이라이팅

#### 5. 성능 최적화
- [ ] 데이터베이스 인덱스 추가
- [ ] API 응답 시간 측정 및 개선
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅

### 완료 기준
- ✅ 사용자 맞춤 추천이 작동함
- ✅ 북마크 기능이 정상 작동함
- ✅ Redis 캐싱이 적용됨
- ✅ 검색 성능이 개선됨

### 소요 시간 예상: 4-5일

---

## Sprint 6: 테스트, 배포 준비 및 마무리 (7주차)
**목표**: 테스트 작성, 문서화, 배포 준비

### 작업 항목

#### 1. 단위 테스트 작성
- [ ] AuthService 테스트
- [ ] EventsService 테스트
- [ ] CrawlerService 테스트
- [ ] 테스트 커버리지 60% 이상

#### 2. E2E 테스트
- [ ] 회원가입/로그인 플로우
- [ ] 행사 조회 플로우
- [ ] 북마크 플로우

#### 3. 에러 처리 및 로깅
- [ ] 전역 Exception Filter
- [ ] 로깅 시스템 구축 (Winston)
- [ ] 에러 페이지 (404, 500)

#### 4. 문서화
- [ ] API 문서 (Swagger)
- [ ] README 업데이트
- [ ] 환경 변수 문서화
- [ ] 배포 가이드 작성

#### 5. 배포 준비
- [ ] 프로덕션 환경변수 설정
- [ ] Docker 프로덕션 이미지 빌드
- [ ] 보안 체크리스트
  - CORS 설정
  - Rate Limiting
  - Helmet 적용
- [ ] 성능 모니터링 설정 (선택사항)

#### 6. 최종 QA
- [ ] 전체 기능 테스트
- [ ] 모바일 반응형 확인
- [ ] 브라우저 호환성 테스트
- [ ] 보안 취약점 점검

### 완료 기준
- ✅ 모든 핵심 기능이 정상 작동함
- ✅ 테스트 커버리지 목표 달성
- ✅ API 문서가 완성됨
- ✅ 배포 가능한 상태

### 소요 시간 예상: 5-7일

---

## 기술 스택 요약

### Backend
- **Framework**: NestJS 10.x
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5.x
- **Cache**: Redis 7
- **Authentication**: JWT (passport-jwt)
- **Crawling**: Puppeteer, Cheerio, Axios
- **Scheduling**: @nestjs/schedule
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS 3
- **State Management**: Zustand
- **Forms**: react-hook-form, Zod
- **HTTP Client**: Axios
- **Date Handling**: date-fns

### DevOps
- **Containerization**: Docker, Docker Compose
- **Package Manager**: pnpm
- **Version Control**: Git

---

## 리스크 관리

### 잠재적 리스크
1. **크롤링 차단**: 웹사이트에서 크롤링을 차단할 수 있음
   - **대응**: User-Agent 설정, Rate Limiting, API 우선 사용

2. **데이터 품질**: 수집된 데이터의 일관성 부족
   - **대응**: 엄격한 Validation, 데이터 정규화 로직

3. **성능 이슈**: 대량 데이터 처리 시 성능 저하
   - **대응**: 인덱싱, 캐싱, 페이지네이션

4. **API 변경**: 외부 API 스펙 변경
   - **대응**: 버전 관리, 에러 핸들링, 모니터링

---

## MVP 성공 지표 (KPI)

### 1. 핵심 기능 완성도 ⭐
- [ ] **3개 이상 데이터 소스 연동** (서울 열린데이터, 서초구청, 서초문화재단)
- [ ] **일일 배치 자동 수집** (매일 새벽 2시)
- [ ] **5가지 이상 필터 기능** (날짜, 카테고리, 연령, 무료/유료, 장소)
- [ ] **키워드 검색 기능**
- [ ] **원본 페이지 링크** (모든 행사에 포함)
- [ ] **모바일 반응형 디자인**

### 2. 데이터 품질 ⭐⭐
- [ ] 월 **100건 이상** 행사 수집
- [ ] 중복률 **5% 이하**
- [ ] 원본 링크 유효성 **95% 이상**
- [ ] 크롤링 성공률 **90% 이상**

### 3. 사용자 경험 ⭐⭐⭐
- [ ] 페이지 로드 시간 **3초 이내**
- [ ] API 응답 시간 **500ms 이내**
- [ ] **3번 클릭 이내** 원하는 행사 찾기 가능
- [ ] 행사 정보 **한눈에 파악** 가능 (카드 UI)

### 4. 기술 품질
- [ ] 테스트 커버리지 **50% 이상**
- [ ] Critical 버그 **0개**
- [ ] 주요 브라우저 호환성 (Chrome, Safari, Firefox)

---

## 다음 단계

### 즉시 시작 가능한 작업:
1. **Sprint 0 시작**: 프로젝트 셋업
2. **Docker 실행**: `docker compose up -d`
3. **백엔드 생성**: `npx @nestjs/cli new backend`
4. **프론트엔드 생성**: `npx create-next-app@latest frontend`

### 준비물 체크리스트:
- [ ] Node.js 18+ 설치 확인
- [ ] pnpm 설치 확인
- [ ] Docker Desktop 설치 및 실행
- [ ] Git 설정 확인
- [ ] 서울 열린데이터 광장 API 키 발급 (나중에)

---

**작성일**: 2025-12-17  
**버전**: 1.0  
**최종 검토일**: 2025-12-17
