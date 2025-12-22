# ✅ 서초구청 행사안내 크롤링 - 실전 가이드

**작성일**: 2025-12-19 21:23  
**전략**: 첫 페이지만 크롤링 (최신 정보 업데이트)

---

## 🎯 크롤링 전략

### 왜 첫 페이지만?

✅ **효율성**
- 195페이지 전체 크롤링: ~20-30분
- 첫 페이지만 크롤링: ~1-2분

✅ **최신 정보**
- 첫 페이지 = 가장 최근에 등록된 행사
- 매일 자동 크롤링으로 충분

✅ **서버 부담 최소화**
- 너무 많은 요청 방지
- 안정적인 운영

---

## 📋 최적화된 설정

### 서초구청 행사안내 Config

```json
{
  "name": "서초구청 행사안내",
  "sourceType": "WEB_SCRAPING",
  "url": "https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59",
  "districtId": 1,
  "config": {
    "method": "static",
    
    // 목록 페이지 선택자
    "listSelector": "#content tbody tr",
    "titleSelector": "td:nth-child(2) a",
    "dateSelector": "td:nth-child(4)",
    "linkSelector": "td:nth-child(2) a",
    
    // 상세 페이지 크롤링 (선택)
    "crawlDetailPage": true,
    "detailSelectors": {
      "content": ".bbs_contents"
    },
    
    // 첫 페이지만! (중요)
    "paginationEnabled": false,
    
    "timeout": 15000
  }
}
```

### 주요 포인트

1. **`paginationEnabled: false`** ← 첫 페이지만 크롤링
2. **`crawlDetailPage: true`** ← 상세 정보까지 수집
3. **`timeout: 15000`** ← 15초 타임아웃

---

## 🚀 사용 방법

### 방법 1: 데이터베이스 초기화 (권장)

DB를 초기화하면 서초구청 행사안내가 자동으로 등록됩니다.

```bash
cd backend
rm dev.db
npx prisma migrate dev --name init
npx prisma db seed
```

그 후 크롤링 테스트:
```bash
GET http://localhost:3000/test-crawler/source/2
```

### 방법 2: 관리자 페이지에서 수동 등록

1. **http://localhost:3001/admin/data-sources** 접속
2. **"➕ 웹사이트 분석 및 추가"** 클릭
3. URL 입력: `https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59`
4. 위의 Config 붙여넣기
5. **저장**

### 방법 3: API로 직접 등록

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
      "content": ".bbs_contents"
    },
    "paginationEnabled": false,
    "timeout": 15000
  },
  "isActive": true
}
```

---

## 📊 성능 비교

| 설정 | 페이지 수 | 예상 시간 | 용도 |
|------|-----------|-----------|------|
| **첫 페이지만** ✅ | 1 | ~1-2분 | 일일 자동 크롤링 |
| 10페이지 | 10 | ~5-10분 | 초기 데이터 수집 |
| 전체 (195페이지) | 195 | ~20-30분 | 전체 아카이브 |

### 첫 페이지 크롤링 세부 시간

```
1. 목록 페이지 로드: ~500ms
2. 10개 항목 발견
3. 각 항목의 상세 페이지 크롤링:
   - 항목 1: ~500ms
   - 항목 2: ~500ms
   - ...
   - 항목 10: ~500ms
4. 총 소요 시간: ~5-6초 (상세 페이지 포함)
                 ~1-2초 (상세 페이지 제외)
```

---

## 🔧 옵션 조정

### 상세 페이지 크롤링 끄기 (더 빠름)

```json
{
  "crawlDetailPage": false  // 기본 정보만
}
```

속도: ~1-2초로 단축
단점: 본문 내용 없음

### 여러 페이지 크롤링 (초기 데이터 수집)

```json
{
  "paginationEnabled": true,
  "paginationUrlPattern": "&pageIndex={page}",
  "paginationMaxPages": 10  // 10페이지까지
}
```

용도: 초기 데이터 대량 수집 시

---

## 🤖 자동 스케줄링

`SchedulerService`가 자동으로 매일 크롤링합니다.

### 현재 설정
- **실행 시간**: 매일 오전 2시
- **대상**: `isActive: true`인 모든 데이터 소스
- **자동 실행**: ✅

### 수동 실행

즉시 크롤링하고 싶다면:

```bash
# 특정 소스만
GET http://localhost:3000/test-crawler/source/2

# 모든 활성 소스
GET http://localhost:3000/test-crawler/all
```

---

## 📈 예상 결과

### 첫 페이지 크롤링 시

```
✅ 수집 예상 개수: 10개 행사
✅ 소요 시간: 1-2분
✅ 서버 부담: 매우 낮음
```

### 수집되는 정보

- ✅ 제목
- ✅ 등록일
- ✅ 상세 페이지 링크
- ✅ 본문 내용 (crawlDetailPage: true인 경우)
- ✅ 자동 카테고리 분류
- ✅ 중복 제거

---

## 🎯 권장 운영 전략

### 일반 운영 (권장) ✅

```
- 첫 페이지만 크롤링
- 매일 오전 2시 자동 실행
- 최신 10개 행사 정보 업데이트
```

**장점**:
- 빠름
- 서버 부담 적음
- 최신 정보 보장

### 초기 데이터 수집 (선택)

```
- 처음 한 번만: 10-50페이지 크롤링
- 이후: 첫 페이지만 크롤링
```

**목적**:
- 초기 데이터베이스 구축
- 다양한 행사 정보 확보

---

## 🔍 크롤링 확인

### 1. 로그 확인

백엔드 터미널에서:
```
[CrawlerService] 수집 시작: 서초구청 행사안내 (WEB_SCRAPING)
[CrawlerService] 웹 스크래핑 (static): https://...
[CrawlerService] 크롤링 대상 URL 개수: 1
[CrawlerService] 페이지 크롤링: https://...
[CrawlerService] 10개 항목 발견
[CrawlerService] 상세 페이지 크롤링 완료: ★☆ [나주시립국악단...
[CrawlerService] 정적 스크래핑 완료: 10개 행사
[CrawlerService] 저장 완료: 8개 추가, 2개 업데이트
```

### 2. 데이터베이스 확인

```bash
cd backend
npx prisma studio
```

- **Event** 테이블에서 새로 추가된 행사 확인
- **DataSource** 테이블에서 `lastCollectedAt` 시간 확인

### 3. API로 확인

```bash
GET http://localhost:3000/events?districtId=1&category=문화
```

---

## ⚠️ 문제 해결

### 아무것도 수집되지 않는 경우

1. **선택자 확인**
   - 서초구청 웹사이트 구조가 변경되었을 수 있음
   - 브라우저 개발자 도구로 실제 HTML 확인

2. **타임아웃**
   - `timeout: 30000`으로 증가

3. **로그 확인**
   - 백엔드 터미널에서 에러 메시지 확인

### 중복 데이터가 계속 쌓이는 경우

- 정상입니다! 중복 체크 로직이 있습니다.
- 같은 제목 + 같은 날짜 = 업데이트 (새로 추가 안 함)

---

## 📝 최종 확인 리스트

- [ ] 백엔드 실행 중: `http://localhost:3000`
- [ ] 프론트엔드 실행 중: `http://localhost:3001`
- [ ] 데이터 소스 등록됨
- [ ] `isActive: true` 설정
- [ ] 테스트 크롤링 성공
- [ ] 수집된 데이터 확인

---

## 🎊 완료!

이제 서초구청 행사안내 페이지에서 **매일 자동으로 최신 행사 정보**를 수집합니다!

- ✅ **효율적**: 첫 페이지만 (1-2분)
- ✅ **최신**: 가장 최근 행사 정보
- ✅ **자동**: 매일 오전 2시 실행
- ✅ **안정적**: 서버 부담 최소화

---

## 📚 관련 문서

- **ADVANCED_CRAWLING_STRATEGY.md** - 고급 크롤링 전략
- **ADVANCED_CRAWLING_COMPLETE.md** - 전체 구현 가이드
- **START_CRAWLING.md** - 실행 가이드

---

**다음**: 데이터베이스를 초기화하고 크롤링을 테스트해보세요!

```bash
cd backend
rm dev.db
npx prisma migrate dev --name init
npx prisma db seed
```

그 다음:
```bash
GET http://localhost:3000/test-crawler/source/2
```

성공! 🚀
