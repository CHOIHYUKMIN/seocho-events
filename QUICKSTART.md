# 🚀 Firebase 배포 - 빠른 시작 가이드

## ⚡ TL;DR - 3단계로 배포하기

```bash
# 1️⃣ Backend 배포 (Cloud Run)
cd backend
./deploy-backend.sh [프로젝트ID] asia-northeast3 [Cloud SQL 인스턴스]

# 2️⃣ DB 마이그레이션
./migrate-deploy.sh [Cloud SQL 인스턴스]

# 3️⃣ Frontend 배포 (Firebase Hosting)
cd ../frontend
./deploy-frontend.sh https://[YOUR-API-URL]
```

**완료! 🎉** 

---

## 📋 사전 준비 체크리스트

### ✅ 해야 할 것들

1. **Google Cloud 계정 생성**
   - https://console.cloud.google.com
   - 결제 계정 연결 (무료 크레딧 $300 제공)

2. **Firebase 프로젝트 생성**
   - https://console.firebase.google.com
   - 프로젝트 ID 메모

3. **도구 설치**
   ```bash
   # Firebase CLI
   npm install -g firebase-tools
   
   # Google Cloud SDK
   # Windows: https://cloud.google.com/sdk/docs/install
   
   # Docker (선택 - 로컬 테스트용)
   # https://docs.docker.com/get-docker/
   ```

4. **로그인**
   ```bash
   # Firebase 로그인
   firebase login
   
   # Google Cloud 로그인
   gcloud auth login
   gcloud config set project [프로젝트ID]
   ```

---

## 🗄️ Cloud SQL 설정 (5분)

### 1. 인스턴스 생성

```bash
# Google Cloud Console에서:
```

**또는 CLI로:**
```bash
gcloud sql instances create seocho-events-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast3 \
  --root-password=[비밀번호]
```

### 2. 데이터베이스 생성

```bash
gcloud sql databases create seocho_events \
  --instance=seocho-events-db
```

### 3. 연결 정보 확인

```bash
gcloud sql instances describe seocho-events-db
```

**인스턴스 연결 이름 메모:**
```
[프로젝트ID]:asia-northeast3:seocho-events-db
```

---

## 🔐 환경 변수 설정

### Backend (.env.production)

```bash
# backend/.env.production 생성
cat > backend/.env.production << 'EOF'
# Cloud SQL 연결 (Cloud SQL Proxy 사용 시)
DATABASE_URL="postgresql://postgres:[비밀번호]@localhost:5432/seocho_events"

# Cloud Run에서 실행 시
DATABASE_URL="postgresql://postgres:[비밀번호]@/seocho_events?host=/cloudsql/[인스턴스 연결 이름]"

PORT=8080
NODE_ENV=production
EOF
```

### Frontend (.env.production)

```bash
# 나중에 deploy-frontend.sh가 자동 생성
NEXT_PUBLIC_API_URL=https://seocho-events-api-xxxxx-an.a.run.app
```

---

## 🚀 배포 실행

### 1️⃣ Backend 배포

```bash
cd backend

# 실행 권한 부여 (최초 1회)
chmod +x deploy-backend.sh
chmod +x migrate-deploy.sh

# 배포 실행
./deploy-backend.sh my-project asia-northeast3 my-project:asia-northeast3:seocho-events-db
```

**예상 시간: 5-8분**

배포 완료 후 API URL 메모:
```
https://seocho-events-api-xxxxx-an.a.run.app
```

### 2️⃣ DB 마이그레이션

```bash
# Cloud SQL Proxy를 통해 마이그레이션
./migrate-deploy.sh my-project:asia-northeast3:seocho-events-db
```

**Seed 데이터 삽입 여부 묻는 메시지:**
```
Seed 데이터를 삽입하시겠습니까? (y/N): y
```

### 3️⃣ Frontend 배포

```bash
cd ../frontend

# 실행 권한 부여
chmod +x deploy-frontend.sh

# Firebase 초기화 (최초 1회만)
firebase init hosting

# 배포 실행
./deploy-frontend.sh https://seocho-events-api-xxxxx-an.a.run.app
```

**예상 시간: 3-5분**

---

## ⏰ 크롤링 스케줄러 설정

### 1️⃣ Functions 설정

```bash
cd functions
npm install

# API URL 설정
firebase functions:config:set api.url="https://[YOUR-API-URL]"
```

### 2️⃣ Functions 배포

```bash
firebase deploy --only functions
```

### 3️⃣ 스케줄 확인

- **실행 시간**: 매일 새벽 2시 (한국 시간)
- **타임존**: Asia/Seoul

### 수동 실행 (테스트)

```bash
# 수동 크롤링 트리거
curl https://asia-northeast3-[PROJECT_ID].cloudfunctions.net/manualCrawl \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)"
```

---

## ✅ 배포 확인

### 1. Backend API 테스트

```bash
# Health check
curl https://[YOUR-API-URL]/health

# 행사 목록 조회
curl https://[YOUR-API-URL]/events
```

### 2. Frontend 접속

```
https://[프로젝트ID].web.app
또는
https://[프로젝트ID].firebaseapp.com
```

### 3. 관리자 페이지

```
https://[프로젝트ID].web.app/admin/data-sources
```

---

## 💰 비용 확인

### 예상 월 비용 (하루 1000명 방문 기준)

| 서비스 | 비용 | 비고 |
|--------|------|------|
| Cloud SQL (db-f1-micro) | $7-10 | 24시간 실행 시 |
| Cloud Run | $2-4 | 요청 기반 과금 |
| Firebase Hosting | 무료 | 10GB/월 한도 |
| Cloud Functions | 무료 | 200만 호출/월 한도 |
| **총계** | **~$9-14/월** | |

### 💡 절약 팁

```bash
# Cloud SQL 자동 정지 (사용하지 않을 때)
gcloud sql instances patch seocho-events-db \
  --activation-policy=NEVER

# 필요할 때만 수동 시작
gcloud sql instances patch seocho-events-db \
  --activation-policy=ALWAYS
```

---

## 🐛 문제 해결

### Cloud Run 배포 실패

```bash
# 로그 확인
gcloud logging read "resource.type=cloud_run_revision" --limit 50 --format json
```

### Cloud SQL 연결 오류

```bash
# Cloud SQL Proxy 다운로드 (Windows)
powershell -Command "Invoke-WebRequest -Uri https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.x64.exe -OutFile cloud-sql-proxy.exe"

# 실행
./cloud-sql-proxy.exe [인스턴스 연결 이름]
```

### Prisma 마이그레이션 실패

```bash
# 스키마 강제 동기화 (주의!)
DATABASE_URL="..." npx prisma db push
```

---

## 📱 모니터링

### 1. Cloud Monitoring 설정

```bash
# Google Cloud Console > Monitoring
# 알림 규칙 추가:
# - Cloud Run CPU > 80%
# - Cloud SQL 연결 > 10개
```

### 2. 크롤링 로그 확인

```bash
# Functions 로그
firebase functions:log

# 또는 Firestore에서 확인
# Collection: crawling_logs
```

---

## 🔒 보안 강화

### 1. API 인증 추가 (선택)

```typescript
// NestJS Guard 추가
@UseGuards(ApiKeyGuard)
```

### 2. CORS 설정

```typescript
// main.ts
app.enableCors({
  origin: ['https://[프로젝트ID].web.app'],
});
```

### 3. Rate Limiting

```bash
# Cloud Armor 추가 (유료)
```

---

## 🎯 다음 단계

### 즉시 할 일
- [ ] 커스텀 도메인 연결
- [ ] SSL 인증서 자동 발급 확인
- [ ] 백업 자동화 설정
- [ ] 모니터링 알림 설정

### 개선 사항
- [ ] CDN 캐싱 최적화
- [ ] 이미지 최적화 (WebP)
- [ ] SEO 메타 태그 추가
- [ ] Analytics 추가

---

## 📞 지원

### 공식 문서
- Firebase: https://firebase.google.com/docs
- Cloud Run: https://cloud.google.com/run/docs
- Cloud SQL: https://cloud.google.com/sql/docs

### 커뮤니티
- Stack Overflow (Firebase 태그)
- Google Cloud Community

---

## ✨ 완료!

축하합니다! 🎉

서초구 행사 플랫폼이 성공적으로 배포되었습니다.

**접속 URL:**
- Frontend: https://[프로젝트ID].web.app
- Backend API: https://[API-URL]

**크롤링:**
- 매일 새벽 2시 자동 실행
- 약 30개 이상의 행사 자동 수집

**문제가 발생하면:**
1. DEPLOYMENT_GUIDE.md 참고
2. 로그 확인 (Cloud Logging)
3. GitHub Issues 생성
