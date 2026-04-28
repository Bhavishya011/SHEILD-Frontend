# 🛡️ SHIELD — AI-Powered Crisis Response System

> **Google Solution Challenge 2026** — Real-time emergency management for hotels using AI, IoT simulation, and intelligent staff dispatch.

![SHIELD](https://img.shields.io/badge/SHIELD-Crisis%20Response-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?style=flat-square&logo=firebase)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)
![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Backend-4285F4?style=flat-square&logo=googlecloud)

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend      │────▶│    Backend       │────▶│   Google Cloud   │
│  (Vite + React)  │     │  (Express.js)   │     │  Gemini AI API   │
│                  │     │  Cloud Run      │     └─────────────────┘
│  Firebase SDK    │──┐  │                  │
│  (real-time)     │  │  │  Firebase Admin   │
└─────────────────┘  │  └─────────────────┘
                      │           │
                      └───────────┘
                      Firebase RTDB
```

- **Frontend** — React SPA (Vite + Tailwind CSS). Connects directly to Firebase for real-time listeners.
- **Backend** — Express.js server deployed on Cloud Run. Handles Gemini API calls (triage, translate, report) and dispatch logic. Keeps API keys server-side.
- **Firebase** — Realtime Database for incidents, tasks, and staff state. Auth for login.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Frontend
cd SHEILD
npm install

# Backend
cd backend
npm install
```

### 2. Configure API Keys

**Frontend** (`.env`):
```env
VITE_FIREBASE_API_KEY=your_firebase_key_here
VITE_FIREBASE_PROJECT_ID=sheild-494713
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_GOOGLE_MAPS_KEY=your_maps_key_here
VITE_API_URL=http://localhost:8080
```

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_gemini_key_here
FIREBASE_DATABASE_URL=https://sheild-494713-default-rtdb.firebaseio.com
ALLOWED_ORIGINS=http://localhost:5173
PORT=8080
```

### 3. Run Both Servers
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
npm run dev
```

Frontend: `http://localhost:5173` | Backend: `http://localhost:8080`

> **Note:** Both frontend and backend work in **demo mode** without API keys. Firebase uses fallback, Gemini uses rule-based triage.

---

## ☁️ Deploy Backend to Cloud Run

**Project:** `sheild-494713` (Project Number: `845076723901`)

### Prerequisites
1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project sheild-494713`

### Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firebaserules.googleapis.com
gcloud services enable firebasedatabase.googleapis.com
```

### Deploy
```bash
cd backend

# Option 1: PowerShell (Windows)
.\deploy.ps1

# Option 2: Manual
gcloud builds submit --tag gcr.io/sheild-494713/shield-backend .
gcloud run deploy shield-backend \
  --image gcr.io/sheild-494713/shield-backend \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key_here" \
  --set-env-vars "FIREBASE_DATABASE_URL=https://sheild-494713-default-rtdb.firebaseio.com"
```

### After Deploy
Update the frontend `.env` with the Cloud Run URL:
```env
VITE_API_URL=https://shield-backend-xxxxx-xx.a.run.app
```

---

## 🔑 Getting API Keys

### Gemini API Key (Free)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy → paste into `backend/.env` as `GEMINI_API_KEY`

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open project `sheild-494713` (or create new)
3. **Enable these services:**
   - ✅ Authentication → Email/Password sign-in
   - ✅ Realtime Database → Create in **test mode**
4. Project Settings → Add Web App → Copy config:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `appId` → `VITE_FIREBASE_APP_ID`

5. **Create test users** in Firebase Auth → Users:
   - `manager@shield.com` / `shield123`
   - `staff1@shield.com` / `shield123`
   - `staff2@shield.com` / `shield123`

6. **Database Rules** (development):
```json
{
  "rules": { ".read": true, ".write": true }
}
```

### Google Maps API Key (Optional)
1. [Google Cloud Console](https://console.cloud.google.com) → Enable **Maps JavaScript API**
2. Create credentials → API Key → paste into `VITE_GOOGLE_MAPS_KEY`

---

## 🎮 Demo Walkthrough

### Flow 1: Guest Emergency
1. Open `/sos?room=214`
2. Type: "There's smoke coming from the hallway"
3. Click **Send Emergency Alert**
4. Backend triages via Gemini AI → dispatches staff → shows ETA

### Flow 2: Manager Command Center
1. Login as `manager@shield.com` / `shield123`
2. See incidents in real-time sidebar
3. Click **Simulate Crisis** → pick type, room, severity
4. Watch: CCTV red dots, map crisis pin, staff alerts
5. Click incident → **Mark Resolved** → AI report → Download PDF

### Flow 3: Staff Response
1. Login as `staff1@shield.com` / `shield123`
2. See task card with instructions + ETA
3. Click **Mark Complete** when done

### Flow 4: Silent SOS (Trafficking)
1. Open `/sos?room=310` → Click **Silent Alert**
2. Screen shows only: "Your request has been received."
3. Manager sees severity-5 trafficking alert silently

---

## 📁 Project Structure

```
SHEILD/
├── src/                        ← FRONTEND (React + Vite)
│   ├── pages/
│   │   ├── GuestSOS.jsx        # Public QR emergency form
│   │   ├── StaffDashboard.jsx  # Staff mobile view
│   │   ├── ManagerDashboard.jsx# War-room command center
│   │   └── Login.jsx           # Role-based login
│   ├── components/
│   │   ├── CrisisMap.jsx       # Google Maps / simulated map
│   │   ├── CCTVOverlay.jsx     # Canvas CCTV simulation
│   │   ├── IncidentCard.jsx    # Incident list card
│   │   ├── TaskCard.jsx        # Staff task card
│   │   ├── AlertBanner.jsx     # Full-screen alert + audio
│   │   └── IncidentReport.jsx  # AI report + PDF download
│   ├── lib/
│   │   ├── firebase.js         # Firebase client SDK
│   │   ├── gemini.js           # API client (calls backend)
│   │   ├── dispatch.js         # Client-side dispatch (fallback)
│   │   └── mockData.js         # Simulated hotel data
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/                    ← BACKEND (Express.js → Cloud Run)
│   ├── server.js               # All API endpoints
│   ├── Dockerfile              # Cloud Run container
│   ├── deploy.ps1              # Windows deploy script
│   ├── deploy.sh               # Linux/Mac deploy script
│   ├── package.json
│   └── .env.example
├── .env                        # Frontend env vars
├── .env.example
├── vite.config.js
└── package.json
```

---

## 🔧 Google Cloud APIs to Enable

| Service | Where | Purpose |
|---------|-------|---------|
| Cloud Run | Backend | Host Express server |
| Cloud Build | Backend | Build Docker image |
| Container Registry | Backend | Store Docker image |
| Firebase Auth | Frontend | Staff/manager login |
| Firebase Realtime DB | Both | Real-time incident data |
| Generative AI (Gemini) | Backend | AI triage & reports |
| Maps JavaScript API | Frontend | Live map overlay (optional) |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Tailwind CSS v4, Vite 8 |
| Backend | Express.js 5, Firebase Admin SDK, Gemini AI SDK |
| Database | Firebase Realtime Database |
| AI | Google Gemini 2.0 Flash |
| Maps | Google Maps JavaScript API |
| PDF | jsPDF |
| Icons | Lucide React |
| Deploy | Google Cloud Run |

---

## 📄 License

Built for Google Solution Challenge 2026. MIT License.
