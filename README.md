# NewsPulse AI 📰🤖

**NewsPulse AI** is a production-ready personalized mobile news application (Inshorts-style short news cards) powered by AI/ML behavioral interest tracking, multi-provider news ingestion, privacy-aware AIMLADS monetization, and an interactive admin dashboard.

---

## 🚀 Key Features

1. **Short News Cards**: Concise, fast-reading card UI with source links, high-res images, categories, and published timestamps.
2. **Behavioral AI Personalization**: Real-time tracking of reading durations, full reads (+5), likes (+8), bookmarks (+10), shares (+12), skips (-2), and not-interested signals (-10) with exponential time decay ($S_{decayed} = S \cdot e^{-\lambda t}$).
3. **Multi-Factor Feed Formula**:
   $$ finalScore = userInterestScore \cdot 0.40 + freshnessScore \cdot 0.25 + engagementScore \cdot 0.15 + categoryPreferenceScore \cdot 0.10 + diversityScore \cdot 0.10 $$
4. **Explainable AI Feed**: Interactive *"Why am I seeing this story?"* modal providing natural language reasons for each recommendation.
5. **Multi-Provider News Ingestion**: NewsAPI, Google News RSS, and Mock fallbacks with SHA-256 deduplication and scheduled cron jobs.
6. **AIMLADS Monetization Engine**: Contextual ad provider abstraction inserting sponsored ad cards every `AD_FREQUENCY` (default: 5) news cards with impression, click, and conversion tracking.
7. **Guest & Authenticated Modes**: Anonymous device session tracking for guest users + JWT token pair for registered users.
8. **Admin Control Console**: Real-time analytics dashboard, manual news refresh trigger, article moderation, ad frequency config, and recommendation formula weight sliders.

---

## 📁 Repository Structure

```
d:/news_app/
├── backend/                  # Node.js + Express + TypeScript + MongoDB + Redis + Swagger
│   ├── src/
│   │   ├── config/           # Database, Redis, Logger & Env configs
│   │   ├── controllers/      # Auth, News, Feed, Interactions, User, Bookmarks, Ads, Admin
│   │   ├── services/         # News Ingestion, Recommendation Scoring, AIMLADS Ad Engine
│   │   ├── models/           # Mongoose Schemas (User, NewsArticle, Interaction, Profile, Ad, etc.)
│   │   ├── routes/           # Express API endpoints (/api/v1/...)
│   │   ├── middlewares/      # Auth, Admin, Validation, Error Handling
│   │   ├── jobs/             # Scheduled news ingestion cron job
│   │   ├── validators/       # Zod request validation schemas
│   │   └── docs/             # OpenAPI / Swagger specs
│   ├── tests/                # Jest unit & integration test suite
│   ├── Dockerfile
│   └── package.json
├── mobile/                   # React Native (Expo + TypeScript) Mobile App
│   ├── src/
│   │   ├── components/       # NewsCard, AdCard, CategoryHeader
│   │   ├── screens/          # HomeScreen, SearchScreen, BookmarkScreen, ProfileScreen, Onboarding, Auth
│   │   ├── services/         # API client & Client-side Behavior Tracker
│   │   ├── context/          # Auth & Preference Context
│   │   └── navigation/       # React Navigation stack & tab navigators
│   └── App.tsx
├── admin/                    # React + TypeScript + Vite + Tailwind Admin Panel
│   ├── src/
│   │   ├── components/       # Sidebar, MetricCard
│   │   ├── pages/            # Overview, NewsManagement, RecommendationSettings, AdSettings
│   │   └── App.tsx
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml        # Docker stack orchestrating Backend, Admin, MongoDB, Redis
└── README.md
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm
- MongoDB (running locally on `mongodb://127.0.0.1:27017` or via Docker)
- Redis (running locally on `redis://127.0.0.1:6379` or via Docker)
- Docker Desktop (optional for containerized setup)

---

### 1. Running the Backend Server

```bash
cd backend
npm install
npm run dev
```

The API server will launch at `http://localhost:5000`.
- **Swagger Documentation**: `http://localhost:5000/api/docs`

---

### 2. Running the Mobile App (React Native / Expo)

```bash
cd mobile
npm install
npm start
```

Press `a` for Android Emulator, `i` for iOS Simulator, or `w` for Web Browser preview.

---

### 3. Running the Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

Access the Admin Console in your browser at `http://localhost:3000`.

---

## 🐳 Docker Deployment

To launch the complete infrastructure (Backend, Admin Console, MongoDB, Redis) in containers:

```bash
docker-compose up --build -d
```

- **Backend API**: `http://localhost:5000`
- **Swagger Docs**: `http://localhost:5000/api/docs`
- **Admin Dashboard**: `http://localhost:3000`

---

## 🔑 Environment Variables Reference (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/newspulse
REDIS_URL=redis://127.0.0.1:6379

JWT_SECRET=super_secret_jwt_key_newspulse_2026_dev
JWT_REFRESH_SECRET=super_secret_refresh_key_newspulse_2026_dev

# News APIs
NEWS_API_KEY=your_news_api_key_here
GOOGLE_NEWS_API_KEY=your_google_news_api_key_here

# AIMLADS Ad Integration
AIMLADS_BASE_URL=https://api.aimlads.com/v1
AIMLADS_API_KEY=your_aimlads_api_key_here
AIMLADS_PUBLISHER_ID=pub_newspulse_demo_123

AD_FREQUENCY=5

# Recommendation Formula Weights
REC_WEIGHT_INTEREST=0.40
REC_WEIGHT_FRESHNESS=0.25
REC_WEIGHT_ENGAGEMENT=0.15
REC_WEIGHT_PREFERENCE=0.10
REC_WEIGHT_DIVERSITY=0.10
```

---

## 🔌 News Providers & Ingestion

NewsPulse AI features a decoupled `NewsProvider` abstraction:
1. `NewsAPIProvider`: Fetches headlines from `newsapi.org`.
2. `GoogleNewsRSSProvider`: RSS feed parser for zero-config Google News feeds.
3. `MockNewsProvider`: Seed realistic articles for offline/demo development without external API keys.

---

## 🎯 AIMLADS Integration

Integrated via `AdProvider` interface:
- **Live Integration Point**: `backend/src/services/ads/providers/AIMLadsProvider.ts` contains documented hooks for official AIMLADS endpoints.
- **Privacy-Aware Context**: Sends non-sensitive telemetry (`topInterestCategories`, `platform`, `language`).
- **Contextual Ad Matching**: Automatically matches sports readers with sports ads, business readers with finance/investment ads, etc.

---

## 🧪 Testing

To run backend unit tests (recommendation scoring, deduplication, ad logic):

```bash
cd backend
npm test
```
