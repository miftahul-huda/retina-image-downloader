#!/bin/bash

# Deploy unified service (backend serving frontend)

PROJECT_ID="telkomsel-retail-intelligence"
REGION="asia-southeast2"
SERVICE_NAME="retina-app"
ARTIFACT_REGISTRY="asia-southeast2-docker.pkg.dev"
REPOSITORY="retina-app"

echo "Building frontend..."
cd frontend
npm run build

echo "Copying frontend build to backend..."
rm -rf ../backend/dist
cp -r dist ../backend/

cd ../backend

echo "Building and deploying unified service..."
gcloud builds submit --tag ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}

# Read .env and create env vars string
ENV_VARS=""
while IFS= read -r line || [ -n "$line" ]; do
    if [[ -z "$line" || "$line" =~ ^#.* ]]; then
        continue
    fi
    if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        if [[ "$key" == "PORT" ]]; then
            continue
        fi
        value="${value%\"}"
        value="${value#\"}"
        if [[ -z "$ENV_VARS" ]]; then
            ENV_VARS="${key}=${value}"
        else
            ENV_VARS="${ENV_VARS},${key}=${value}"
        fi
    fi
done < .env

# Deploy unified service
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

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "Unified service deployed at: $SERVICE_URL"
echo ""
echo "Next steps:"
echo "1. Update Google OAuth redirect URI to: ${SERVICE_URL}/api/auth/google/callback"
echo "2. Update FRONTEND_URL in backend .env to: $SERVICE_URL"
echo "3. Redeploy with updated FRONTEND_URL"
