#!/bin/bash

# 🎨 Frontend 배포 스크립트 (Firebase Hosting)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
  echo -e "${RED}❌ 사용법: ./deploy-frontend.sh [API_URL]${NC}"
  echo -e "${YELLOW}예시: ./deploy-frontend.sh https://seocho-events-api-xxxxx-an.a.run.app${NC}"
  exit 1
fi

API_URL=$1

echo -e "${GREEN}🎨 Frontend 배포 시작...${NC}"
echo "API URL: $API_URL"

# 1. .env.production 생성
echo -e "\n${YELLOW}1️⃣ 환경 변수 설정...${NC}"
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=$API_URL
EOF

# 2. 의존성 설치
echo -e "\n${YELLOW}2️⃣ 의존성 설치...${NC}"
npm install

# 3. Next.js 빌드 (static export)
echo -e "\n${YELLOW}3️⃣ Next.js 빌드...${NC}"
npm run build

# 4. Firebase 배포
echo -e "\n${YELLOW}4️⃣ Firebase Hosting 배포...${NC}"
firebase deploy --only hosting

# 5. 배포 완료
echo -e "\n${GREEN}✅ 배포 완료!${NC}"
echo -e "${YELLOW}💡 Firebase Console에서 URL 확인:${NC}"
echo "https://console.firebase.google.com/project/_/hosting"
