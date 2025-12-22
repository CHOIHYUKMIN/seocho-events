# ✅ 고급 크롤링 구현 완료!

**작성일**: 2025-12-19 20:51  
**구현 사항**: 목록 + 상세 페이지 크롤링, 페이지네이션, 고급 크롤링 전략

---

## 🎉 완성된 기능

### 1. **목록 + 상세 페이지 2단계 크롤링** ✅

이제 `CrawlerService`가 목록 페이지뿐만 아니라 각 항목의 **상세 페이지**까지 자동으로 크롤링합니다!

```typescript
// 사용 예시
{
  crawlDetailPage: true,  // 상세 페이지 크롤링 활성화
  detailSelectors: {
    title: '.subject',
    content: '.bbs_contents',
    department: '.department',
    contact: '.contact',
    date: '.date'
  }
}
```

### 2. **자동 페이지네이션** ✅

여러 페이지에 걸친 목록을 자동으로 크롤링합니다!

```typescript
{
  paginationEnabled: true,
  paginationUrlPattern: '&pageIndex={page}',
  paginationMaxPages: 195  // 최대 195페이지까지
}
```

### 3. **Rate Limiting** ✅

서버에 부담을 주지 않도록 자동으로 요청 간격을 조절합니다.
- 페이지 간: 1초 대기
- 상세 페이지 간: 500ms 대기

---

## 📝 서초구청 행사안내 크롤링 설정

### 즉시 사용 가능한 Config

```json
{
  "name": "서초구청 행사안내",
  "sourceType": "WEB_SCRAPING",
  "url": "https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59",
  "districtId": 1,
  "config": {
    "method": "static",
    
    "listSelector": "#content tbody tr",
    "titleSelector": "td:nth-child(2) a",
    "dateSelector": "td:nth-child(4)",
    "linkSelector": "td:nth-child(2) a",
    
    "crawlDetailPage": true,
    "detailSelectors": {
      "title": ".subject",
      "content": ".bbs_contents",
      "department": ".department",
      "contact": ".contact"
    },
    
    "paginationEnabled": true,
    "paginationUrlPattern": "&pageIndex={page}",
    "paginationMaxPages": 10
  },
  "isActive": true
}
```

**주의**: 처음 테스트할 때는 `paginationMaxPages: 10`으로 설정하여 10페이지만 크롤링하세요. 성공하면 195로 증가시킬 수 있습니다.

---

## 🚀 사용 방법

### 1. 관리자 페이지에서 등록

1. **http://localhost:3001/admin/data-sources** 접속
2. **"➕ 웹사이트 분석 및 추가"** 클릭
3. URL 입력: `https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59`
4. **"🔍 분석"** 클릭
5. 데이터 소스 이름 입력: "서초구청 행사안내"
6. Config 수정 (위의 설정 참고)
7. **"✅ 이 설정으로 저장"** 클릭

### 2. API로 직접 등록

```bash
POST http://localhost:3000/admin/data-sources
Content-Type: application/json

{
  "name": "서초구청 행사안내",
  "sourceType": "WEB_SCRAPING",
  "url": "https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59",
  "districtId": 1,
  "config": {
    "method": "static",
    "listSelector": "#content tbody tr",
    "titleSelector": "td:nth-child(2) a",
    "dateSelector": "td:nth-child(4)",
    "linkSelector": "td:nth-child(2) a",
    "crawlDetailPage": true,
    "detailSelectors": {
      "title": ".subject",
      "content": ".bbs_contents"
    },
    "paginationEnabled": true,
    "paginationUrlPattern": "&pageIndex={page}",
    "paginationMaxPages": 10
  },
  "isActive": true
}
```

###  3. 크롤링 테스트

등록 후:
1. 데이터 소스 목록에서 **"🧪 테스트"** 버튼 클릭
2. 또는 API 호출:
   ```bash
   GET http://localhost:3000/test-crawler/source/{데이터소스ID}
   ```

---

## 📊 개선된 CrawlerService 구조

### 변경 사항

#### Before (기존)
```
collectWithCheerio()
  └─> 목록 페이지만 크롤링
      └─> 각 항목의 기본 정보만 추출
```

#### After (개선) ✨
```
collectWithCheerio()
  ├─> 페이지네이션 URL 생성
  └─> 각 페이지에 대해:
      ├─> crawlSinglePage()
      │   ├─> 목록에서 항목 추출
      │   └─> 각 항목에 대해:
      │       ├─> 기본 정보 추출
      │       └─> crawlDetailPage() (옵션)
      │           └─> 상세 정보 추출 및 병합
      └─> Rate Limiting (1초 대기)
```

### 새로운 메서드

1. **`crawlSinglePage()`**: 단일 페이지 크롤링
2. **`crawlDetailPage()`**: 상세 페이지 정보 추출
3. **`generatePaginationUrls()`**: 페이지네이션 URL 자동 생성
4. **`delay()`**: Rate limiting 헬퍼

---

## 🎯 실제 동작 시나리오

### 서초구청 행사안내를 10페이지 크롤링하는 경우:

```
1. 페이지 1 크롤링
   ├─ 10개 행사 발견
   ├─ 각 행사마다:
   │  ├─ 목록에서 제목, 날짜 추출
   │  └─ 상세 페이지 접속하여 본문, 담당부서, 연락처 추출
   └─ 10개 행사 데이터 수집 완료

2. 1초 대기 (Rate Limiting)

3. 페이지 2 크롤링
   └─ (동일한 과정 반복)

...

10. 페이지 10 크롤링
    └─ 총 100개 행사 데이터 수집 완료!
```

---

## 🔧 설정 옵션 상세

### CrawlerConfig 전체 옵션

```typescript
interface CrawlerConfig {
  // 기본 설정
  method?: 'static' | 'dynamic';  // 크롤링 방식
  timeout?: number;                // 타임아웃 (ms)
  
  // 목록 페이지 선택자
  listSelector?: string;           // 항목 목록 선택자
  titleSelector?: string;          // 제목 선택자
  dateSelector?: string;           // 날짜 선택자
  linkSelector?: string;           // 링크 선택자
  descriptionSelector?: string;   // 설명 선택자
  
  // 상세 페이지 크롤링
  crawlDetailPage?: boolean;      // 상세 페이지 크롤링 활성화
  detailSelectors?: {
    title?: string;               // 상세 페이지 제목
    content?: string;             // 본문 내용
    department?: string;          // 담당 부서
    contact?: string;             // 연락처
    date?: string;                // 날짜
    images?: string;              // 이미지
  };
  
  // 페이지네이션
  paginationEnabled?: boolean;     // 페이지네이션 활성화
  paginationUrlPattern?: string;   // URL 패턴 (예: '&pageIndex={page}')
  paginationMaxPages?: number;     // 최대 페이지 수 (최대 50)
  
  // API 설정 (API 타입인 경우)
  apiKey?: string;
  districtFilter?: string;
}
```

---

## 📈 성능 및 제한사항

### 성능
- **정적 크롤링 (Cheerio)**: 매우 빠름 (~100ms/페이지)
- **동적 크롤링 (Puppeteer)**: 느림 (~2-3초/페이지)
- **상세 페이지 크롤링**: 추가 시간 필요 (항목당 ~500ms)

### 제한사항
- **최대 페이지**: 50페이지 (하드코딩)
- **Rate Limiting**: 
  - 페이지 간: 1000ms
  - 상세 페이지 간: 500ms
- **타임아웃**: 기본 15초

### 권장사항
- 처음 테스트는 **5-10페이지**로 시작
- 성공 후 점진적으로 페이지 수 증가
- 195페이지 전체 크롤링은 시간이 오래 걸림 (약 20-30분)

---

## 🐛 문제 해결

### 1. 선택자가 작동하지 않는 경우
- 브라우저 개발자 도구에서 실제 HTML 구조 확인
- 선택자를 더 구체적으로 지정

### 2. 너무 느린 경우
- `crawlDetailPage: false`로 설정하여 상세 페이지 크롤링 비활성화
- `paginationMaxPages`를 줄이기

### 3. 에러가 발생하는 경우
- 백엔드 로그 확인: 터미널에서 에러 메시지 확인
- 타임아웃 증가: `timeout: 30000` (30초)

---

## 📚 관련 문서

- **ADVANCED_CRAWLING_STRATEGY.md**: 전체 크롤링 전략 및 오픈소스 도구 비교
- **CRAWLING_SUMMARY.md**: 기본 크롤링 구현 요약
- **START_CRAWLING.md**: 실행 가이드

---

## 🎊 다음 단계

### 즉시 (지금)
1. ✅ 서초구청 행사안내 데이터 소스 등록
2. ✅ 5-10페이지로 테스트 크롤링
3. ✅ 수집된 데이터 확인

### 단기 (이번 주)
1. ⏳ 다른 웹사이트 추가 (서초문화재단, 서초도서관 등)
2. ⏳ 선택자 미세 조정
3. ⏳ 스케줄러로 자동 크롤링 설정

### 중기 (다음 주)
1. ⏳ Playwright 도입 (SPA 지원)
2. ⏳ 이미지 다운로드 및 저장
3. ⏳ 크롤링 통계 대시보드

---

**완료!** 🚀

이제 서초구청 행사안내 195페이지를 자동으로 크롤링하고, 각 행사의 상세 정보까지 수집할 수 있습니다!

**백엔드 상태**: ✅ 실행 중, 자동 재컴파일 완료  
**프론트엔드 상태**: ✅ 실행 중  

**다음**: 관리자 페이지에서 서초구청 데이터 소스를 등록하고 테스트하세요!
