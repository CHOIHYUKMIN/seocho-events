# 실제 웹 크롤링 구현 가이드

**작성일**: 2025-12-19  
**버전**: 1.0

---

## 📋 개요

서초구 행사/이벤트 시스템의 크롤링 시스템은 **3가지 방식**으로 데이터를 수집합니다:

1. **API 연동** - 서울 열린데이터 광장 등 공공 API
2. **정적 스크래핑** - Cheerio를 사용한 HTML 파싱
3. **동적 스크래핑** - Puppeteer를 사용한 JavaScript 렌더링

---

## 🎯 크롤링 방식 자동 선택

`DataSource` 테이블의 설정에 따라 자동으로 적절한 방식을 선택합니다:

```typescript
{
  sourceType: 'API' | 'WEB_SCRAPING',
  config: {
    // API인 경우
    apiKey: 'YOUR_KEY',
    endpoint: '/api/endpoint',
    districtFilter: '서초구',
    
    // 웹 스크래핑인 경우
    method: 'static' | 'dynamic',
    listSelector: '.event-list .item',
    titleSelector: '.title',
    dateSelector: '.date',
    // ... 기타 설정
  }
}
```

---

## 📁 파일 구조

```
backend/src/modules/crawler/
├── crawler.service.ts           ✅ 메인 크롤링 로직
│   ├── collectFromSource()      - 소스 타입별 라우팅
│   ├── collectFromApi()         - API 연동
│   ├── collectWithCheerio()     - 정적 스크래핑
│   └── collectWithPuppeteer()   - 동적 스크래핑
│
├── test-crawler.controller.ts   ✅ 테스트 엔드포인트
│   ├── GET /test-crawler/source/:id     - 특정 소스 테스트
│   ├── GET /test-crawler/all            - 전체 소스 테스트
│   └── GET /test-crawler/simple?url=... - URL 직접 테스트
│
└── scheduler.service.ts         ✅ 일일 배치 스케줄러
    └── @Cron('0 2 * * *')       - 매일 새벽 2시 자동 실행
```

---

## 🔍 1. API 연동 방식

### 특징
- ✅ 가장 안정적
- ✅ 구조화된 데이터
- ✅ 법적 문제 없음
- ⚠️ API Key 필요

### Seed 데이터 예시
```typescript
{
  name: '서울 열린데이터 광장 (서초구)',
  sourceType: 'API',
  url: 'https://data.seoul.go.kr/api',
  config: JSON.stringify({
    apiKey: 'YOUR_API_KEY',           // 필수
    endpoint: '/dataList/OA-15488',   // 선택
    districtFilter: '서초구',         // 선택
    timeout: 15000,                    // 선택 (기본 15초)
  }),
}
```

### 구현 로직
```typescript
// crawler.service.ts - collectFromApi()
const response = await axios.get(source.url, {
  params: {
    KEY: config.apiKey,
    TYPE: 'json',
    SERVICE: 'culturalEventInfo',
    START_INDEX: 1,
    END_INDEX: 100,
  },
  timeout: config.timeout || 15000,
});

// API 응답 파싱
if (data.culturalEventInfo && data.culturalEventInfo.row) {
  for (const row of data.culturalEventInfo.row) {
    // 지역 필터링
    if (config.districtFilter && !row.GUNAME?.includes(config.districtFilter)) {
      continue;
    }
    
    events.push({
      title: row.TITLE,
      startDate: parseDate(row.STRTDATE),
      // ... 필드 매핑
    });
  }
}
```

### API Key 발급 방법
1. https://data.seoul.go.kr 접속
2. 회원가입 (무료)
3. 마이페이지 > 인증키 발급
4. `.env` 파일에 저장:
   ```bash
   SEOUL_API_KEY=your-key-here
   ```

---

## 🌐 2. 정적 웹 스크래핑 (Cheerio)

### 특징
- ✅ 빠른 처리 속도
- ✅ 리소스 적게 사용
- ✅ 대부분의 정적 페이지 지원
- ⚠️ JavaScript 렌더링 필요 시 불가

### Seed 데이터 예시
```typescript
{
  name: '서초구청 공지사항',
  sourceType: 'WEB_SCRAPING',
  url: 'https://www.seocho.go.kr/...',
  config: JSON.stringify({
    method: 'static',                          // 정적 방식 선택
    listSelector: '.board-list tr',            // 행사 리스트 선택자
    titleSelector: '.title',                   // 제목 선택자
    dateSelector: '.date',                     // 날짜 선택자
    descriptionSelector: '.description',       // 설명 선택자 (선택)
    linkSelector: 'a',                         // 링크 선택자 (선택)
    timeout: 15000,                            // 타임아웃 (선택)
  }),
}
```

### 구현 로직
```typescript
// crawler.service.ts - collectWithCheerio()
const response = await axios.get(source.url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 ...',
  },
  timeout: config.timeout || 15000,
});

const $ = cheerio.load(response.data);
const listSelector = config.listSelector || 'table tbody tr';

$(listSelector).each((index, element) => {
  const $el = $(element);
  
  // 제목 추출
  const title = $el.find(config.titleSelector).text().trim();
  
  // 날짜 추출 및 파싱
  const dateText = $el.find(config.dateSelector).text().trim();
  const startDate = parseDate(dateText);
  
  // 링크 추출 (상대 경로 → 절대 경로)
  let link = $el.find(config.linkSelector).attr('href');
  if (link && !link.startsWith('http')) {
    link = new URL(link, source.url).toString();
  }
  
  events.push({ title, startDate, originalUrl: link, ... });
});
```

### 셀렉터 찾는 방법
1. 브라우저에서 대상 페이지 열기
2. F12 (개발자 도구) 열기
3. Elements 탭에서 원하는 요소에 마우스 오버
4. 우클릭 > Copy > Copy selector

---

## 🎭 3. 동적 웹 스크래핑 (Puppeteer)

### 특징
- ✅ JavaScript 렌더링 지원
- ✅ SPA (Single Page Application) 지원
- ✅ 사용자 상호작용 가능
- ⚠️ 느린 속도
- ⚠️ 높은 리소스 사용

### Seed 데이터 예시
```typescript
{
  name: '서초문화재단',
  sourceType: 'WEB_SCRAPING',
  url: 'https://www.seochocf.or.kr',
  config: JSON.stringify({
    method: 'dynamic',                   // 동적 방식 선택
    waitForSelector: '.event-list',      // 기다릴 요소
    listSelector: '.event-list .item',   // 행사 리스트
    titleSelector: '.title h3',          // 제목
    dateSelector: '.date',               // 날짜
    descriptionSelector: '.content',     // 설명
    linkSelector: 'a',                   // 링크
    timeout: 30000,                      // 타임아웃 (더 길게)
  }),
}
```

### 구현 로직
```typescript
// crawler.service.ts - collectWithPuppeteer()
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox'],
});

const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 ...');

// 페이지 로드 (네트워크가 안정될 때까지)
await page.goto(source.url, {
  waitUntil: 'networkidle2',
});

// 동적 컨텐츠 대기
if (config.waitForSelector) {
  await page.waitForSelector(config.waitForSelector);
}

// 내용 추출
const items = await page.$$(config.listSelector);

for (const item of items) {
  const title = await item.$eval(
    config.titleSelector,
    el => el.textContent.trim()
  );
  
  const dateText = await item.$eval(
    config.dateSelector,
    el => el.textContent.trim()
  );
  
  events.push({ title, startDate: parseDate(dateText), ... });
}

await browser.close();
```

---

## 🧪 테스트 방법

### 1. 특정 데이터 소스 테스트
```bash
# ID로 데이터 소스 지정
GET http://localhost:3000/test-crawler/source/1

# 응답 예시
{
  "success": true,
  "dataSource": {
    "id": 1,
    "name": "서울 열린데이터 광장",
    "type": "API",
    "url": "https://data.seoul.go.kr/api"
  },
  "result": {
    "collected": 25,
    "added": 20,
    "updated": 5,
    "errors": []
  }
}
```

### 2. 모든 활성 소스 테스트
```bash
GET http://localhost:3000/test-crawler/all

# 응답: 각 소스별 결과 배열
{
  "success": true,
  "totalSources": 5,
  "results": [
    {
      "source": { "id": 1, "name": "...", "type": "API" },
      "result": { "collected": 25, "added": 20, ... },
      "success": true
    },
    // ...
  ]
}
```

### 3. URL 직접 테스트 (간단 버전)
```bash
GET http://localhost:3000/test-crawler/simple?url=https://example.com

# 페이지 구조 분석 결과 반환
```

---

## 📅 자동 배치 스케줄러

### 설정
```typescript
// scheduler.service.ts
@Cron('0 2 * * *')  // 매일 새벽 2시
async dailyEventCollection() {
  const sources = await this.prisma.dataSource.findMany({
    where: { isActive: true },
  });
  
  for (const source of sources) {
    await this.crawlerService.collectFromSource(source);
  }
}
```

### 수동 실행
```bash
POST http://localhost:3000/data-sources/collect
```

---

## 🔧 유틸리티 함수

### 1. 날짜 파싱 (`parseDate`)
다양한 날짜 형식 지원:
- `2026-01-15`
- `2026.01.15`
- `20260115`
- `2026년 1월 15일`

```typescript
private parseDate(dateStr: string): Date | null {
  const cleaned = dateStr.replace(/[^\d.-]/g, '');
  const match = cleaned.match(/(\d{4})[-./]?(\d{1,2})[-./]?(\d{1,2})/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }
  return null;
}
```

### 2. 연령 파싱 (`parseAge`)
대상 연령 자동 매핑:
- "유아" → 0-7세
- "어린이" → 7-13세
- "청소년" → 13-19세
- "청년" → 19-39세
- "시니어" → 65세 이상

### 3. 카테고리 매핑 (`mapCategory`)
제목 기반 자동 분류:
- "축제", "페스티벌" → 축제
- "공연", "콘서트" → 문화
- "전시", "미술" → 문화
- "교육", "강좌" → 교육
- "체육", "운동" → 체육

---

## 🎯 실전 예시

### 예시 1: 서울 열린데이터 API

**1단계: API Key 발급**
```bash
# 1. https://data.seoul.go.kr 회원가입
# 2. 마이페이지 > 인증키 발급
# 3. .env 파일에 추가
SEOUL_API_KEY=abc123...
```

**2단계: Seed 데이터 등록**
```typescript
await prisma.dataSource.create({
  data: {
    name: '서울 열린데이터 - 문화행사',
    sourceType: 'API',
    url: 'http://openapi.seoul.go.kr:8088/YOUR_KEY/json/culturalEventInfo/1/100',
    districtId: seochoId,
    config: JSON.stringify({
      apiKey: process.env.SEOUL_API_KEY,
      districtFilter: '서초구',
    }),
    isActive: true,
  },
});
```

**3단계: 테스트**
```bash
GET http://localhost:3000/test-crawler/source/1
```

### 예시 2: 정적 웹 페이지

**1단계: 페이지 분석**
```bash
# 브라우저에서 F12 > Elements
# 리스트 구조 확인:
<table class="board-list">
  <tr>
    <td class="title"><a href="/event/123">행사 제목</a></td>
    <td class="date">2026-01-15</td>
  </tr>
</table>
```

**2단계: Seed 데이터 등록**
```typescript
await prisma.dataSource.create({
  data: {
    name: '서초구청 문화행사',
    sourceType: 'WEB_SCRAPING',
    url: 'https://www.seocho.go.kr/events',
    districtId: seochoId,
    config: JSON.stringify({
      method: 'static',
      listSelector: '.board-list tr',
      titleSelector: '.title a',
      dateSelector: '.date',
      linkSelector: 'a',
    }),
    isActive: true,
  },
});
```

**3단계: 테스트**
```bash
GET http://localhost:3000/test-crawler/source/2
```

### 예시 3: 동적 웹 페이지 (React/Vue)

**1단계: 동적 렌더링 확인**
```bash
# 페이지 소스 보기 (Ctrl+U)에서 내용이 비어있으면 동적 렌더링
# 또는 Network 탭에서 AJAX 요청 확인
```

**2단계: Seed 데이터 등록**
```typescript
await prisma.dataSource.create({
  data: {
    name: '서초문화재단',
    sourceType: 'WEB_SCRAPING',
    url: 'https://www.seochocf.or.kr/events',
    districtId: seochoId,
    config: JSON.stringify({
      method: 'dynamic',            // 중요!
      waitForSelector: '.event-grid',  // 로딩 완료 확인용
      listSelector: '.event-item',
      titleSelector: 'h3.title',
      dateSelector: 'span.date',
      linkSelector: 'a.link',
      timeout: 30000,               // 더 긴 타임아웃
    }),
    isActive: true,
  },
});
```

---

## 🚨 에러 처리

### 타임아웃
```typescript
config: {
  timeout: 30000,  // 30초 (기본 15초)
}
```

### 재시도 로직
```typescript
// 현재 구현됨
const MAX_RETRIES = 3;
for (let i = 0; i < MAX_RETRIES; i++) {
  try {
    return await crawl();
  } catch (error) {
    if (i === MAX_RETRIES - 1) throw error;
  }
}
```

### 에러 로그
```typescript
// CollectionLog 테이블에 자동 기록
{
  dataSourceId: 1,
  status: 'ERROR',
  eventsCollected: 0,
  errorMessage: 'Connection timeout',
  startedAt: '2026-01-15 02:00:00',
}
```

---

## 📊 성능 최적화

### 1. 병렬 처리
```typescript
// scheduler.service.ts
const results = await Promise.allSettled(
  sources.map(source => crawlerService.collectFromSource(source))
);
```

### 2. Rate Limiting
```typescript
// 웹사이트 부하 방지
await sleep(1000);  // 1초 대기
```

### 3. 캐싱
```typescript
// 같은 날 중복 수집 방지
if (source.lastCollectedAt > today) {
  return;
}
```

---

## 🎯 권장사항

### 우선순위
1. **API 연동** (최우선) - 안정적, 법적 문제 없음
2. **정적 스크래핑** (차선) - 빠르고 가벼움
3. **동적 스크래핑** (최후) - 리소스 많이 사용

### 데이터 소스 추가 가이드
1. 사이트 접속 > 구조 확인
2. F12 > Elements > 셀렉터 복사
3. Seed 데이터 등록
4. `/test-crawler/source/:id`로 테스트
5. 성공 시 `isActive: true` 설정

---

## 📝 체크리스트

### 새 데이터 소스 추가 시
- [ ] URL 접근 가능 확인
- [ ] 페이지 구조 분석 (정적/동적)
- [ ] 셀렉터 테스트
- [ ] Config 설정 완료
- [ ] Seed 데이터 등록
- [ ] 테스트 엔드포인트로 확인
- [ ] 최소 5개 행사 수집 확인
- [ ] 중복 제거 확인
- [ ] 원본 URL 유효성 확인
- [ ] isActive 활성화

---

**작성자**: Antigravity AI  
**GitHub**: https://github.com/CHOIHYUKMIN/seocho-events  
**다음 단계**: 실제 데이터 소스 3개 이상 연동
