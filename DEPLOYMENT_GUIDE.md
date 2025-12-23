# 🚀 Firebase 배포 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [Firebase 프로젝트 설정](#firebase-프로젝트-설정)
3. [Cloud SQL 설정](#cloud-sql-설정)
4. [Backend 배포 (Cloud Run)](#backend-배포-cloud-run)
5. [Frontend 배포 (Firebase Hosting)](#frontend-배포-firebase-hosting)
6. [크롤링 스케줄러 설정](#크롤링-스케줄러-설정)
7. [환경 변수 설정](#환경-변수-설정)
8. [비용 최적화](#비용-최적화)

---

## 사전 준비

### 필요한 도구 설치

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Google Cloud SDK 설치
# https://cloud.google.com/sdk/docs/install

# Docker 설치 (Cloud Run용)
# https://docs.docker.com/get-docker/
```

### 계정 설정

1. **Google Cloud Console**: https://console.cloud.google.com/
2. **Firebase Console**: https://console.firebase.google.com/

---

## Firebase 프로젝트 설정

### 1. Firebase 프로젝트 생성

```bash
# Firebase 로그인
firebase login

# 프로젝트 초기화
cd d:\DEVELOP\WORKSPACE\seocho-events
firebase init
```

**선택 항목:**
- ✅ Hosting
- ✅ Functions (나중에 크롤링용)

### 2. Google Cloud 프로젝트 연결

Firebase 프로젝트는 자동으로 Google Cloud 프로젝트를 생성합니다.
프로젝트 ID를 메모해두세요.

---

## Cloud SQL 설정

### 1. Cloud SQL 인스턴스 생성

```bash
# Google Cloud Console에서:
# 1. SQL > 인스턴스 만들기
# 2. PostgreSQL 선택
# 3. 인스턴스 ID: seocho-events-db
# 4. 비밀번호 설정
# 5. 리전: asia-northeast3 (서울)
# 6. 머신 유형: 공유 코어 (db-f1-micro) - 가장 저렴
```

### 2. 데이터베이스 생성

```sql
-- Cloud SQL 콘솔에서 실행
CREATE DATABASE seocho_events;
```

### 3. 연결 정보 확인

```
호스트: [INSTANCE_CONNECTION_NAME]
예: project-id:asia-northeast3:seocho-events-db
```

---

## Backend 배포 (Cloud Run)

### 1. Dockerfile 생성

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Dependencies 복사 및 설치
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 포트 노출
EXPOSE 8080

# 실행
CMD ["npm", "run", "start:prod"]
```

### 2. 환경 변수 파일 준비

```bash
# backend/.env.production (Git에 커밋하지 말 것!)
DATABASE_URL="postgresql://USER:PASSWORD@/seocho_events?host=/cloudsql/INSTANCE_CONNECTION_NAME"
PORT=8080
NODE_ENV=production
```

### 3. Cloud Run 배포 스크립트

```bash
# backend/deploy.sh
#!/bin/bash

PROJECT_ID="your-project-id"
REGION="asia-northeast3"
SERVICE_NAME="seocho-events-api"

# Docker 이미지 빌드
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Cloud Run 배포
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances INSTANCE_CONNECTION_NAME \
  --set-env-vars DATABASE_URL="YOUR_DATABASE_URL"
```

### 4. Prisma 마이그레이션

```bash
# 로컬에서 Cloud SQL에 연결하여 마이그레이션
# Cloud SQL Proxy 사용
./cloud_sql_proxy -instances=INSTANCE_CONNECTION_NAME=tcp:5432

# 다른 터미널에서
cd backend
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/seocho_events" npx prisma migrate deploy
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/seocho_events" npx prisma db seed
```

---

## Frontend 배포 (Firebase Hosting)

### 1. Next.js 설정 수정

```javascript
// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export
  // 또는 Firebase functions 사용 시 주석 처리
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
```

### 2. Firebase 설정

```json
// firebase.json
{
  "hosting": {
    "public": "frontend/out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 3. 배포 스크립트

```bash
# frontend/deploy.sh
#!/bin/bash

# 환경 변수 설정
export NEXT_PUBLIC_API_URL="https://your-cloud-run-url"

# 빌드
npm run build

# Firebase 배포
firebase deploy --only hosting
```

---

## 크롤링 스케줄러 설정

### 1. Cloud Function 생성

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import axios from 'axios';

export const scheduledCrawler = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 2 * * *')  // 매일 새벽 2시
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    const API_URL = process.env.API_URL || 'https://your-cloud-run-url';
    
    try {
      const response = await axios.post(`${API_URL}/data-sources/collect`);
      console.log('크롤링 완료:', response.data);
      return null;
    } catch (error) {
      console.error('크롤링 실패:', error);
      throw error;
    }
  });
```

### 2. Cloud Functions 배포

```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 환경 변수 설정

### Backend (Cloud Run)

```bash
# Secret Manager 사용 권장
gcloud secrets create DATABASE_URL --data-file=database-url.txt

# Cloud Run에서 시크릿 사용
gcloud run services update seocho-events-api \
  --update-secrets=DATABASE_URL=DATABASE_URL:latest
```

### Frontend (Firebase Hosting)

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://seocho-events-api-xxxxx-an.a.run.app
```

---

## 비용 최적화

### 📊 예상 월 비용 (트래픽 1000명/일 기준)

| 서비스 | 비용 |
|--------|------|
| Firebase Hosting | 무료 (10GB/월) |
| Cloud Run | ~$3 (요청 기반) |
| Cloud SQL | $7-10 (db-f1-micro) |
| Cloud Functions | 무료 (200만 호출/월) |
| **총계** | **~$10-13/월** |

### 💰 절약 팁

1. **Cloud SQL 최적화**
   ```bash
   # 개발 환경에서만 사용하고 자동 정지
   gcloud sql instances patch seocho-events-db \
     --activation-policy=ALWAYS  # 또는 NEVER (수동 시작)
   ```

2. **Cloud Run 최소 인스턴스 0**
   ```bash
   # 요청이 없을 때 완전히 종료
   --min-instances=0
   ```

3. **무료 티어 활용**
   - Firebase: 10GB 호스팅
   - Cloud Run: 200만 요청/월
   - Cloud Functions: 200만 호출/월

---

## 🔍 배포 체크리스트

### Backend
- [ ] Cloud SQL 인스턴스 생성
- [ ] 데이터베이스 생성
- [ ] Prisma 마이그레이션 실행
- [ ] Seed 데이터 삽입
- [ ] Dockerfile 작성
- [ ] Cloud Run 배포
- [ ] 환경 변수 설정
- [ ] API 테스트

### Frontend
- [ ] Next.js static export 설정
- [ ] API URL 환경 변수 설정
- [ ] Firebase 프로젝트 초기화
- [ ] 빌드 테스트
- [ ] Firebase Hosting 배포
- [ ] 도메인 연결 (선택)

### 크롤링
- [ ] Cloud Functions 작성
- [ ] Cloud Scheduler 설정
- [ ] 크롤링 테스트
- [ ] 로그 모니터링

---

## 🐛 트러블슈팅

### Cloud SQL 연결 오류

```bash
# Cloud SQL Proxy 사용
./cloud_sql_proxy -instances=INSTANCE_CONNECTION_NAME=tcp:5432
```

### Prisma 마이그레이션 실패

```bash
# 스키마 강제 동기화 (개발 환경만!)
npx prisma db push
```

### Cloud Run 메모리 부족

```bash
# 메모리 증가
gcloud run services update seocho-events-api --memory=512Mi
```

---

## 📚 참고 자료

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🎯 다음 단계

1. **도메인 연결**: Firebase Hosting에 커스텀 도메인 추가
2. **모니터링**: Cloud Monitoring으로 성능 추적
3. **백업**: Cloud SQL 자동 백업 설정
4. **CDN**: Firebase CDN 자동 활성화
5. **보안**: API Key 관리, CORS 설정
