# Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud SDK** installed and authenticated
2. **Docker** installed locally
3. **Project access** to `telkomsel-retail-intelligence`
4. **Required APIs enabled**:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

## Environment Variables for Backend

Set these in Cloud Run console after deployment:

```bash
# Database
DB_HOST=your-cloud-sql-connection-or-ip
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=retina_downloader
DB_DIALECT=postgres

# Google Cloud
GCLOUD_BUCKET=retail-intelligence-bucket

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Session
COOKIE_KEY=your-production-secret-key

# CORS - Will be updated after frontend deployment
FRONTEND_URL=https://retina-frontend-xxxxx-as.a.run.app

# Port (automatically set by Cloud Run)
PORT=8080
```

## Deployment Steps

### Option 1: Using Deployment Script (Recommended)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Manual Deployment

#### 1. Deploy Backend

```bash
# Set project
gcloud config set project telkomsel-retail-intelligence

# Build and deploy
cd backend
gcloud builds submit --tag gcr.io/telkomsel-retail-intelligence/retina-backend

gcloud run deploy retina-backend \
  --image gcr.io/telkomsel-retail-intelligence/retina-backend \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --timeout 300
```

#### 2. Set Backend Environment Variables

Go to Cloud Run console → retina-backend → Edit & Deploy New Revision → Variables & Secrets

Add all environment variables listed above.

#### 3. Deploy Frontend

```bash
cd ../frontend

# Update .env.production with backend URL
echo "VITE_API_URL=https://retina-backend-xxxxx-as.a.run.app/api" > .env.production

# Build and deploy
gcloud builds submit --tag gcr.io/telkomsel-retail-intelligence/retina-frontend

gcloud run deploy retina-frontend \
  --image gcr.io/telkomsel-retail-intelligence/retina-frontend \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi
```

#### 4. Update Backend FRONTEND_URL

Update the `FRONTEND_URL` environment variable in backend service with the frontend URL.

#### 5. Update Google OAuth

Add the following to Google Cloud Console OAuth settings:
- Authorized redirect URI: `https://retina-backend-xxxxx-as.a.run.app/api/auth/google/callback`

## Post-Deployment Configuration

### 1. Database Connection

If using Cloud SQL:
```bash
# Add Cloud SQL connection
gcloud run services update retina-backend \
  --add-cloudsql-instances telkomsel-retail-intelligence:asia-southeast2:your-instance
```

### 2. Service Account

For GCS access, ensure the Cloud Run service account has:
- Storage Object Viewer
- Storage Object Creator

### 3. Secrets Management (Optional)

Use Secret Manager for sensitive data:
```bash
# Create secrets
echo -n "your-secret" | gcloud secrets create db-password --data-file=-

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secret
gcloud run services update retina-backend \
  --update-secrets=DB_PASS=db-password:latest
```

## Monitoring

### View Logs
```bash
# Backend logs
gcloud run services logs read retina-backend --region asia-southeast2

# Frontend logs
gcloud run services logs read retina-frontend --region asia-southeast2
```

### Check Service Status
```bash
gcloud run services describe retina-backend --region asia-southeast2
gcloud run services describe retina-frontend --region asia-southeast2
```

## Updating Services

### Update Backend
```bash
cd backend
gcloud builds submit --tag gcr.io/telkomsel-retail-intelligence/retina-backend
gcloud run deploy retina-backend --image gcr.io/telkomsel-retail-intelligence/retina-backend --region asia-southeast2
```

### Update Frontend
```bash
cd frontend
gcloud builds submit --tag gcr.io/telkomsel-retail-intelligence/retina-frontend
gcloud run deploy retina-frontend --image gcr.io/telkomsel-retail-intelligence/retina-frontend --region asia-southeast2
```

## Troubleshooting

### Container fails to start
- Check logs for errors
- Verify PORT=8080 is set
- Ensure all required environment variables are set

### Database connection fails
- Verify Cloud SQL connection string
- Check service account permissions
- Ensure database credentials are correct

### OAuth redirect fails
- Verify redirect URI in Google Console
- Check FRONTEND_URL is set correctly in backend
- Ensure CORS is configured properly

## Cost Optimization

- Set min-instances to 0 for auto-scaling to zero
- Use smaller memory allocations if possible
- Set appropriate max-instances based on load
- Enable CPU throttling when not serving requests

## Security

- Use Secret Manager for sensitive data
- Enable VPC connector for private database access
- Implement proper CORS policies
- Use service-to-service authentication if needed
