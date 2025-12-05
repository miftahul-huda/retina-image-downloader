#!/bin/bash

# Configuration
PROJECT_ID="telkomsel-retail-intelligence"
REGION="asia-southeast2"
BACKEND_SERVICE="retina-backend"
FRONTEND_SERVICE="retina-frontend"
ARTIFACT_REGISTRY="asia-southeast2-docker.pkg.dev"
REPOSITORY="retina-app"

# Set project
gcloud config set project $PROJECT_ID

echo "Building and deploying backend..."
cd backend

# Build and push backend image to Artifact Registry
gcloud builds submit --tag ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${BACKEND_SERVICE}

# Deploy backend to Cloud Run
gcloud run deploy $BACKEND_SERVICE \
  --image ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${BACKEND_SERVICE} \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

cd ..

echo "Building and deploying frontend..."
cd frontend

# Update frontend .env with backend URL
echo "VITE_API_URL=${BACKEND_URL}/api" > .env.production

# Extract GOOGLE_CLIENT_ID from backend .env and add to frontend .env
GOOGLE_CLIENT_ID=$(grep GOOGLE_CLIENT_ID ../backend/.env | cut -d '=' -f2)
echo "VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> .env.production

# Build and push frontend image to Artifact Registry
gcloud builds submit --tag ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${FRONTEND_SERVICE}

# Deploy frontend to Cloud Run
gcloud run deploy $FRONTEND_SERVICE \
  --image ${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${FRONTEND_SERVICE} \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format 'value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

cd ..

echo ""
echo "Deployment complete!"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update Google OAuth redirect URI to: ${BACKEND_URL}/api/auth/google/callback"
echo "2. Set backend environment variables in Cloud Run console"
echo "3. Update FRONTEND_URL environment variable in backend to: $FRONTEND_URL"
