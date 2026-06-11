# Rwanda Resilience Hub — Implementation Report
**Prepared by:** Yvette Tuyizere (221007271)  
**Institution:** University of Rwanda  
**Supervisors:** Mr. Dieudonne Ukurikiyeyesu · Mr. Omar Sinayobye  
**Date:** June 2026  

---

## 1. Project Overview

The Rwanda Resilience Hub (RRH) is a full-stack flood risk prediction and early-warning platform focused on the **Sebeya River Basin, Rubavu District**. It integrates real-time sensor data, machine learning risk classification, and multi-platform alerting (web dashboard + mobile app) to support disaster preparedness for communities along the Sebeya River.

**Three monitored sensor stations:**
| Station ID | Location | Position |
|---|---|---|
| SEBY-DS-03 | Kanama / Rubavu | Downstream — critical threshold 2.5 m |
| SEBY-MS-02 | Nyundo | Midstream — critical threshold 70 mm/h |
| SEBY-US-01 | Rutsiro | Upstream — early-warning headwater station |

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python), SQLAlchemy ORM, SQLite (dev) |
| Authentication | JWT (python-jose), bcrypt password hashing |
| ML Pipeline | scikit-learn Random Forest, pandas |
| Data Ingestion | OpenWeather API, NASA POWER API |
| Frontend | React 18, TypeScript, Vite 5, Leaflet maps |
| Mobile App | React Native (Expo SDK), expo-notifications |
| Push Notifications | Expo Push Notification Service |
| Email | SMTP (Gmail) with HTML templates |

---

## 3. Features Implemented

### 3.1 Backend API

#### Authentication (`/api/v1/auth`)
- `POST /register` — User registration with institution field
- `POST /login` — JWT token issuance
- `GET /me` — Returns full user profile (`full_name`, `email`, `role`, `institution`, `created_at`)
- `POST /send-verification` — Sends a 6-digit OTP via SMTP email
- `POST /verify-email` — Validates OTP, marks email as verified
- `POST /change-password` — Changes password for authenticated users
- `POST /reset-password` — Password reset using OTP verification

#### Flood Risk (`/api/v1/flood-risk`)
- `GET /zones` — Returns all monitored Sebeya Basin zones with risk levels
- `GET /basin-predictions` — ML model predictions per basin station
- `GET /alerts` — Active flood risk alerts

#### Sensor Data (`/api/v1/sensors`)
- Live sensor readings for all three Sebeya stations (water level, rainfall, humidity)

#### Weather (`/api/v1/weather`)
- `GET /live-alerts` — Fetches live alerts from OpenWeather API for Sebeya region

#### Push Notifications (`/api/v1/notifications`)
- `POST /register-token` — Registers Expo push token per device (stored in database, deduplicated)
- `POST /send-alert` — Saves alert to database, queues for polling, and delivers via Expo Push API to all registered devices
- `GET /pending` — Mobile polling endpoint (drains in-memory queue)
- `GET /history` — Returns full notification history from database (persistent across app restarts)
- `GET /token-count` — Returns number of registered devices

#### Dashboard (`/api/v1/dashboard`)
- Aggregated stats: active alerts, critical zones, ML accuracy, average rainfall

### 3.2 Database Models

| Model | Table | Purpose |
|---|---|---|
| User | users | Registered platform users |
| Region | regions | Monitored geographic zones |
| SensorReading | sensor_readings | Time-series sensor data |
| Prediction | predictions | ML risk classifications (LOW/MODERATE/HIGH/CRITICAL) |
| Alert | alerts | Generated flood alerts |
| PushNotification | push_notifications | History of all sent push notifications |
| PushToken | push_tokens | Registered Expo device tokens |

### 3.3 Frontend Dashboard (React)

#### Pages implemented
- **Dashboard Overview** — Live stat cards, Leaflet risk map, alerts list, rainfall/river level charts, ML prediction panel
- **Analytics** — Per-sensor charts for SEBY-DS-03, SEBY-MS-02, SEBY-US-01 (river level trends, rainfall, risk history)
- **Alerts Management** — Live alerts from API, alert rule configuration, send push notification to all devices
- **Reports** — Report generation (daily/weekly/monthly), notification history from backend
- **Profile** — Loads real user data from `/auth/me` (name, role, institution, join date); change password calls backend; sign out clears JWT token
- **Settings** — Notification preferences, Sebeya alert thresholds (rainfall mm/h, river level m, risk score %), system information
- **User Management** — Role-based access control (Admin, Analyst, Zone Manager, Observer)
- **About** — Platform description, 3 sensor stations, data flow explanation
- **Help** — FAQ specific to RRH and Sebeya Basin
- **Landing / Login / Register** — Public-facing pages with JWT authentication

#### Live Ticker Banner
Scrolling banner at the top of the dashboard that shows:
- Live alerts from OpenWeather when backend is reachable
- Static Sebeya station status messages as fallback

### 3.4 Mobile Application (React Native / Expo)

#### Screens
- **Dashboard** — Real-time risk overview for Sebeya Basin
- **Alerts** — Persistent alert list loaded from backend history + sensor alerts; pull-to-refresh
- **Weather** — Live weather conditions for Sebeya region
- **Safety Tips** — Flood preparedness guidance
- **Profile** — User account management

#### Push Notification System
The mobile app implements a two-layer notification strategy:

**Layer 1 — Expo Push Notifications (background delivery)**
- On app launch, `useNotifications` requests device permissions
- Calls `Notifications.getExpoPushTokenAsync()` to obtain an Expo push token
- Registers the token with the backend (`POST /notifications/register-token`)
- When an alert is sent from the dashboard, the backend calls the Expo Push API (`https://exp.host/--/api/v2/push/send`) for all registered tokens
- Notifications are delivered to the device even when the app is fully closed

**Layer 2 — Polling fallback (foreground)**
- While the Alerts tab is open, the app polls `/notifications/pending` every 5 seconds
- New notifications are added to the list immediately

**Persistent Alert History**
- On mount and tab focus, the app fetches `/notifications/history` from the backend database
- Sent notifications are permanently visible in the Alerts tab under "Sent Notifications"
- History survives app restarts (stored in backend DB, not device memory)

#### Android Notification Channel
A dedicated `rrh-alerts` channel is created on Android with:
- Importance: MAX
- Vibration pattern: [0, 250, 250, 250]
- Light color: red (#FF0000)
- Sound: default

---

## 4. Security Implementation

| Measure | Detail |
|---|---|
| Password hashing | bcrypt via passlib |
| Authentication | JWT Bearer tokens, 24-hour expiry |
| JWT secret | Cryptographically random 32-byte key (secrets.token_urlsafe) |
| Email verification | 6-digit OTP, 5-minute expiry |
| Push tokens | Stored with unique constraint to prevent duplicates |
| Sensitive config | All credentials in `.env` (gitignored), not in source code |

---

## 5. Data Flow

```
OpenWeather API ──┐
NASA POWER API  ──┼──► Backend (FastAPI) ──► SQLite Database
IoT Sensors     ──┘         │
                             │
                     ┌───────┴────────┐
                     │                │
              Web Dashboard      Mobile App (Expo)
              (React/Vite)       (React Native)
                     │                │
              Leaflet Maps     Push Notifications
              Risk Charts      Alerts History
              PDF Reports      Live Sensor Data
```

**Alert delivery flow:**
```
Dashboard user sends alert
        │
        ▼
POST /api/v1/notifications/send-alert
        │
        ├──► Save to push_notifications table (permanent history)
        ├──► Add to in-memory _pending queue (polling fallback)
        └──► POST to https://exp.host/--/api/v2/push/send
                    │
                    └──► Device receives notification (app open or closed)
```

---

## 6. Key Technical Decisions

### Expo Push vs Firebase
The project uses **Expo Push Notification Service** rather than directly integrating Firebase Cloud Messaging. Expo acts as an abstraction layer that handles FCM (Android) and APNs (iOS) delivery without requiring separate Firebase project setup. This simplifies the implementation while maintaining full background delivery capability.

### SQLite for Development
The proposal specifies PostgreSQL. SQLite is used for the development and demo environment because it requires no server setup and the SQLAlchemy ORM allows switching to PostgreSQL by changing a single `DATABASE_URL` environment variable.

### Dual Notification Strategy
Notifications use both Expo push (background delivery) and HTTP polling (foreground reliability). The polling fallback ensures that if push token registration fails (e.g., on a simulator), the app still receives alerts while open.

### API-first with graceful fallbacks
All frontend pages try the live backend API first and fall back to Sebeya-specific static data if the backend is unreachable. This ensures the dashboard remains usable during demo even if the network is unstable.

---

## 7. Environment Configuration

```env
APP_NAME=Rwanda Resilience Hub
DATABASE_URL=sqlite:///./rrh.db
JWT_SECRET_KEY=<32-byte random key>
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENWEATHER_API_KEY=<key>
NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api/temporal/daily/point
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<gmail address>
SMTP_PASSWORD=<gmail app password>
FRONTEND_URL=http://localhost:5173
```

---

## 8. Running the System

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://0.0.0.0:8000
# API docs at http://localhost:8000/docs
```

### Frontend
```bash
cd rrh-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Mobile
```bash
cd rrh-mobile
npm install
npx expo start
# Scan QR code with Expo Go on physical device
```

---

## 9. Test Credentials

| Email | Password | Role |
|---|---|---|
| admin@rrh.rw | admin123 | Admin |
| analyst@meteo.rw | analyst123 | Analyst |
| tuyizere_221007271@stud.ur.ac.rw | — | Admin |

---

## 10. Future Work

| Item | Description |
|---|---|
| PostgreSQL migration | Switch `DATABASE_URL` to a PostgreSQL instance for production |
| Real IoT sensors | Replace OpenWeather simulation with physical water level sensors |
| WebSocket real-time | Replace polling with WebSocket push for sub-second alert delivery |
| EAS Build | Compile a standalone `.apk`/`.ipa` for distribution outside Expo Go |
| PDF report export | Generate downloadable reports from the Reports page |
