# Retina Image Downloader

A web application for downloading and managing retail intelligence images from Telkomsel's retail network. The application provides filtering, bulk download, automated delivery features, and a sophisticated queue system for handling multiple concurrent users.

![Telkomsel](https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Telkomsel_2021_icon.svg/200px-Telkomsel_2021_icon.svg.png)

## ✨ Features

### Core Features
- **Google OAuth Authentication** - Secure login using Google accounts with profile photos
- **Advanced Filtering** - Filter images by date range, area, region, city, and image category
- **Image Gallery** - Grid view with thumbnails and detailed preview modal
- **Bulk Download** - Download multiple images organized in ZIP files by location hierarchy
- **Google Drive Integration** - Automatically uploads ZIP files to user's Google Drive
- **Email Notifications** - Sends email with Google Drive link when download is ready
- **Real-time Progress** - Live download job status updates with granular stages
- **Excel Reports** - Includes Excel file with comprehensive image metadata
- **Queue System** - Handles multiple concurrent download requests sequentially
- **Persistent State** - Queue status persists across page refreshes and sessions

### Image Categories
- **Poster** - Promotional materials
- **Etalase** - Display shelves
- **Storefront** - Store exterior photos

## 🛠 Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- Passport.js (Google OAuth)
- Google Cloud Storage
- Google Drive API
- Nodemailer (Gmail)
- Archiver (ZIP creation)
- ExcelJS (Excel generation)

### Frontend
- React 18 with Vite
- Axios for API calls
- React DatePicker
- React Icons
- date-fns

## 📦 Prerequisites

- Node.js 18+ (20+ recommended)
- PostgreSQL 12+
- Google Cloud Platform account with:
  - Cloud Storage bucket
  - OAuth 2.0 credentials
  - Drive API enabled
- Gmail account with App Password

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/miftahul-huda/retina-image-downloader.git
cd retina-image-downloader
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASS=your-database-password
DB_NAME=your-database-name
DB_DIALECT=postgres

# Google Cloud
GCLOUD_BUCKET=retail-intelligence-bucket
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Session
COOKIE_KEY=your_random_secret_key

# CORS
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
```

### 4. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google Drive API
4. Configure OAuth consent screen
5. Create OAuth 2.0 Client ID
6. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
7. Copy credentials to `.env`

### 5. Set up Gmail App Password

1. Enable 2-Step Verification
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate password
4. Copy to `GMAIL_APP_PASSWORD`

### 6. Database Setup

Run migration scripts:

```bash
cd backend
node add_photo_column.js
node update_download_job_queue.js
node update_download_progress.js
```

### 7. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🏃 Running the Application

### Development

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
# or
nodemon app.js
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Access at: http://localhost:5173

### Production

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Run Backend:**
```bash
cd backend
npm start
```

## 📖 Usage

### 1. Login
- Click "Login with Google"
- Authenticate with Google account
- Grant Drive permissions

### 2. Filter Images
- **Date Range** - Select start/end dates
- **Area** - Choose area
- **Region** - Filtered by area
- **City** - Filtered by region
- **Image Type** - poster/etalase/storefront

### 3. Display Results
- Click "Display" to fetch images
- Browse paginated results
- Click thumbnails for full view

### 4. Download Images
- Click "Download & Zip"
- Monitor real-time progress
- If queued, see position
- Receive email when ready
- Access from Google Drive

## 🔄 Queue System

### How It Works

1. **Single Processing** - One download at a time
2. **Automatic Queuing** - New requests queued automatically
3. **Sequential Processing** - FIFO order
4. **Position Tracking** - See queue position
5. **Auto Progression** - Next job starts automatically
6. **Cancellation** - Cancel while queued
7. **Persistence** - State persists across sessions

### Queue States

- **Queued** - Waiting in line
- **Processing** - Currently downloading
- **Completed** - Successfully finished
- **Cancelled** - User cancelled
- **Failed** - Error occurred

### Features

- ✅ Prevents duplicate requests per user
- ✅ Shows queue position: "In Queue - Position #X"
- ✅ Persists after page refresh
- ✅ Persists after logout/login
- ✅ Cancel button while queued
- ✅ Automatic queue progression

## 🗄 Database Schema

### Key Tables

**GoogleUsers** - User accounts
- OAuth tokens, profile photo

**UploadFile** - Image metadata
- Links to Store via `store_id`

**Store** - Outlet information
- Name, city, region, area

**DownloadJob** - Download tracking
- Queue position, status

**DownloadProgress** - Progress updates
- File counts, current status

**CityRegionArea** - Location master data

## 📁 File Organization

Downloaded ZIP structure:
```
retina-images-{timestamp}.zip
├── uploads.xlsx
└── {AREA}/
    └── {REGION}/
        └── {CITY}/
            ├── image1.jpg
            └── image2.jpg
```

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/google` - Login
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/current_user` - Get user
- `GET /api/auth/logout` - Logout

### Data
- `GET /api/master-data` - Location options
- `GET /api/uploads` - Get uploads (filtered, paginated)
- `GET /api/image` - Get thumbnail

### Download
- `POST /api/download/start` - Start download
- `GET /api/download/status/:jobId` - Check status
- `GET /api/download/active` - Get active job
- `GET /api/download/queue` - Queue status
- `POST /api/download/cancel/:jobId` - Cancel download

## 🚀 Deployment (Google Cloud Run)

1. **Build:**
```bash
docker build -t retina-downloader .
```

2. **Push:**
```bash
docker tag retina-downloader gcr.io/PROJECT_ID/retina-downloader
docker push gcr.io/PROJECT_ID/retina-downloader
```

3. **Deploy:**
```bash
gcloud run deploy retina-downloader \
  --image gcr.io/PROJECT_ID/retina-downloader \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated
```

4. **Configure:**
- Set environment variables
- Update OAuth redirect URI
- Update `FRONTEND_URL`

## 🐛 Troubleshooting

### Database Connection
```bash
psql -h DB_HOST -U DB_USER -d DB_NAME
```

### OAuth Redirect Mismatch
Ensure exact match in Google Console:
```
http://localhost:3000/api/auth/google/callback
```

### Email Not Sending
- Verify App Password
- Check spam folder
- Check backend logs

## 📝 License

Proprietary - Telkomsel Retail Intelligence

## 👥 Contributors

- **Miftahul Huda** - Development

## 📞 Support

Contact the development team for issues or questions.

---

**Note**: Requires access to Telkomsel's internal database and Google Cloud resources.
