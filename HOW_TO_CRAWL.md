# 🚀 크롤링 실행 방법

**3가지 방법**으로 크롤링을 실행할 수 있습니다!

---

## 방법 1: 관리자 페이지 (가장 쉬움) ⭐

### 단계:
1. 관리자 페이지 열기
   ```
   http://localhost:3001/admin/data-sources
   ```

2. 원하는 데이터 소스 찾기
   - 서울 열린데이터 광장
   - 서초구청 행사안내

3. **"🧪 테스트"** 버튼 클릭!

4. 결과 확인
   - 팝업으로 결과 표시
   - 몇 개 수집되었는지 확인

**가장 간단하고 직관적입니다!**

---

## 방법 2: API 직접 호출 (개발자용)

### 브라우저 주소창에 입력:

#### 서울 API 크롤링 (ID: 1)
```
http://localhost:3000/test-crawler/source/1
```

#### 서초구청 행사안내 크롤링 (ID: 2)
```
http://localhost:3000/test-crawler/source/2
```

#### 모든 활성 데이터 소스 크롤링
```
http://localhost:3000/test-crawler/all
```

### 결과 예시:
```json
{
  "success": true,
  "dataSource": {
    "id": 1,
    "name": "서울 열린데이터 광장 (서초구)"
  },
  "result": {
    "collected": 50,    // 수집된 총 개수
    "added": 10,        // 새로 추가된 행사
    "updated": 2,       // 업데이트된 행사
    "errors": []
  }
}
```

---

## 방법 3: 자동 스케줄링 (권장) ✅

### 이미 설정되어 있습니다!

**백엔드가 실행되면 자동으로:**
- ⏰ **매일 오전 2시**에 크롤링 실행
- 🎯 `isActive: true`인 모든 데이터 소스
- 📊 자동으로 최신 정보 업데이트

### 확인 방법:
백엔드 터미널에서 다음과 같은 로그를 확인할 수 있습니다:
```
[SchedulerService] Starting scheduled collection...
[CrawlerService] 수집 시작: 서울 열린데이터 광장
[CrawlerService] 수집 시작: 서초구청 행사안내
...
[SchedulerService] Scheduled collection completed
```

**아무것도 안 해도 자동으로 크롤링됩니다!**

---

## 🧪 지금 바로 테스트해보기!

### 권장 순서:

#### 1단계: 서울 API 테스트 (빠름)
브라우저 주소창:
```
http://localhost:3000/test-crawler/source/1
```

**예상 시간**: ~2-3초  
**예상 결과**: 5-50개 행사 수집 (서초구만)

#### 2단계: 서초구청 행사안내 테스트 (조금 느림)
브라우저 주소창:
```
http://localhost:3000/test-crawler/source/2
```

**예상 시간**: ~5-10초 (상세 페이지 크롤링 포함)  
**예상 결과**: ~10개 행사 수집

#### 3단계: 수집된 데이터 확인
```
http://localhost:3001/events
```

또는 Prisma Studio:
```bash
cd backend
npx prisma studio
```
→ http://localhost:5555

---

## 📊 크롤링 결과 확인

### 백엔드 로그 확인

터미널에서 다음과 같은 로그를 볼 수 있습니다:

```
[CrawlerService] 수집 시작: 서울 열린데이터 광장 (API)
[CrawlerService] API 수집: http://openapi.seoul.go.kr:8088/...
[CrawlerService] 50개 행사 발견
[CrawlerService] API 수집 완료: 50개 행사
[CrawlerService] 저장 완료: 10개 추가, 0개 업데이트

[CrawlerService] 수집 시작: 서초구청 행사안내 (WEB_SCRAPING)
[CrawlerService] 웹 스크래핑 (static): https://www.seocho.go.kr/...
[CrawlerService] 크롤링 대상 URL 개수: 1
[CrawlerService] 페이지 크롤링: https://www.seocho.go.kr/...
[CrawlerService] 10개 항목 발견
[CrawlerService] 상세 페이지 크롤링 완료: ★☆ [나주시립국악단...
[CrawlerService] 정적 스크래핑 완료: 10개 행사
[CrawlerService] 저장 완료: 8개 추가, 2개 업데이트
```

---

## 🔄 크롤링 주기 변경 (선택)

기본값: 매일 오전 2시

### 변경하려면:

`backend/src/modules/crawler/scheduler.service.ts` 파일 수정:

```typescript
// 현재 (매일 오전 2시)
@Cron('0 2 * * *')

// 변경 예시:
@Cron('0 */6 * * *')  // 6시간마다
@Cron('0 0 * * *')    // 매일 자정
@Cron('*/30 * * * *')  // 30분마다 (테스트용)
```

---

## ⚡ 빠른 실행 가이드

### 즉시 크롤링하고 싶다면:

**Option 1: 브라우저 주소창**
```
http://localhost:3000/test-crawler/all
```
→ 모든 데이터 소스 한 번에 크롤링!

**Option 2: 관리자 페이지**
1. http://localhost:3001/admin/data-sources 열기
2. 각 데이터 소스의 "🧪 테스트" 버튼 클릭

**Option 3: Postman/cURL**
```bash
curl http://localhost:3000/test-crawler/all
```

---

## 📝 체크리스트

크롤링 실행 전:
- [ ] 백엔드 실행 중 (`http://localhost:3000`)
- [ ] 프론트엔드 실행 중 (`http://localhost:3001`)
- [ ] 데이터베이스 초기화 완료
- [ ] 데이터 소스 등록됨 (2개)

크롤링 실행:
- [ ] API 호출 또는 관리자 페이지에서 테스트 버튼 클릭
- [ ] 결과 확인 (성공/실패)
- [ ] 백엔드 로그 확인

결과 확인:
- [ ] 프론트엔드 행사 목록 확인
- [ ] Prisma Studio에서 DB 확인
- [ ] 중복 데이터 없는지 확인

---

## 🎯 정리

### 일반 사용자
→ **관리자 페이지**에서 "🧪 테스트" 버튼 클릭!

### 개발자
→ **API 직접 호출**: `http://localhost:3000/test-crawler/source/1`

### 운영 환경
→ **자동 스케줄링**: 매일 오전 2시 자동 실행 (이미 설정됨)

---

**가장 쉬운 방법**: 지금 바로 브라우저에서!

```
http://localhost:3000/test-crawler/all
```

이 URL을 브라우저 주소창에 입력하면 모든 데이터 소스가 크롤링됩니다! 🚀
