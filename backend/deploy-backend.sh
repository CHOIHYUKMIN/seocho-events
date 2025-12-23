#!/bin/bash

# 🚀 Cloud Run 배포 스크립트
# 사용법: ./deploy-backend.sh [프로젝트ID] [리전] [Cloud SQL 인스턴스명]

set -e  # 에러 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 파라미터 확인
if [ -z "$1" ] || [  -z "$2" ] || [ -z "$3" ]; then
  echo -e "${RED}❌ 사용법: ./deploy-backend.sh [프로젝트ID] [리전] [Cloud SQL 인스턴스명]${NC}"
  echo -e "${YELLOW}예시: ./deploy-backend.sh my-project asia-northeast3 my-project:asia-northeast3:seocho-db${NC}"
  exit 1
fi

PROJECT_ID=$1
REGION=$2
CLOUD_SQL_INSTANCE=$3
SERVICE_NAME="seocho-events-api"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo -e "${GREEN}📦 Cloud Run 배포 시작...${NC}"
echo "프로젝트: $PROJECT_ID"
echo "리전: $REGION"
echo "서비스: $SERVICE_NAME"
echo "Cloud SQL: $CLOUD_SQL_INSTANCE"

# 1. 프로젝트 설정
echo -e "\n${YELLOW}1️⃣ Google Cloud 프로젝트 설정...${NC}"
gcloud config set project $PROJECT_ID

# 2. API 활성화
echo -e "\n${YELLOW}2️⃣ 필요한 API 활성화...${NC}"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com

# 3. Docker 이미지 빌드 및 푸시
echo -e "\n${YELLOW}3️⃣ Docker 이미지 빌드 및 푸시...${NC}"
gcloud builds submit --tag $IMAGE_NAME .

# 4. Cloud Run 배포
echo -e "\n${YELLOW}4️⃣ Cloud Run 배포...${NC}"

# DATABASE_URL 환경 변수 읽기
if [ -f ".env.production" ]; then
  source .env.production
else
  echo -e "${RED}❌ .env.production 파일이 없습니다!${NC}"
  exit 1
fi

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances $CLOUD_SQL_INSTANCE \
  --set-env-vars "DATABASE_URL=$DATABASE_URL,NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080

# 5. 배포 완료
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "\n${GREEN}✅ 배포 완료!${NC}"
echo -e "${GREEN}🔗 서비스 URL: $SERVICE_URL${NC}"
echo -e "\n${YELLOW}💡 다음 단계:${NC}"
echo "1. API 테스트: curl $SERVICE_URL/health"
echo "2. Prisma 마이그레이션: npm run migrate:deploy"
echo "3. 프론트엔드 환경 변수 업데이트: NEXT_PUBLIC_API_URL=$SERVICE_URL"
