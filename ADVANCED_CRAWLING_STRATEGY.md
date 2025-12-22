# 🚀 고급 크롤링 전략 및 구현 가이드

**작성일**: 2025-12-19  
**대상 사이트**: 서초구청 행사안내 및 다양한 웹사이트

---

## 📊 서초구청 행사안내 페이지 분석 결과

### 🔍 페이지 구조

**목록 페이지**: https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59

#### 특징:
- ✅ **방식**: 전통적인 서버 사이드 렌더링 (SSR)
- ✅ **구조**: `<table>` 형태의 게시판
- ✅ **페이지네이션**: 195페이지 (pageIndex 파라미터)
- ✅ **정적 크롤링 가능**: Cheerio로 충분

#### 목록 페이지 데이터 구조:
```
- 제목: <a href="View.do?cbIdx=59&bcIdx=406198">...</a>
- 링크: /site/seocho/ex/bbs/View.do?cbIdx=59&bcIdx={게시물ID}
- 페이지네이션: pageIndex=1 ~ 195
```

**상세 페이지**: https://www.seocho.go.kr/site/seocho/ex/bbs/View.do?cbIdx=59&bcIdx={게시물ID}

#### 추출 가능한 정보:
- 📌 글제목
- 👤 담당부서
- 📅 등록일
- 📞 연락처
- 📝 본문 내용 (HTML 포함)
- 🖼️ 첨부 이미지

---

## 🎯 크롤링 전략

### 1. **목록 + 상세 2단계 크롤링**

```javascript
// 1단계: 목록 페이지 크롤링
for (let page = 1; page <= 195; page++) {
  const listUrl = `https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59&pageIndex=${page}`;
  
  // 목록에서 각 행사의 제목, bcIdx 추출
  const events = extractEventList(listUrl);
  
  // 2단계: 각 행사의 상세 페이지 크롤링
  for (const event of events) {
    const detailUrl = `https://www.seocho.go.kr/site/seocho/ex/bbs/View.do?cbIdx=59&bcIdx=${event.bcIdx}`;
    const details = extractEventDetail(detailUrl);
    
    // 데이터 병합 및 저장
    saveEvent({ ...event, ...details });
  }
}
```

### 2. **오픈소스 크롤링 도구 비교**

| 도구 | 타입 | 장점 | 단점 | 적합한 경우 |
|------|------|------|------|-------------|
| **Cheerio** | 정적 | 빠름, 가벼움 | JavaScript 렌더링 불가 | SSR 페이지 |
| **Puppeteer** | 동적 | 모든 JS 실행, 스크린샷 | 느림, 무거움 | SPA, 동적 콘텐츠 |
| **Playwright** | 동적 | 빠름, 다중 브라우저 | 설정 복잡 | 프로덕션 크롤링 |
| **Crawlee** | 통합 | 큐, 재시도, 프록시 | 러닝 커브 | 대규모 크롤링 |
| **Axios-Cheerio** | 정적 | 간단, 효율적 | 정적만 | 서초구청 같은 사이트 |

### 3. **권장 스택**

#### ✅ 서초구청 행사안내 (현재 사이트)
```typescript
// Axios + Cheerio (정적 크롤링)
- 빠른 속도
- 낮은 리소스 사용
- 서버 SSR 페이지에 최적
```

#### ✅ SPA 사이트 (React, Vue, Angular)
```typescript
// Puppeteer 또는 Playwright
- JavaScript 실행 필요
- 동적 로딩 콘텐츠
- 예: 서초문화재단 (가능성)
```

#### ✅ 대규모 크롤링
```typescript
// Crawlee
- 자동 큐 관리
- 재시도 로직
- 프록시 로테이션
- 멀티스레딩
```

---

## 💻 구현 개선안

### A. 목록 + 상세 페이지 크롤링 지원

현재 `CrawlerService`는 목록 페이지만 크롤링합니다. 상세 페이지까지 크롤링하도록 개선이 필요합니다.

#### 개선 방안:

**Option 1: Config에 상세 페이지 설정 추가**
```typescript
interface CrawlerConfig {
  // 기존
  listSelector: string;
  titleSelector: string;
  dateSelector: string;
  
  // 추가: 상세 페이지 크롤링
  detailUrlSelector?: string;        // 상세 페이지 링크 선택자
  crawlDetailPage?: boolean;         // 상세 페이지 크롤링 여부
  detailSelectors?: {                // 상세 페이지 선택자
    title?: string;
    content?: string;
    department?: string;
    contact?: string;
    images?: string;
  };
}
```

**Option 2: 별도 DetailCrawlerService 구현**
```typescript
class DetailCrawlerService {
  async crawlDetailPage(url: string, config: DetailConfig): Promise<EventDetails> {
    // 상세 페이지 크롤링 로직
  }
}
```

**Option 3: 재귀적 크롤링**
```typescript
async collectWithDepth(url: string, config: CrawlerConfig, depth: number = 0) {
  if (depth > config.maxDepth) return;
  
  // 현재 페이지 크롤링
  const items = await crawlPage(url);
  
  // 각 아이템의 상세 페이지 크롤링
  for (const item of items) {
    if (item.detailUrl) {
      item.details = await this.collectWithDepth(
        item.detailUrl,
        config.detailConfig,
        depth + 1
      );
    }
  }
}
```

### B. 페이지네이션 지원

```typescript
interface CrawlerConfig {
  // 추가: 페이지네이션
  paginationEnabled?: boolean;
  paginationSelector?: string;       // 다음 페이지 버튼
  paginationMaxPages?: number;       // 최대 페이지 수
  paginationUrlPattern?: string;     // URL 패턴 (예: &pageIndex={page})
}
```

구현:
```typescript
async crawlWithPagination(baseUrl: string, config: CrawlerConfig) {
  const allEvents = [];
  
  if (config.paginationUrlPattern) {
    // URL 패턴 방식
    const maxPages = config.paginationMaxPages || 10;
    for (let page = 1; page <= maxPages; page++) {
      const url = baseUrl + config.paginationUrlPattern.replace('{page}', page.toString());
      const events = await this.crawlPage(url, config);
      allEvents.push(...events);
    }
  } else if (config.paginationSelector) {
    // 다음 버튼 클릭 방식 (Puppeteer 필요)
    let hasNext = true;
    while (hasNext) {
      const events = await this.crawlPage(currentUrl, config);
      allEvents.push(...events);
      hasNext = await clickNextButton(config.paginationSelector);
    }
  }
  
  return allEvents;
}
```

### C. SPA 크롤링 지원

#### Playwright 추가 (Puppeteer보다 빠름)

```bash
npm install playwright
```

```typescript
import { chromium } from 'playwright';

async collectFromSPA(url: string, config: CrawlerConfig) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // JavaScript 실행 대기
  if (config.waitForSelector) {
    await page.waitForSelector(config.waitForSelector);
  }
  
  // 스크롤하여 Lazy Loading 콘텐츠 로드
  if (config.scrollToLoad) {
    await autoScroll(page);
  }
  
  // 데이터 추출
  const events = await page.$$eval(config.listSelector, (elements) => {
    return elements.map(el => ({
      title: el.querySelector('.title')?.textContent,
      date: el.querySelector('.date')?.textContent,
      // ...
    }));
  });
  
  await browser.close();
  return events;
}
```

---

## 🔧 서초구청 행사안내 크롤링 설정

### 최종 Config

```typescript
{
  name: '서초구청 행사안내',
  sourceType: 'WEB_SCRAPING',
  url: 'https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59',
  districtId: 1,
  config: {
    method: 'static',  // Cheerio 사용
    
    // 목록 페이지
    listSelector: '#content tbody tr',  // 각 행사 행
    titleSelector: 'td:nth-child(2) a',
    dateSelector: 'td:nth-child(4)',
    linkSelector: 'td:nth-child(2) a',  // href 속성
    
    // 상세 페이지 크롤링
    crawlDetailPage: true,
    detailSelectors: {
      title: '.subject',  // 실제 선택자는 HTML 확인 필요
      content: '.bbs_contents',
      department: '.department',
      contact: '.contact',
      images: 'img'
    },
    
    // 페이지네이션
    paginationEnabled: true,
    paginationUrlPattern: '&pageIndex={page}',
    paginationMaxPages: 195  // 또는 동적으로 계산
  },
  isActive: true
}
```

---

## 📦 Crawlee를 사용한 고급 크롤링 (선택사항)

### 설치
```bash
npm install crawlee
```

### 구현
```typescript
import { CheerioCrawler } from 'crawlee';

const crawler = new CheerioCrawler({
  requestHandler: async ({ request, $, enqueueLinks }) => {
    const title = $('title').text();
    console.log(`Processing: ${title}`);
    
    // 목록에서 상세 페이지 링크 추출 및 큐에 추가
    await enqueueLinks({
      selector: 'td:nth-child(2) a',
      baseUrl: request.loadedUrl,
    });
    
    // 데이터 추출
    const events = [];
    $('#content tbody tr').each((i, el) => {
      events.push({
        title: $(el).find('td:nth-child(2) a').text(),
        date: $(el).find('td:nth-child(4)').text(),
        link: $(el).find('td:nth-child(2) a').attr('href'),
      });
    });
    
    // 데이터 저장
    await saveEvents(events);
  },
  
  maxRequestsPerCrawl: 1000,  // 최대 1000페이지
  maxConcurrency: 5,           // 동시 5개 요청
});

// 크롤링 시작
await crawler.run([
  'https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59'
]);
```

---

## 🎯 단계별 구현 계획

### Phase 1: 기본 개선 (즉시)
1. ✅ Config에 `detailUrlSelector` 추가
2. ✅ 상세 페이지 크롤링 로직 추가
3. ✅ 페이지네이션 지원 추가

### Phase 2: 고급 기능 (1주)
1. ⏳ Playwright 통합 (SPA 지원)
2. ⏳ 자동 재시도 로직
3. ⏳ 크롤링 진행률 표시

### Phase 3: 프로덕션 (2주)
1. ⏳ Crawlee 통합
2. ⏳ 프록시 로테이션
3. ⏳ Rate Limiting
4. ⏳ 크롤링 큐 관리

---

## 📝 다음 단계

1. **CrawlerService 개선**
   - 목록 + 상세 페이지 크롤링 지원
   - 페이지네이션 자동 처리
   
2. **서초구청 행사안내 등록 및 테스트**
   - 위 Config로 데이터 소스 등록
   - 실제 크롤링 테스트
   
3. **UI에서 상세 페이지 설정 지원**
   - 관리자 페이지에서 상세 페이지 선택자 설정
   - 미리보기 기능 추가

---

**준비 완료!** 이제 고급 크롤링 전략을 구현할 준비가 되었습니다! 🚀
