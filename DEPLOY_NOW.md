# Vercel + Railway 배포 실행 가이드

## 🎯 선택: Vercel + Railway (빠르고 쉬운 배포!)

**예상 시간: 30분**  
**비용: 무료**

---

## 📋 준비 단계

### 1. PostgreSQL용 Prisma Schema 수정

**파일**: `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // sqlite → postgresql 변경
  url      = env("DATABASE_URL")
}

// 나머지 모델들은 그대로 유지
```

### 2. package.json에 빌드 스크립트 추가 (이미 있음)

**파일**: `backend/package.json`

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "prisma:deploy": "npx prisma migrate deploy"
  }
}
```

---

## 🚀 Railway 배포 (Backend + Database)

### Step 1: Railway 계정 생성

1. https://railway.app 접속
2. **"Login with GitHub"** 클릭
3. GitHub 계정으로 로그인
4. Railway 허가

### Step 2: 프로젝트 생성

1. **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. **seocho-events** 저장소 선택
4. **Root Directory**: `backend` 입력
5. **"Deploy Now"** 클릭

### Step 3: PostgreSQL 추가

1. 프로젝트에서 **"+ New"** 클릭
2. **"Database"** → **"Add PostgreSQL"** 선택
3. 자동으로 `DATABASE_URL` 생성됨 ✅

### Step 4: 환경변수 설정

Railway 프로젝트 설정에서:

```bash
DATABASE_URL=[자동 생성됨]
NODE_ENV=production
PORT=${PORT}
```

### Step 5: 빌드 설정

**Railway 설정 (Settings)**:

```
Build Command: npm run build
Start Command: npm run start:prod
```

### Step 6: 배포 대기

- 자동으로 빌드 시작
- 5-10분 소요
- 완료되면 URL 생성: `https://[프로젝트명].up.railway.app`

---

## 🌐 Vercel 배포 (Frontend)

### Step 1: Vercel 계정 생성

1. https://vercel.com 접속
2. **"Sign Up with GitHub"** 클릭
3. GitHub 계정으로 로그인

### Step 2: 프로젝트 Import

1. **"Add New..."** → **"Project"** 클릭
2. **seocho-events** 저장소 선택
3. **"Import"** 클릭

### Step 3: 프로젝트 설정

**Framework Preset**: Next.js ✅  
**Root Directory**: `frontend`  

### Step 4: 환경변수 설정

```bash
NEXT_PUBLIC_API_URL=https://[Railway URL].up.railway.app
```

**예시**:
```bash
NEXT_PUBLIC_API_URL=https://seocho-events-backend.up.railway.app
```

### Step 5: 배포 시작

1. **"Deploy"** 클릭
2. 3-5분 대기
3. 완료! URL: `https://[프로젝트명].vercel.app`

---

## ✅ 배포 완료 체크리스트

### Backend (Railway)
- [ ] PostgreSQL 데이터베이스 생성됨
- [ ] 환경변수 설정됨
- [ ] 빌드 성공
- [ ] API 테스트: `https://[Railway URL]/events`

### Frontend (Vercel)
- [ ] 환경변수 설정됨 (NEXT_PUBLIC_API_URL)
- [ ] 빌드 성공
- [ ] 웹사이트 접속: `https://[Vercel URL]`
- [ ] 행사 목록 표시됨

---

## 🔧 마이그레이션 실행

Railway 터미널에서:

```bash
npx prisma migrate deploy
npx prisma db seed
```

또는 Railway CLI 설치:

```bash
npm i -g @railway/cli
railway login
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

##🎯 최종 결과

**Frontend**: https://seocho-events.vercel.app  
**Backend API**: https://seocho-events-backend.up.railway.app  
**Database**: Railway PostgreSQL

**모두 무료!** ✅

---

## ❓ 문제 해결

### Railway 빌드 실패 시

1. `package.json`에 `build` 스크립트 확인
2. Node 버전 확인: `.nvmrc` 또는 `engines` 설정
3. Railway 로그 확인

### Vercel 환경변수 안 먹힐 때

1. 환경변수 저장 후 **재배포** 필요
2. `NEXT_PUBLIC_` 접두사 확인

### CORS 에러

backend의 `main.ts`에서 CORS 설정 확인:

```typescript
app.enableCors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3001'],
  credentials: true,
});
```

---

## 🚀 지금 바로 시작!

1. Railway 가입 → https://railway.app
2. Vercel 가입 → https://vercel.com
3. 위 단계대로 진행
4. 30분 후 배포 완료! 🎉
