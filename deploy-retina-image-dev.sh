#!/bin/bash

# Deploy unified service with service name retina-image
# This deploys backend serving frontend as a single unified service

PROJECT_ID="telkomsel-retail-intelligence"
REGION="asia-southeast2"
SERVICE_NAME="retina-image-dev"
ARTIFACT_REGISTRY="asia-southeast2-docker.pkg.dev"
REPOSITORY="retina-app"

echo "==================================="
echo "Deploying Retina Image Downloader"
echo "Service Name: $SERVICE_NAME"
echo "==================================="

# Build frontend
echo ""
echo "Step 1: Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Frontend build failed"
    exit 1
fi

# Copy frontend build to backend
echo ""
echo "Step 2: Copying frontend build to backend..."
rm -rf ../backend/dist
cp -r dist ../backend/

cd ../backend

# Read .env and create env vars string
echo ""
echo "Step 3: Reading environment variables from .env..."
ENV_VARS=""
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^#.* ]]; then
        continue
    fi
    # Extract key=value
    if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        # Skip PORT as it's reserved by Cloud Run
        if [[ "$key" == "PORT" ]]; then
            continue
        fi
        # Remove quotes from value if present
        value="${value%\"}"
        value="${value#\"}"
        # Add to ENV_VARS
        if [[ -z "$ENV_VARS" ]]; then
            ENV_VARS="${key}=${value}"
        else
            ENV_VARS="${ENV_VARS},${key}=${value}"
        fi
    fi
done < .env

echo ""
echo "Step 4: Building Docker image..."
gcloud builds submit --tag ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}

if [ $? -ne 0 ]; then
    echo "Error: Docker build failed"
    exit 1
fi

# Deploy unified service
echo ""
echo "Step 5: Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME} \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --update-env-vars "$ENV_VARS"

if [ $? -ne 0 ]; then
    echo "Error: Cloud Run deployment failed"
    exit 1
fi

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "==================================="
echo "Deployment Successful! 🎉"
echo "==================================="
echo ""
echo "Service URL: $SERVICE_URL"
echo ""
echo "Next steps:"
echo "1. Update Google OAuth redirect URI to: ${SERVICE_URL}/api/auth/google/callback"
echo "2. Update FRONTEND_URL in backend .env to: $SERVICE_URL"
echo "3. If FRONTEND_URL was changed, redeploy with: ./deploy-retina-image.sh"
echo ""
