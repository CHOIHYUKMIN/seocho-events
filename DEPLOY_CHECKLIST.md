# 🚀 서초구 행사 플랫폼 - 배포 실행 체크리스트

**Google 계정**: hyukchm@gmail.com
**날짜**: 2025-12-23
**예상 소요 시간**: 30분

---

## 📋 Step 1: Google Cloud 프로젝트 생성 (5분)

### 1-1. Google Cloud Console 접속
```
https://console.cloud.google.com
```
- hyukchm@gmail.com 계정으로 로그인
- "프로젝트 만들기" 클릭

### 1-2. 프로젝트 정보 입력
```
프로젝트 이름: seocho-events
프로젝트 ID: seocho-events-XXXXX (자동 생성됨)
```

**✍️ 여기에 프로젝트 ID 기록:**
```
프로젝트 ID: ________________________
```

### 1-3. 결제 계정 연결
- "결제" 메뉴 선택
- 신용카드 등록 (무료 크레딧 $300 제공)
- ⚠️ 무료 티어 범위 내에서 사용하면 비용 발생 안 함

---

## 📋 Step 2: Firebase 프로젝트 생성 (3분)

### 2-1. Firebase Console 접속
```
https://console.firebase.google.com
```

### 2-2. 프로젝트 추가
- "프로젝트 추가" 클릭
- **기존 Google Cloud 프로젝트 선택**: seocho-events-XXXXX
- Google Analytics 사용 설정 (권장)

### 2-3. Firebase CLI 로그인 (로컬 PC에서)
```bash
# 터미널 열기 (PowerShell 또는 CMD)
npm install -g firebase-tools
firebase login
```
- 브라우저가 열리면 hyukchm@gmail.com 계정 선택
- "Firebase CLI에 액세스 허용" 클릭

---

## 📋 Step 3: Cloud SQL 인스턴스 생성 (7분)

### 3-1. Cloud SQL 페이지 이동
```
Google Cloud Console > SQL > 인스턴스 만들기
```

### 3-2. 설정 선택
```
데이터베이스 엔진: PostgreSQL
버전: PostgreSQL 15
인스턴스 ID: seocho-events-db
비밀번호: (안전한 비밀번호 설정)
리전: asia-northeast3 (서울)
영역: 단일 영역
머신 유형: 공유 코어 > db-f1-micro
저장용량: 10GB (SSD)
```

**✍️ 비밀번호 기록 (중요!):**
```
DB 비밀번호: ________________________
```

### 3-3. "인스턴스 만들기" 클릭
- 생성 완료까지 약 5분 대기

### 3-4. 연결 이름 확인
- SQL 인스턴스 목록에서 seocho-events-db 클릭
- "개요" 탭에서 "연결 이름" 복사

**✍️ 연결 이름 기록:**
```
연결 이름: ________________________
예시: seocho-events-12345:asia-northeast3:seocho-events-db
```

### 3-5. 데이터베이스 생성
- "데이터베이스" 탭 클릭
- "데이터베이스 만들기" 클릭
- 데이터베이스 이름: `seocho_events`

---

## 📋 Step 4: Backend 배포 (10분)

### 4-1. Google Cloud SDK 설치 (최초 1회)

**Windows:**
```
https://cloud.google.com/sdk/docs/install
```
- 다운로드 후 설치
- PowerShell 또는 CMD 재시작

### 4-2. gcloud 로그인
```bash
gcloud auth login
gcloud config set project [프로젝트ID]
```

### 4-3. 환경 변수 파일 생성
```bash
cd d:\DEVELOP\WORKSPACE\seocho-events\backend

# .env.production 파일 생성
notepad .env.production
```

**파일 내용 (비밀번호와 연결 이름 입력):**
```env
DATABASE_URL="postgresql://postgres:[비밀번호]@/seocho_events?host=/cloudsql/[연결이름]"
PORT=8080
NODE_ENV=production
```

### 4-4. 배포 스크립트 실행 (Windows)

**PowerShell에서 (관리자 권한):**
```powershell
cd d:\DEVELOP\WORKSPACE\seocho-events\backend

# API 활성화
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sql-component.googleapis.com

# Docker 이미지 빌드 및 배포
gcloud builds submit --tag gcr.io/[프로젝트ID]/seocho-events-api

# Cloud Run 배포
gcloud run deploy seocho-events-api `
  --image gcr.io/[프로젝트ID]/seocho-events-api `
  --platform managed `
  --region asia-northeast3 `
  --allow-unauthenticated `
  --add-cloudsql-instances [연결이름] `
  --set-env-vars "DATABASE_URL=[DATABASE_URL 값],NODE_ENV=production" `
  --memory 512Mi `
  --port 8080
```

**✍️ 배포 완료 후 API URL 기록:**
```
API URL: ________________________
예시: https://seocho-events-api-xxxxx-an.a.run.app
```

---

## 📋 Step 5: DB 마이그레이션 (5분)

### 5-1. Cloud SQL Proxy 다운로드

**Windows PowerShell:**
```powershell
# backend 폴더에서
Invoke-WebRequest -Uri https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.x64.exe -OutFile cloud-sql-proxy.exe
```

### 5-2. Cloud SQL Proxy 실행 (새 터미널)
```powershell
.\cloud-sql-proxy.exe [연결이름]
```
- 이 터미널은 계속 실행 상태로 유지

### 5-3. 마이그레이션 실행 (다른 터미널)
```powershell
# backend 폴더에서
$env:DATABASE_URL="postgresql://postgres:[비밀번호]@localhost:5432/seocho_events"
npx prisma migrate deploy
npx prisma db seed
```

### 5-4. Cloud SQL Proxy 종료
- 첫 번째 터미널에서 Ctrl+C

---

## 📋 Step 6: Frontend 배포 (5분)

### 6-1. Firebase 초기화
```bash
cd d:\DEVELOP\WORKSPACE\seocho-events\frontend

firebase init hosting
```

**선택 사항:**
- What do you want to use as your public directory? **out**
- Configure as a single-page app? **Yes**
- Set up automatic builds and deploys with GitHub? **No**

### 6-2. .env.production 생성
```bash
notepad .env.production
```

**내용:**
```env
NEXT_PUBLIC_API_URL=[API URL]
```

### 6-3. 빌드 및 배포
```powershell
npm install
npm run build
firebase deploy --only hosting
```

**✍️ 배포 완료 후 Frontend URL 기록:**
```
Frontend URL: ________________________
예시: https://seocho-events-12345.web.app
```

---

## 📋 Step 7: 크롤링 스케줄러 설정 (5분)

### 7-1. Functions 설정
```bash
cd d:\DEVELOP\WORKSPACE\seocho-events\functions

npm install

firebase functions:config:set api.url="[API URL]"
```

### 7-2. Functions 배포
```bash
firebase deploy --only functions
```

---

## ✅ 배포 완료 확인

### 1. Backend API 테스트
```bash
curl [API URL]/health
curl [API URL]/events
```

### 2. Frontend 접속
```
[Frontend URL]
```

### 3. 관리자 페이지
```
[Frontend URL]/admin/data-sources
```

### 4. 수동 크롤링 테스트
```bash
curl https://asia-northeast3-[프로젝트ID].cloudfunctions.net/manualCrawl `
  -H "Authorization: Bearer $(gcloud auth print-identity-token)"
```

---

## 📊 최종 정보 요약

**✍️ 모든 정보를 여기 기록:**

```
┌─────────────────────────────────────────────────┐
│  서초구 행사 플랫폼 - 배포 정보                    │
└─────────────────────────────────────────────────┘

🔐 계정 정보
────────────────────────────────────────────────
Google 계정: hyukchm@gmail.com
프로젝트 ID: ________________________
프로젝트 이름: seocho-events

🗄️ 데이터베이스
────────────────────────────────────────────────
Cloud SQL 인스턴스: seocho-events-db
연결 이름: ________________________
데이터베이스: seocho_events
사용자: postgres
비밀번호: ************************

🚀 배포 URL
────────────────────────────────────────────────
Frontend: ________________________
Backend API: ________________________
Functions: https://asia-northeast3-[프로젝트ID].cloudfunctions.net

📱 Firebase
────────────────────────────────────────────────
Firebase 콘솔: https://console.firebase.google.com/project/[프로젝트ID]
Hosting URL: ________________________

⏰ 크롤링
────────────────────────────────────────────────
스케줄: 매일 새벽 2시 (Asia/Seoul)
수동 트리거: curl [Functions URL]/manualCrawl

💰 비용 (예상)
────────────────────────────────────────────────
Cloud SQL: $7-10/월
Cloud Run: $2-4/월
Firebase Hosting: 무료
Cloud Functions: 무료
────────────────────────────────────────────────
총 예상: $9-14/월

📊 현재 상태
────────────────────────────────────────────────
데이터 소스: 3개
  - 서초구청 행사안내
  - 서초구육아종합지원센터
  - 서울 열린데이터 (API)

수집된 행사: 약 30개
카테고리: 6개 (축제, 문화, 체육, 교육, 전시, 기타)
지역: 서초구

🔍 모니터링
────────────────────────────────────────────────
Cloud Console: https://console.cloud.google.com
Firebase Console: https://console.firebase.google.com
Cloud Logging: https://console.cloud.google.com/logs

📞 문제 발생 시
────────────────────────────────────────────────
1. DEPLOYMENT_GUIDE.md 참고
2. QUICKSTART.md 참고
3. Cloud Logging 확인
```

---

## 🎯 배포 후 할 일

### 즉시
- [ ] Frontend URL로 접속하여 확인
- [ ] 관리자 페이지에서 데이터 소스 확인
- [ ] 수동 크롤링 1회 실행
- [ ] 행사 목록 정상 표시 확인

### 1일 이내
- [ ] 자동 크롤링 정상 작동 확인 (다음날 새벽 2시 이후)
- [ ] Cloud Monitoring 알림 설정
- [ ] 백업 설정 확인

### 1주일 이내
- [ ] 커스텀 도메인 연결 (선택)
- [ ] 비용 확인
- [ ] 성능 모니터링

---

## 💡 유용한 명령어

### Backend 업데이트
```bash
cd backend
gcloud builds submit --tag gcr.io/[프로젝트ID]/seocho-events-api
gcloud run deploy seocho-events-api --image gcr.io/[프로젝트ID]/seocho-events-api --region asia-northeast3
```

### Frontend 업데이트
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Functions 업데이트
```bash
cd functions
firebase deploy --only functions
```

### 로그 확인
```bash
# Cloud Run 로그
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Functions 로그
firebase functions:log
```

### DB 백업
```bash
gcloud sql export sql seocho-events-db gs://[버킷이름]/backup.sql --database=seocho_events
```

---

## ✨ 완료!

모든 단계를 완료하셨나요? 축하합니다! 🎉

이제 서초구 행사 정보가 자동으로 수집되는
완전한 웹 애플리케이션이 실행 중입니다.

**문제가 발생하면:**
1. 각 단계의 로그 확인
2. Google Cloud Console에서 상태 확인
3. DEPLOYMENT_GUIDE.md 상세 문서 참고
