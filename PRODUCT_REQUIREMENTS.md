# 서초구 행사/이벤트 시스템 - 제품 요구사항 정의

## 핵심 목적 (Core Purpose)

> **"서초구 주민들이 본인 또는 자녀가 참여할 수 있는 행사/이벤트를 쉽게 찾고 확인할 수 있는 플랫폼"**

### 주요 목표
1. **발견(Discovery)**: 흩어진 행사 정보를 한 곳에서 확인
2. **필터링(Filtering)**: 내 상황에 맞는 행사만 빠르게 찾기
3. **접근성(Accessibility)**: 원본 페이지로 바로 이동하여 상세 정보 확인
4. **최신성(Freshness)**: 매일 자동 업데이트로 최신 정보 유지

---

## 핵심 사용자 스토리

### 1. 부모 사용자
```
김서초씨 (35세, 7세 자녀 1명)
- "주말에 아이와 함께 갈 수 있는 서초구 행사가 있을까?"
- "무료 체험 프로그램이나 문화행사를 찾고 싶어"
- "연령대에 맞는 행사만 보고 싶어"
```

**핵심 니즈**:
- 연령대 필터링 (유아, 초등학생, 청소년)
- 무료/유료 구분
- 날짜별 정렬
- 빠른 신청 링크 접근

### 2. 일반 시민 사용자
```
이서초씨 (28세, 직장인)
- "퇴근 후 참여할 수 있는 문화 행사가 있을까?"
- "주말에 혼자 또는 친구들과 갈 만한 이벤트를 찾고 싶어"
- "관심 분야(운동, 문화, 교육) 행사만 보고 싶어"
```

**핵심 니즈**:
- 카테고리 필터링 (문화, 체육, 교육, 축제)
- 시간대 필터 (평일 저녁, 주말)
- 장소 정보
- 원클릭 상세 페이지 이동

---

## 핵심 기능 정의 (Must Have)

### 1. 행사 목록 화면 (메인 기능)
**우선순위**: ⭐⭐⭐⭐⭐ (최우선)

#### 기능 요구사항
- [ ] 모든 행사를 카드 형식으로 나열
- [ ] 각 카드에 표시될 정보:
  - 행사명
  - 개최 날짜/시간
  - 장소
  - 대상 연령/참가 대상
  - 카테고리 태그
  - 무료/유료 표시
  - 썸네일 이미지 (있을 경우)
- [ ] **원본 페이지 링크** (상세 정보 확인용)

#### 필터 옵션
```typescript
interface EventFilters {
  // 🌍 지역 필터 (다지역 확장 대비)
  district?: string; // 'seocho', 'gangnam', 'songpa'
  // MVP에서는 서초구만, UI에서 숨김 처리
  
  // 날짜 필터
  dateRange: {
    from: Date;
    to: Date;
  };
  
  // 카테고리
  categories: string[]; // ['문화', '체육', '교육', '축제', '행정']
  
  // 대상 연령
  targetAge: {
    min: number; // 0 = 제한없음
    max: number; // 999 = 제한없음
  };
  
  // 대상 그룹
  targetGroup: string[]; // ['어린이', '청소년', '성인', '노인', '가족']
  
  // 비용
  isFree: boolean | null; // true: 무료만, false: 유료만, null: 전체
  
  // 장소
  locations: string[]; // ['서초구청', '서초문화재단', '양재천', ...]
  
  // 검색어
  keyword: string;
}
```

#### 정렬 옵션
- 최신 등록순
- 가까운 날짜순
- 인기순 (조회수 기반)

---

### 2. 행사 상세 화면
**우선순위**: ⭐⭐⭐⭐ (필수)

#### 기능 요구사항
- [ ] 행사 전체 정보 표시
- [ ] **원본 페이지 링크 (큰 버튼으로 강조)**
- [ ] 달력에 추가 기능 (선택사항)
- [ ] 공유하기 (카카오톡, URL 복사)
- [ ] 비슷한 행사 추천 (같은 카테고리, 같은 대상)

#### 표시 정보
```typescript
interface EventDetail {
  // 기본 정보
  id: number;
  title: string;
  description: string;
  
  // 🌍 지역
  district: {
    id: number;
    name: string; // "서초구"
    code: string; // "seocho"
  };
  
  // 일정
  startDate: Date;
  endDate: Date;
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  
  // 장소
  location: string;
  address?: string;
  
  // 대상
  targetAge: { min: number; max: number };
  targetGroup: string[];
  capacity?: number; // 정원
  
  // 비용
  isFree: boolean;
  fee?: string;
  
  // 링크
  originalUrl: string; // ⭐ 핵심: 원본 페이지
  registrationUrl?: string; // 신청 링크
  
  // 메타데이터
  category: string;
  organizer: string; // 주최기관
  contact?: string;
  imageUrl?: string;
  
  // 자동 수집 정보
  dataSource: string; // 어디서 수집했는지
  lastUpdated: Date;
}
```

---

### 3. 일일 배치 수집 시스템
**우선순위**: ⭐⭐⭐⭐⭐ (최우선)

#### 수집 대상 사이트
1. **서울 열린데이터 광장 API**
   - URL: `https://data.seoul.go.kr`
   - 타입: REST API
   - 수집 정보: 서초구 관련 행사 필터링

2. **서초구청 공식 홈페이지**
   - URL: `https://www.seocho.go.kr`
   - 경로: 구정소식 → 행사/축제
   - 타입: 웹 스크래핑

3. **서초문화재단**
   - URL: `https://www.seochocf.or.kr`
   - 타입: 웹 스크래핑 (SPA 가능성)

4. **서초여성가족플라자**
   - URL: `https://women.seocho.go.kr`
   - 타입: 웹 스크래핑

5. **서초구립도서관**
   - URL: `https://seocholib.or.kr`
   - 타입: 웹 스크래핑

#### 배치 스케줄
```typescript
// 매일 새벽 2시에 실행
@Cron('0 2 * * *')
async dailyEventCollection() {
  this.logger.log('일일 배치 시작');
  
  // 1. 모든 데이터 소스 수집
  const sources = await this.getActiveDataSources();
  
  for (const source of sources) {
    try {
      // 2. 수집 실행
      const events = await this.collectFromSource(source);
      
      // 3. 데이터 정규화
      const normalized = await this.normalizeEvents(events);
      
      // 4. 중복 제거
      const newEvents = await this.deduplicateEvents(normalized);
      
      // 5. DB 저장
      await this.saveEvents(newEvents);
      
      this.logger.log(`${source.name}: ${newEvents.length}건 수집 완료`);
    } catch (error) {
      this.logger.error(`${source.name} 수집 실패`, error);
    }
  }
  
  this.logger.log('일일 배치 완료');
}
```

#### 중복 제거 로직
```typescript
// 같은 제목 + 같은 시작일 = 중복으로 간주
async deduplicateEvents(events: Event[]) {
  const uniqueEvents = [];
  
  for (const event of events) {
    const exists = await this.prisma.event.findFirst({
      where: {
        title: event.title,
        startDate: event.startDate,
      },
    });
    
    if (!exists) {
      uniqueEvents.push(event);
    } else {
      // 기존 정보 업데이트 (원본 URL이 더 구체적일 수 있음)
      await this.prisma.event.update({
        where: { id: exists.id },
        data: {
          originalUrl: event.originalUrl, // 최신 링크로 업데이트
          lastUpdated: new Date(),
        },
      });
    }
  }
  
  return uniqueEvents;
}
```

---

### 4. 간단한 메인 화면
**우선순위**: ⭐⭐⭐ (중요)

#### 기능 요구사항
- [ ] 검색 바 (키워드 검색)
- [ ] 빠른 필터 버튼
  - "이번 주말 행사"
  - "어린이 행사"
  - "무료 행사"
  - "문화 행사"
- [ ] 최신 행사 미리보기 (상위 6개)
- [ ] "전체 행사 보기" 버튼

---

## 선택 기능 (Nice to Have)

### 회원 기능 (Phase 2)
- 북마크 기능
- 관심 행사 저장
- 알림 설정 (관심 카테고리 신규 행사 등록 시)
- 참여 이력 관리

### 관리자 기능 (Phase 2)
- 수동 행사 등록
- 수집 상태 대시보드
- 오류 행사 수정/삭제

---

## 데이터베이스 스키마 (간소화)

### 핵심 테이블

#### 1. events (행사)
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  
  -- 기본 정보
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- 일정
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  registration_start_date TIMESTAMP,
  registration_end_date TIMESTAMP,
  
  -- 장소
  location VARCHAR(255),
  address TEXT,
  
  -- 대상
  target_age_min INTEGER DEFAULT 0,
  target_age_max INTEGER DEFAULT 999,
  target_group TEXT[], -- PostgreSQL array
  capacity INTEGER,
  
  -- 비용
  is_free BOOLEAN DEFAULT true,
  fee VARCHAR(100),
  
  -- 링크 ⭐⭐⭐
  original_url TEXT NOT NULL, -- 원본 페이지 (필수)
  registration_url TEXT, -- 신청 링크 (선택)
  
  -- 분류
  category VARCHAR(100),
  organizer VARCHAR(255),
  contact VARCHAR(255),
  image_url TEXT,
  
  -- 메타데이터
  data_source_id INTEGER REFERENCES data_sources(id),
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP DEFAULT NOW(),
  
  -- 인덱스
  INDEX idx_start_date (start_date),
  INDEX idx_category (category),
  INDEX idx_is_free (is_free),
  INDEX idx_target_age (target_age_min, target_age_max)
);
```

#### 2. data_sources (데이터 소스)
```sql
CREATE TABLE data_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'API', 'WEB_SCRAPING'
  url TEXT NOT NULL,
  config JSONB, -- 스크래핑 설정 (셀렉터 등)
  is_active BOOLEAN DEFAULT true,
  last_collected_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. collection_logs (수집 로그)
```sql
CREATE TABLE collection_logs (
  id SERIAL PRIMARY KEY,
  data_source_id INTEGER REFERENCES data_sources(id),
  status VARCHAR(50), -- 'SUCCESS', 'FAILED', 'PARTIAL'
  events_collected INTEGER DEFAULT 0,
  events_added INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API 엔드포인트 설계

### Public API (인증 불필요)

#### 1. 행사 목록 조회
```
GET /api/events

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- category: string[]
- dateFrom: ISO date
- dateTo: ISO date
- targetAgeMin: number
- targetAgeMax: number
- targetGroup: string[]
- isFree: boolean
- keyword: string
- sortBy: 'latest' | 'date' | 'popular'

Response:
{
  "data": Event[],
  "meta": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

#### 2. 행사 상세 조회
```
GET /api/events/:id

Response:
{
  "data": Event,
  "related": Event[] // 비슷한 행사 3개
}
```

#### 3. 카테고리 목록
```
GET /api/categories

Response:
{
  "data": [
    { "name": "문화", "count": 45 },
    { "name": "체육", "count": 23 },
    ...
  ]
}
```

#### 4. 장소 목록
```
GET /api/locations

Response:
{
  "data": string[]
}
```

### Admin API (인증 필요)

#### 5. 수동 배치 실행
```
POST /api/admin/collect
Authorization: Bearer {token}

Response:
{
  "message": "수집 시작됨",
  "jobId": "uuid"
}
```

#### 6. 수집 로그 조회
```
GET /api/admin/logs
Authorization: Bearer {token}

Response:
{
  "data": CollectionLog[]
}
```

---

## UI/UX 요구사항

### 1. 메인 화면 (PC)
```
+--------------------------------------------------+
|  [Logo] 서초구 행사/이벤트              [검색창]    |
+--------------------------------------------------+
|  빠른 필터:                                       |
|  [이번 주말] [어린이] [무료] [문화] [전체 필터▼]   |
+--------------------------------------------------+
|                                                  |
|  다가오는 행사                           [더보기>] |
|  +-------+  +-------+  +-------+  +-------+     |
|  | 행사1 |  | 행사2 |  | 행사3 |  | 행사4 |     |
|  |이미지 |  |이미지 |  |이미지 |  |이미지 |     |
|  |제목   |  |제목   |  |제목   |  |제목   |     |
|  |날짜   |  |날짜   |  |날짜   |  |날짜   |     |
|  +-------+  +-------+  +-------+  +-------+     |
|                                                  |
+--------------------------------------------------+
```

### 2. 행사 목록 화면
```
+--------------------------------------------------+
|  [Logo] 서초구 행사/이벤트              [검색창]    |
+--------------------------------------------------+
|  필터 적용: 이번주 × | 어린이 × | 문화 ×  [초기화] |
+--------------------------------------------------+
| SIDEBAR  |  MAIN CONTENT                         |
|----------|---------------------------------------|
| 카테고리  |  [정렬: 가까운 날짜순 ▼]   123건       |
| □ 문화   |  +--------------------------------+  |
| □ 체육   |  | 행사 카드 1                     |  |
| □ 교육   |  | [이미지]  서초 가족 축제          |  |
|         |  |          2025-12-25 ~ 12-26      |  |
| 대상연령  |  |          서초구청 앞 광장          |  |
| [0]━━[99]|  |          #가족 #무료 #축제         |  |
|         |  |          [상세보기]               |  |
| 비용     |  +--------------------------------+  |
| ○ 전체   |  +--------------------------------+  |
| ○ 무료   |  | 행사 카드 2                     |  |
| ○ 유료   |  | ...                             |  |
|         |  +--------------------------------+  |
+--------------------------------------------------+
```

### 3. 행사 상세 화면
```
+--------------------------------------------------+
|  [뒤로] 서초 가족 축제                            |
+--------------------------------------------------+
|                                                  |
|  [큰 이미지]                                      |
|                                                  |
|  📅 2025-12-25(수) ~ 12-26(목) 10:00-18:00      |
|  📍 서초구청 앞 광장                              |
|  👥 대상: 가족, 어린이 (5세 이상)                 |
|  💰 무료                                         |
|  🏢 주최: 서초구청 문화체육과                     |
|                                                  |
|  +--------------------------------------------+  |
|  |  🔗 원본 페이지에서 자세히 보기 >>          |  |
|  +--------------------------------------------+  |
|                                                  |
|  [행사 소개]                                     |
|  연말을 맞아 서초구민이 함께하는...              |
|                                                  |
|  [신청 방법]                                     |
|  사전 신청 없음, 현장 참여 가능                   |
|                                                  |
|  [문의]                                          |
|  서초구청 문화체육과 02-1234-5678                |
|                                                  |
|  비슷한 행사:                                    |
|  [행사1]  [행사2]  [행사3]                       |
|                                                  |
+--------------------------------------------------+
```

---

## 성공 지표 (MVP 기준)

### 기능 완성도
- [ ] 최소 3개 사이트에서 데이터 수집
- [ ] 일일 배치 정상 작동 (성공률 90% 이상)
- [ ] 필터링 기능 완성 (5개 이상)
- [ ] 모바일 반응형 디자인 완성

### 데이터 품질
- [ ] 중복률 5% 이하
- [ ] 링크 유효성 95% 이상
- [ ] 월 100건 이상 신규 행사 수집

### 사용자 경험
- [ ] 페이지 로드 시간 2초 이내
- [ ] 모바일에서 3번 클릭 내 원하는 행사 찾기 가능
- [ ] 한눈에 행사 정보 파악 가능

---

## 개발 우선순위 (MVP)

### Phase 1 (2주): 기본 시스템
1. ✅ 프로젝트 셋업 (Backend, Frontend, DB)
2. ✅ 데이터베이스 스키마 구현
3. ✅ 행사 CRUD API
4. ✅ 행사 목록/상세 UI (PC)

### Phase 2 (2주): 데이터 수집
1. ✅ 서울 열린데이터 API 연동
2. ✅ 서초구청 웹 스크래핑
3. ✅ 일일 배치 스케줄러
4. ✅ 중복 제거 로직

### Phase 3 (1주): 필터링 & 검색
1. ✅ 고급 필터 기능
2. ✅ 키워드 검색
3. ✅ 정렬 기능
4. ✅ 모바일 반응형

### Phase 4 (1주): 마무리
1. ✅ 추가 데이터 소스 연동 (2-3개)
2. ✅ 성능 최적화 (캐싱)
3. ✅ 테스트 및 버그 수정
4. ✅ 배포

**총 기간: 6주**

---

**작성일**: 2025-12-17  
**검토일**: 2025-12-17  
**버전**: 1.0
