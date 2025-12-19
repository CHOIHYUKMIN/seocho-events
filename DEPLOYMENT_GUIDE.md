# Vercel + Supabase 배포 가이드 (완전판)

## ⚠️ 중요: 현재 프로젝트 구조 이해

**현재 프로젝트:**
```
seocho-events/
├── frontend/     # Next.js (프론트엔드)
└── backend/      # NestJS (백엔드 API 서버)
```

## 🎯 배포 전략

### ❌ 문제: Vercel은 NestJS를 직접 배포하기 어려움

**Vercel의 제약:**
- Serverless Functions만 지원
- NestJS 전체를 그대로 배포 불가능
- 각 API를 Serverless Function으로 변환 필요 (복잡함)

---

## ✅ 추천 솔루션 #1: Vercel + Railway + Supabase

### 📦 배포 구조

**Frontend (Next.js)**
- **Vercel** (무료)
  - https://your-app.vercel.app
  - 자동 배포

**Backend (NestJS)**
- **Railway** (무료 $5 크레딧/월)
  - https://your-api.up.railway.app
  - NestJS 그대로 배포 가능!
  - 자동 SSL

**Database**
- **Supabase** (무료)
  - PostgreSQL
  - 500MB

### 💰 비용
- Frontend: 무료 (Vercel)
- Backend: 거의 무료 (Railway $5/월 크레딧)
- Database: 무료 (Supabase)

**총 비용: 무료!** (트래픽 적을 때)

---

## ✅ 추천 솔루션 #2: Vercel + Railway (올인원)

### 📦 배포 구조

**Frontend**
- **Vercel** (무료)

**Backend + Database**
- **Railway** (무료 $5 크레딧/월)
  - NestJS 배포
  - PostgreSQL 제공
  - 하나의 플랫폼에서 관리

### 💰 비용
- Frontend: 무료
- Backend + DB: 거의 무료

**총 비용: 무료!**

---

## 🚀 배포 단계 (솔루션 #2 추천)

### Step 1: Railway 설정

1. **Railway 가입**
   ```
   https://railway.app
   GitHub으로 로그인
   ```

2. **프로젝트 생성**
   ```
   New Project → Deploy from GitHub
   → seocho-events 선택
   → backend 폴더 선택
   ```

3. **PostgreSQL 추가**
   ```
   Add New → Database → PostgreSQL
   → 자동으로 DATABASE_URL 생성됨
   ```

4. **환경변수 설정**
   ```
   DATABASE_URL: [자동 생성됨]
   NODE_ENV: production
   PORT: 3000
   ```

5. **배포!**
   ```
   Git push → 자동 배포
   ```

### Step 2: Prisma 마이그레이션

```bash
# 로컬에서 실행
cd backend

# schema.prisma 수정
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 마이그레이션 생성
npx prisma migrate dev --name init

# Railway에 배포 (자동으로 migrate 실행)
git add .
git commit -m "PostgreSQL migration"
git push
```

### Step 3: Vercel 설정

1. **Vercel 가입**
   ```
   https://vercel.com
   GitHub으로 로그인
   ```

2. **프로젝트 생성**
   ```
   Import Project
   → seocho-events
   → frontend 폴더 선택
   ```

3. **환경변수 설정**
   ```
   NEXT_PUBLIC_API_URL: https://your-api.up.railway.app
   ```

4. **배포!**
   ```
   자동 배포 시작
   ```

---

## 📊 최종 구조

```
사용자
  ↓
Vercel (Frontend)
https://seocho-events.vercel.app
  ↓ API 호출
Railway (Backend + DB)
https://seocho-events-api.up.railway.app
```

---

## 🎯 결론

**네, Vercel로 호스팅 가능합니다!**

**정확한 구조:**
- **프론트엔드**: Vercel ✅
- **백엔드**: Railway (Vercel은 NestJS 직접 배포 어려움)
- **데이터베이스**: Railway PostgreSQL 또는 Supabase

**모두 무료입니다!** (트래픽 적을 때)

---

## 🔥 지금 바로 배포할까요?

1. Railway 계정만 만들면 됩니다
2. GitHub 연동하면 자동 배포
3. 5분이면 완료!

**진행하시겠습니까?**
