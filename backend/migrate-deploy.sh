#!/bin/bash

# 🗄️ Prisma 마이그레이션 배포 스크립트
# Cloud SQL에 마이그레이션 적용

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
  echo -e "${RED}❌ 사용법: ./migrate-deploy.sh [Cloud SQL 인스턴스명]${NC}"
  echo -e "${YELLOW}예시: ./migrate-deploy.sh my-project:asia-northeast3:seocho-db${NC}"
  exit 1
fi

CLOUD_SQL_INSTANCE=$1

echo -e "${GREEN}🗄️ Prisma 마이그레이션 배포 시작...${NC}"

# 1. Cloud SQL Proxy 다운로드 (없는 경우)
if [ ! -f "./cloud-sql-proxy" ]; then
  echo -e "${YELLOW}1️⃣ Cloud SQL Proxy 다운로드...${NC}"
  curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
  chmod +x cloud-sql-proxy
fi

# 2. Cloud SQL Proxy 시작 (백그라운드)
echo -e "\n${YELLOW}2️⃣ Cloud SQL Proxy 시작...${NC}"
./cloud-sql-proxy $CLOUD_SQL_INSTANCE &
PROXY_PID=$!
echo "Proxy PID: $PROXY_PID"

# 3초 대기
sleep 3

# 3. 마이그레이션 실행
echo -e "\n${YELLOW}3️⃣ 마이그레이션 실행...${NC}"
if [ -f ".env.production" ]; then
  source .env.production
  npx prisma migrate deploy
else
  echo -e "${RED}❌ .env.production 파일이 없습니다!${NC}"
  kill $PROXY_PID
  exit 1
fi

# 4. Seed 데이터 삽입 (선택)
read -p "Seed 데이터를 삽입하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "\n${YELLOW}4️⃣ Seed 데이터 삽입...${NC}"
  npx prisma db seed
fi

# 5. Cloud SQL Proxy 종료
echo -e "\n${YELLOW}5️⃣ Cloud SQL Proxy 종료...${NC}"
kill $PROXY_PID

echo -e "\n${GREEN}✅ 마이그레이션 완료!${NC}"
