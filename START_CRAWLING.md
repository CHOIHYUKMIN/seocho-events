# 🚀 서울 열린데이터 API 크롤링 시작하기

## ✅ 완성된 기능

### 1. 백엔드 (Backend)
- ✅ 서울 열린데이터 API 크롤러 구현
- ✅ 정적/동적 웹 크롤링 지원 (Cheerio/Puppeteer)
- ✅ 관리자 API 엔드포인트 완성
- ✅ 데이터 소스 CRUD
- ✅ 크롤링 테스트 및 토글 기능

### 2. 프론트엔드 (Frontend)
- ✅ 관리자 데이터 소스 관리 페이지
- ✅ 서울 API 빠른 등록 기능
- ✅ 웹사이트 분석 및 자동 설정 추천
- ✅ 아름다운 UI/UX

---

## 🎯 실행 방법

### Step 1: 데이터베이스 초기화 (최초 1회만)

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 2: 백엔드 실행

**방법 1: 개발 모드**
```bash
cd backend
npm run start:dev
```

**방법 2: PowerShell 실행 정책 문제가 있는 경우**
```bash
# PowerShell을 관리자 권한으로 실행 후
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 또는 직접 실행
cd backend
node dist/main
```

**방법 3: 빌드 후 실행**
```bash
cd backend
npm run build
npm run start:prod
```

백엔드가 실행되면 다음 메시지가 표시됩니다:
```
[Nest] Application is running on: http://localhost:3000
```

### Step 3: 프론트엔드 실행 (새 터미널)

```bash
cd frontend
npm run dev
```

프론트엔드가 실행되면:
```
- Local: http://localhost:3001
```

---

## 🧪 테스트 방법

### 1. 브라우저에서 관리자 페이지 접속

```
http://localhost:3001/admin/data-sources
```

### 2. 서울 열린데이터 API 등록

1. **"🏛️ 서울 열린데이터 API 등록"** 버튼 클릭
2. API 키 입력 (기본값 사용 가능: `545a4e4865687975313231706c5a7146`)
3. **"✅ API 등록하기"** 클릭
4. 등록 완료!

### 3. 크롤링 테스트

등록된 데이터 소스 목록에서:
- **"🧪 테스트"** 버튼 클릭
- 테스트 결과 확인

### 4. 직접 API 호출 테스트

**Postman 또는 브라우저에서:**

```bash
# 데이터 소스 목록 조회
GET http://localhost:3000/admin/data-sources

# 특정 소스로 크롤링 테스트
POST http://localhost:3000/admin/data-sources/1/test
```

**PowerShell에서:**

```powershell
# 데이터 소스 목록 조회
Invoke-RestMethod -Uri "http://localhost:3000/admin/data-sources" -Method Get

# 서울 API로 실제 크롤링 실행
Invoke-RestMethod -Uri "http://localhost:3000/test-crawler/source/1" -Method Get
```

---

## 🌐 웹사이트 크롤링 추가하기

### 1. 관리자 페이지에서

1. **"➕ 웹사이트 분석 및 추가"** 버튼 클릭
2. URL 입력 (예: `https://www.seocho.go.kr`)
3. **"🔍 분석"** 버튼 클릭
4. 자동으로 추천된 설정 확인
5. 데이터 소스 이름 입력
6. **"✅ 이 설정으로 저장"** 클릭

### 2. API로 직접 등록

```bash
POST http://localhost:3000/admin/data-sources
Content-Type: application/json

{
  "name": "서초문화재단",
  "sourceType": "WEB_SCRAPING",
  "url": "https://www.seochocf.or.kr",
  "districtId": 1,
  "config": {
    "method": "static",
    "listSelector": ".event-list .item",
    "titleSelector": ".title",
    "dateSelector": ".date"
  },
  "isActive": true
}
```

---

## 📊 API 엔드포인트 전체 목록

### 관리자 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/admin/data-sources` | 데이터 소스 목록 조회 |
| GET | `/admin/data-sources/:id` | 데이터 소스 상세 조회 |
| POST | `/admin/data-sources` | 새 데이터 소스 등록 ⭐ |
| PUT | `/admin/data-sources/:id` | 데이터 소스 수정 |
| DELETE | `/admin/data-sources/:id` | 데이터 소스 삭제 |
| POST | `/admin/data-sources/analyze` | 웹사이트 분석 ⭐ |
| POST | `/admin/data-sources/:id/toggle` | 활성화/비활성화 토글 ⭐ |
| POST | `/admin/data-sources/:id/test` | 크롤링 테스트 ⭐ |

### 테스트 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/test-crawler/source/:id` | 특정 소스로 크롤링 실행 |
| GET | `/test-crawler/all` | 모든 활성 소스 크롤링 |
| GET | `/test-crawler/simple?url=...` | URL 직접 테스트 |

---

## 🔥 실제 크롤링 실행

### 자동 스케줄링 (매일 자동 실행)

백엔드가 실행되면 자동으로 매일 지정된 시간에 크롤링이 실행됩니다.
기본 설정: **매일 오전 2시**

### 수동 실행

```bash
# 특정 데이터 소스만 크롤링
GET http://localhost:3000/test-crawler/source/1

# 모든 활성 데이터 소스 크롤링
GET http://localhost:3000/test-crawler/all
```

---

## 🐛 문제 해결

### 1. PowerShell 실행 정책 오류

```powershell
# 관리자 권한으로 PowerShell 실행 후
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. 포트 충돌

백엔드(3000) 또는 프론트엔드(3001) 포트가 이미 사용 중인 경우:

```bash
# Windows에서 특정 포트 사용 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <프로세스ID> /F
```

### 3. 데이터베이스 리셋

```bash
cd backend
rm dev.db
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 🎉 완료!

이제 다음 기능을 사용할 수 있습니다:

- ✅ **서울 열린데이터 API로 실제 행사 정보 수집**
- ✅ **관리자 페이지에서 데이터 소스 관리**
- ✅ **웹사이트 자동 분석 및 크롤링 설정**
- ✅ **수집된 행사 데이터 확인**

---

## 📝 다음 단계

1. ✅ 백엔드 및 프론트엔드 실행
2. ✅ 서울 API 등록 및 테스트
3. ⏳ 실제 행사 데이터 수집 확인
4. ⏳ 추가 웹사이트 크롤링 설정
5. ⏳ 스케줄러 동작 확인

---

**준비 완료!** 🚀
백엔드와 프론트엔드를 실행하고 크롤링을 시작하세요!
