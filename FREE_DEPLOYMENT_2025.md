# 🚀 2025년 무료 배포 가이드 (서초구 이벤트 시스템)

**최종 업데이트**: 2025-12-23  
**프로젝트**: Seocho Events (NestJS + Next.js + PostgreSQL)

---

## 📊 추천 무료 배포 조합 (2025년 최신)

### 🏆 최고의 무료 조합 (Best Free Stack)

| 구성 요소 | 서비스 | 무료 제공량 | 예상 비용 |
|---------|--------|------------|----------|
| **Frontend** | Vercel | 100 GB 대역폭/월 | **무료** |
| **Backend** | Render | 750시간/월 (요청시 활성화) | **무료** |
| **Database** | Neon PostgreSQL | 0.5 GB 저장소, 100 compute hours | **무료** |
| **합계** | - | - | **$0/월** |

---

## 🎯 서비스별 특징 비교

### Frontend: Vercel (추천 ⭐)

**무료 제공량**:
- 100 GB 대역폭/월
- 빌드 시간 6,000분/월
- 무료 SSL 인증서
- 자동 CI/CD (Git 연결)
- 무료 커스텀 도메인
- 100 deployments/일

**장점**:
✅ Next.js를 만든 회사 (최고의 호환성)  
✅ 무제한 프로젝트  
✅ Edge Network (전세계 CDN)  
✅ 자동 프리뷰 배포  
✅ 환경 변수 관리

**단점**:
❌ 서버리스 함수는 제한적 (10초 타임아웃)

**대안**:
- **Netlify**: 100 GB 대역폭, 300 빌드 분/월
- **Cloudflare Pages**: 무제한 대역폭 (단! 빌드 500회/월)

---

### Backend: Render (추천 ⭐)

**무료 제공량 (2025)**:
- **Web Services**: 750시간/월 (모든 무료 서비스 합산)
- 512 MB RAM
- 무료 SSL
- 무료 PostgreSQL 데이터베이스 1개 (90일 후 삭제)
- 자동 배포 (Git 연결)

**중요 제약사항**:
⚠️ **비활성 시 자동 중지** (요청 시 재시작, 약 30초 소요)  
⚠️ 750시간 제한 (한 달 = 720시간이므로 1개 서비스만 24/7 가능)  
⚠️ 90일 후 무료 DB 삭제 (외부 DB 사용 권장)

**장점**:
✅ Docker 지원  
✅ NestJS 완벽 지원  
✅ 환경 변수 관리  
✅ 로그 조회 가능  
✅ Cron Job 무료 (백그라운드 작업)

**단점**:
❌ Cold start 지연 (30초)  
❌ 월 750시간 제한

**대안**:
- **Railway**: $5 크레딧 (30일), 이후 유료
- **Fly.io**: 초소량 무료 (신규 계정은 사실상 유료)
- **Oracle Cloud**: 완전 무료 (설정 복잡)

---

### Database: Neon (추천 ⭐)

**무료 제공량 (2025)**:
- **프로젝트**: 100개
- **저장소**: 0.5 GB/프로젝트 (최대 10개까지 합산 5 GB)
- **Compute**: 100시간/월 (0.25 CU = 1 vCPU + 4 GB RAM)
- **Auto-scaling**: 최대 2 CU까지 자동 확장
- **Scale to Zero**: 5분 비활성 후 자동 중지 ✅
- **Point-in-Time Recovery**: 6시간
- **Egress**: 5 GB/월

**장점**:
✅ 진짜 PostgreSQL (완전 호환)  
✅ Serverless (사용한 만큼만 계산)  
✅ Scale to Zero (idle 시 비용 없음)  
✅ 브랜치 기능 (Dev/Staging/Prod)  
✅ 무제한 프로젝트  
✅ 90+ PostgreSQL Extensions

**단점**:
❌ 0.5 GB 저장소 제한 (대규모 프로젝트에는 부족)

**대안**:
- **Supabase**: 500 MB, 2개 프로젝트, 7일 후 자동 일시정지
- **PlanetScale**: 무료 티어 폐지됨 (2024년 4월부터)

---

## 🛠 배포 단계별 가이드

### 1️⃣ Database 배포 (Neon)

#### 1-1. Neon 계정 생성 및 DB 생성

```bash
# 1. https://neon.tech 접속 후 가입 (GitHub로 간편 가입)
# 2. 새 프로젝트 생성
#    - 프로젝트명: seocho-events
#    - 리전: AWS ap-southeast-1 (싱가포르) - 가장 가까운 리전
#    - PostgreSQL 버전: 16 (최신)
```

#### 1-2. 연결 문자열 복사

Neon 대시보드에서 다음 형식의 URL을 복사:
```
postgresql://username:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

#### 1-3. Prisma 마이그레이션

```bash
cd backend

# .env 파일 생성
echo "DATABASE_URL=<Neon 연결 문자열>" > .env

# Prisma 마이그레이션 실행
npx prisma migrate deploy

# Seed 데이터 삽입
npx prisma db seed

# 확인
npx prisma studio
```

---

### 2️⃣ Backend 배포 (Render)

#### 2-1. Render 계정 생성

```bash
# 1. https://render.com 접속 후 가입 (GitHub로 간편 가입)
# 2. GitHub 저장소 연결
```

#### 2-2. Web Service 생성

**Dashboard → New → Web Service**

**설정**:
- **Name**: `seocho-events-api`
- **Region**: Singapore (가장 가까운 리전)
- **Branch**: `master` (또는 `main`)
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start:prod`
- **Instance Type**: Free

#### 2-3. 환경 변수 설정

**Environment Variables 탭**:
```
DATABASE_URL = <Neon 연결 문자열>
PORT = 3000
NODE_ENV = production
```

#### 2-4. 배포 확인

배포 완료 후 제공되는 URL 복사:
```
https://seocho-events-api.onrender.com
```

**API 테스트**:
```bash
curl https://seocho-events-api.onrender.com/events
```

---

### 3️⃣ Frontend 배포 (Vercel)

#### 3-1. Vercel 계정 생성

```bash
# 1. https://vercel.com 접속 후 가입 (GitHub로 간편 가입)
# 2. GitHub 저장소 연결
```

#### 3-2. 프로젝트 설정

**Import Git Repository**:
- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (자동)
- **Output Directory**: `.next` (자동)
- **Install Command**: `npm install` (자동)

#### 3-3. 환경 변수 설정

**Settings → Environment Variables**:
```
NEXT_PUBLIC_API_URL = https://seocho-events-api.onrender.com
```

#### 3-4. 배포 및 확인

배포 완료 후 제공되는 URL:
```
https://seocho-events.vercel.app
```

**브라우저에서 확인**:
1. 홈페이지 접속
2. 행사 목록 확인
3. 행사 상세 확인
4. 필터링 테스트

---

## ⚙️ 크롤링 스케줄러 설정

### Render Cron Job (무료)

#### 1. Cron Job 생성

**Dashboard → New → Cron Job**

**설정**:
- **Name**: `daily-crawler`
- **Region**: Singapore
- **Schedule**: `0 2 * * *` (매일 새벽 2시 KST = 17시 UTC)
- **Command**: `curl -X POST https://seocho-events-api.onrender.com/data-sources/collect`
- **Instance Type**: Free

---

## 💰 비용 분석 (2025년)

### 무료 티어로 가능한 트래픽

| 항목 | 제한 | 예상 사용량 (월 1,000명) |
|------|------|------------------------|
| **Frontend (Vercel)** | 100 GB | ~5 GB |
| **Backend (Render)** | 750시간 | 720시간 (24/7) |
| **Database (Neon)** | 0.5 GB + 100 compute hours | 0.2 GB + 50시간 |

**결론**: **월 1,000명까지 완전 무료** ✅

### 트래픽이 늘어나면?

**월 10,000명 예상 비용**:
- Vercel: 무료 (100 GB 이내)
- Render: ~$7 (Starter 플랜)
- Neon: ~$19 (Launch 플랜 - 3 GB 저장소)
- **합계**: ~$26/월

---

## 🔧 배포 후 체크리스트

### Backend (Render)
- [ ] 서비스 정상 동작 확인
- [ ] API 엔드포인트 테스트 (`/events`, `/categories`, `/districts`)
- [ ] 크롤링 수동 실행 (`POST /data-sources/collect`)
- [ ] 로그 확인

### Frontend (Vercel)
- [ ] 홈페이지 로딩 확인
- [ ] 행사 목록 표시 확인
- [ ] 행사 상세 확인
- [ ] 필터링 작동 확인
- [ ] 반응형 디자인 확인 (모바일/데스크톱)

### Database (Neon)
- [ ] Prisma Studio로 데이터 확인
- [ ] Seed 데이터 존재 확인
- [ ] 연결 안정성 확인

### Crawler
- [ ] Cron Job 설정 확인
- [ ] 수동 크롤링 테스트
- [ ] 수집 로그 확인

---

## 🐛 트러블슈팅

### 1. Render: Cold Start 지연

**문제**: 비활성 후 첫 요청이 느림 (30초+)

**해결책**:
```bash
# 1. UptimeRobot 무료 모니터링 (5분마다 ping)
# https://uptimerobot.com

# 2. Cron Job으로 주기적 ping
# Render Cron: */5 * * * * (5분마다)
curl https://seocho-events-api.onrender.com/health
```

### 2. Neon: Compute Hours 부족

**문제**: 100시간 초과

**해결책**:
- Scale to Zero 확인 (자동 중지 설정)
- 불필요한 연결 끊기
- Connection Pooling 사용 (Prisma)

### 3. Vercel: Build 실패

**문제**: Next.js 빌드 오류

**해결책**:
```bash
# 로컬에서 빌드 테스트
cd frontend
npm run build

# 환경 변수 확인
echo $NEXT_PUBLIC_API_URL
```

---

## 📚 추가 참고 자료

### 공식 문서
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)

### 가이드
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [NestJS on Render](https://render.com/docs/deploy-nestjs)
- [Prisma with Neon](https://neon.tech/docs/guides/prisma)

---

## 🎯 다음 단계

### 즉시 배포 가능
1. ✅ Neon에서 PostgreSQL 생성
2. ✅ Render에 Backend 배포
3. ✅ Vercel에 Frontend 배포
4. ✅ Cron Job 설정

### 선택 사항
- [ ] 커스텀 도메인 연결 (Vercel 무료)
- [ ] 환경별 분리 (Dev/Staging/Prod)
- [ ] 모니터링 설정 (UptimeRobot)
- [ ] Google Analytics 연동

---

## 💡 팁

### 무료 유지 비법
1. **Neon**: Scale to Zero 활성화 필수
2. **Render**: 750시간 = 1개 서비스만 24/7 가능
3. **Vercel**: 100 GB 넘지 않도록 이미지 최적화

### 업그레이드 시점
- 월 10,000명 이상 트래픽
- 데이터베이스 0.5 GB 초과
- Cold Start 지연 해결 필요

---

**작성자**: Antigravity AI  
**작성일**: 2025-12-23  
**상태**: 즉시 배포 가능 ✅
