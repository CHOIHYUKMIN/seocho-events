# 서초구 행사/이벤트 시스템 - 프로젝트 시작 가이드

## 📋 프로젝트 개요

**이름**: 서초구 행사/이벤트 통합 플랫폼  
**목적**: 서초구 주민들이 본인 또는 자녀가 참여할 수 있는 행사를 쉽게 찾고, 원본 페이지에서 상세 정보를 확인할 수 있도록 지원  
**위치**: `d:\DEVELOP\WORKSPACE\seocho-events`

**확장성**: 🌍  
- **현재**: 서초구만 구현
- **미래**: 강남구, 송파구 등 다른 지역 추가 가능한 구조
- **DB 설계**: 다지역 지원 구조로 설계됨 (`DATABASE_SCHEMA.md` 참고)

---

## 🎯 핵심 기능

### 1. 행사 검색 및 필터링 ⭐⭐⭐
- 키워드 검색
- 5가지 이상 필터 (날짜, 카테고리, 연령, 무료/유료, 장소)
- 정렬 (최신순, 날짜순, 인기순)
- 빠른 필터 버튼 (이번 주말, 어린이, 무료 등)

### 2. 원본 페이지 연결 ⭐⭐⭐
- 모든 행사에 원본 URL 포함
- "원본 페이지에서 자세히 보기" 버튼

### 3. 일일 자동 수집 ⭐⭐⭐
- 매일 새벽 2시 배치 실행
- 3개 이상 데이터 소스 (서울 열린데이터, 서초구청, 서초문화재단 등)
- 중복 제거 및 데이터 정규화

---

## 📁 프로젝트 문서

현재 워크스페이스에 다음 문서들이 작성되어 있습니다:

1. **`README.md`** - 📌 **시작은 여기부터!** 프로젝트 개요 및 빠른 시작
2. **`PRODUCT_REQUIREMENTS.md`** - 📋 제품 요구사항 (사용자 스토리, 기능 정의)
3. **`SPRINT_PLAN.md`** - 📅 스프린트 계획 (4개 스프린트, 6주)
4. **`DATABASE_SCHEMA.md`** - 🗄️ **DB 스키마 설계** (다지역 확장 가능)
5. **`SETUP_WITHOUT_DOCKER.md`** - 🔧 Docker 없는 환경 설정 (SQLite)
6. **`SEOCHO_EVENTS_START.md`** - 📖 원본 가이드 (참고용)가이드

---

## 🛠 기술 스택

### Backend
- **Framework**: NestJS 10.x
- **Database**: SQLite (개발) → PostgreSQL (배포)
- **ORM**: Prisma 5.x
- **Cache**: 인메모리 (개발) → Redis (선택사항)
- **Crawling**: Puppeteer, Axios
- **Scheduling**: @nestjs/schedule

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **State**: Zustand (필요시)
- **HTTP**: Axios

### DevOps
- **Package Manager**: pnpm
- **Version Control**: Git
- **Deployment**: Vercel + Supabase (무료)

---

## 🚀 빠른 시작 (Quick Start)

### 1단계: 프로젝트 초기화

```bash
# 1. 백엔드 생성
npx @nestjs/cli new backend
# 패키지 관리자: pnpm 선택

# 2. 프론트엔드 생성
npx create-next-app@latest frontend
# TypeScript: Yes
# Tailwind CSS: Yes
# App Router: Yes
# src/ directory: No
```

### 2단계: Prisma 설정 (SQLite)

```bash
cd backend

# Prisma 설치
pnpm add -D prisma
pnpm add @prisma/client

# Prisma 초기화
npx prisma init
```

**`backend/.env` 파일 생성:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this"
```

**`backend/prisma/schema.prisma` 수정:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### 3단계: 첫 번째 마이그레이션

```bash
# 아직 backend 폴더에 있는 상태에서
npx prisma migrate dev --name init
npx prisma generate
```

### 4단계: 개발 서버 실행

```bash
# 터미널 1: 백엔드
cd backend
pnpm run start:dev
# → http://localhost:3000

# 터미널 2: 프론트엔드
cd frontend
pnpm run dev
# → http://localhost:3001
```

---

## 📅 개발 일정 (6주)

| 주차 | 스프린트 | 주요 작업 | 예상 시간 |
|------|---------|----------|----------|
| 1주 | Sprint 0 | 프로젝트 셋업, DB 스키마 | 3-5일 |
| 2-3주 | Sprint 1 | DB 스키마, Seed 데이터 | 2-3일 |
| 2-3주 | Sprint 2 | 행사 CRUD, 필터링 UI | 6-8일 |
| 4-5주 | Sprint 3 | 크롤링, 일일 배치 | 8-10일 |
| 6주 | Sprint 4 | 최적화, 테스트, 배포 | 5-7일 |

**총 예상 기간**: 4-6주

---

## ✅ MVP 성공 지표

### 기능 완성도
- [ ] 3개 이상 데이터 소스 연동
- [ ] 일일 배치 자동 수집
- [ ] 5가지 이상 필터 기능
- [ ] 원본 페이지 링크 (100%)
- [ ] 모바일 반응형

### 데이터 품질
- [ ] 월 100건 이상 수집
- [ ] 중복률 5% 이하
- [ ] 수집 성공률 90% 이상

### 사용자 경험
- [ ] 페이지 로드 3초 이내
- [ ] 3번 클릭 내 행사 찾기
- [ ] 한눈에 정보 파악 가능

---

## 📖 다음 단계

### 지금 바로 시작하기

1. **Sprint 0 시작** → `SPRINT_PLAN.md` 참고
2. **프로젝트 생성** → 위의 Quick Start 참고
3. **SQLite 설정** → `SETUP_WITHOUT_DOCKER.md` 참고

### 개발 중 참고 문서

- **기능 설계**: `PRODUCT_REQUIREMENTS.md`
- **스프린트**: `SPRINT_PLAN.md`
- **Docker 없는 환경**: `SETUP_WITHOUT_DOCKER.md`

---

## 💡 팁

### Docker 설치 불가?
→ **SQLite + 인메모리 캐시**로 개발 가능! (`SETUP_WITHOUT_DOCKER.md` 참고)

### 데이터베이스 확인하고 싶을 때
```bash
cd backend
npx prisma studio
# → http://localhost:5555에서 UI로 확인
```

### 배포는 어떻게?
→ **Vercel (Frontend) + Supabase (DB)** 무료로 가능!

---

## 🎯 중요한 것부터 하기

### 우선순위 1 (필수)
1. ✅ 프로젝트 셋업
2. ✅ 행사 CRUD API
3. ✅ 행사 목록/상세 UI
4. ✅ 원본 URL 연결 ⭐

### 우선순위 2 (핵심)
1. ✅ 크롤링 시스템
2. ✅ 일일 배치
3. ✅ 필터링 기능

### 우선순위 3 (나중에)
1. 회원 기능
2. 북마크
3. 추천 알고리즘

---

## 📞 도움이 필요하면

각 문서를 참고하거나, 단계별로 진행하면서 막히는 부분이 있으면:
1. `SPRINT_PLAN.md`에서 해당 스프린트 확인
2. `PRODUCT_REQUIREMENTS.md`에서 기능 스펙 확인
3. `SETUP_WITHOUT_DOCKER.md`에서 환경 설정 확인

---

**작성일**: 2025-12-17  
**상태**: 구현 준비 완료 ✅  
**다음 작업**: Sprint 0 시작하기

---

## 📌 체크리스트: 시작 전 확인사항

- [ ] Node.js 18 이상 설치됨
- [ ] pnpm 설치됨 (`npm install -g pnpm`)
- [ ] Git 설치 및 설정됨
- [ ] 코드 에디터 준비 (VS Code 권장)
- [ ] 터미널/PowerShell 사용 가능

✅ **모두 확인했다면 바로 시작하세요!**

```bash
# 첫 번째 명령어
npx @nestjs/cli new backend
```
