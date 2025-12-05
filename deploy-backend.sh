#!/bin/bash

# Deploy backend with environment variables from .env file

PROJECT_ID="telkomsel-retail-intelligence"
REGION="asia-southeast2"
BACKEND_SERVICE="retina-backend"
ARTIFACT_REGISTRY="asia-southeast2-docker.pkg.dev"
REPOSITORY="retina-app"
FRONTEND_URL="https://retina-frontend-6hzeuxd5qa-et.a.run.app"

# Read .env file and convert to Cloud Run format
ENV_VARS=""

cd backend

# Read each line from .env
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

# Add FRONTEND_URL
ENV_VARS="${ENV_VARS},FRONTEND_URL=${FRONTEND_URL}"

cd ..

echo "Deploying backend with environment variables..."

# Deploy backend
gcloud run deploy $BACKEND_SERVICE \
  --image ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${BACKEND_SERVICE} \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --update-env-vars "$ENV_VARS"

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)')

echo ""
echo "Backend deployed at: $BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Update Google OAuth redirect URI to: ${BACKEND_URL}/api/auth/google/callback"
echo "2. Update frontend to use backend URL: ${BACKEND_URL}/api"
