# RRH Frontend Integration Log

---

## Task 1 — Fix registration payload
Status: DONE
Files changed:
- src/services/api.ts
- src/pages/RegisterPage.tsx

Notes:
- api.ts register(): renamed full_name→name, institution→phone_number, removed role:"viewer" from payload
- RegisterPage.tsx: replaced "Location" province dropdown with "Phone number" text input; updated validation to require phone_number; updated apiService.register() call signature
- email_alerts_enabled not sent (backend defaults to False) — acceptable

---

## Task 2 — Fix API base URLs and path mismatches
Status: DONE
Files changed:
- src/services/api.ts

Notes:
Paths fixed:
- /dashboard → /admin/stats (getDashboard, return type updated to AdminStats shape)
- /zones → /regions (getZones)
- /zones/{id} → /regions/{id} (getZoneDetail)
- /user/profile GET → /users/me (getProfile, return type updated to UserResponse shape)

Removed (no backend equivalent):
- createAlert() — backend has no POST /alerts

Made throw-TODO (no backend equivalent):
- getSensorData() — no /zones/{id}/sensors equivalent
- getBasinPredictions() — replaced by new getPrediction(regionId)
- getNasaRainfall() — no backend equivalent
- getWeatherAlerts() — no backend equivalent; useAlerts hook falls through to getAlerts()
- getAnalytics() — no backend equivalent
- getReports() — no backend equivalent
- generateReport() — no backend equivalent
- updateProfile() — PATCH /users/{id} is admin-only, no self-update endpoint exists
- changePassword() — no backend endpoint

New methods added:
- logout() → POST /auth/logout
- getPrediction(regionId) → POST /predict
- markAlertRead(alertId) → PATCH /alerts/{id}/read
- getAdminUsers() → GET /admin/users
- updateUser(userId, data) → PATCH /users/{userId}
- deleteUser(userId) → DELETE /users/{userId}
- getAdminAlerts(status?) → GET /admin/alerts

New private base methods:
- patch<T>()
- delete<T>() — handles 204 No Content (returns undefined)

Removed private base method:
- put<T>() — nothing calls it anymore

---

## Task 3 — Fix dashboard stat cards
Status: DONE
Files changed:
- src/hooks/useData.ts
- src/pages/dashboard/DashboardOverview.tsx

Notes:
DashboardStats interface updated to match real /admin/stats response shape:
  { total_users, total_predictions, total_alerts, predictions_by_risk_level, alerts_by_status, total_sensor_readings, regions_count }

Stat card field mappings (old → new):
- "Active Alerts":      active_alerts   → alerts_by_status.pending (falls back to total_alerts)
- "Critical Zones":     critical_zones  → predictions_by_risk_level.critical
- "ML Accuracy" label changed to "Total Predictions": ml_accuracy_pct → total_predictions (no accuracy field in /admin/stats)
- "Avg Rainfall 24h" label changed to "Monitored Regions": avg_rainfall_mm → regions_count (no rainfall field in /admin/stats)

---

## Task 4 — Fix alerts integration
Status: DONE
Files changed:
- src/hooks/useData.ts
- src/pages/dashboard/AlertsManagementPage.tsx

Notes:
useData.ts / useAlerts():
- Removed dead getWeatherAlerts() try block (always throws)
- Updated getAlerts() field mapping to match real AlertResponse shape:
    risk_level → level (via _LVL_MAP)
    message    → description
    region_id  → zone (limitation: UUID shown, no region name in AlertResponse)
    created_at → time (formatted)
    status     → status
- Title synthesized from risk_level (no title field in AlertResponse)
- Added markRead(alertId) → PATCH /alerts/{id}/read, then filters alert out of local state
- Removed source state (no longer relevant)

AlertsManagementPage.tsx:
- Replaced static CONSTANTS.ALERTS with useAlerts() hook
- Removed import { ALERTS } from constants
- Updated color/filter maps: crit/mod shortcodes → critical/moderate full strings
- dismiss() now calls markRead(id); alert removed from view only on API success
- Added loading state ("Loading alerts…") and error banner
- viewedId changed from number to string (alert UUID)
- "Create Alert Rule" form unchanged (no backend endpoint)

FLAG (RESOLVED): alert.zone now shows region name. useAlerts.load() fetches GET /alerts
      and GET /regions in parallel via Promise.allSettled, builds a region_id→name map,
      resolves the name before setting state. Falls back to UUID if region fetch fails.
      DashboardOverview handleAlertClick zone-matching also benefits automatically.

---

---

## Task 5 — Fix predictions panel
Status: DONE
Files changed:
- src/hooks/useData.ts
- src/pages/dashboard/DashboardOverview.tsx

Notes:
useData.ts:
- Replaced BasinPrediction interface and usePredictions() with new PredictionResult interface
- usePredictions() now: fetches GET /regions, then fires POST /predict for each region in parallel
  via Promise.allSettled (one failed prediction does not abort the rest)
- Returns PredictionResult[]: { regionId, regionName, risk_level, confidence (0-1), timestamp }

DashboardOverview.tsx predictions panel:
- predictions?.predictions?.length → predictions?.length (flat array, not nested)
- p.basin / p.zone → p.regionName
- p.confidence (was 0-100) → Math.round(p.confidence * 100) (now 0-1 from backend)
- key changed from p.basin → p.regionId
- "Key features" section removed (rainfall_24h, water_level, humidity, soil_saturation not in PredictResponse)
- timestamp shown per card (formatted short date + time)
- Header badge shows "● Live" when predictions are loaded; subtitle shows region count
- Empty state message updated (removed "Backend offline" language)

---

---

## Task 6 — Wire UserManagementPage to real backend
Status: DONE
Files changed:
- src/pages/dashboard/UserManagementPage.tsx

Notes:
- Replaced INITIAL_USERS (5 fake users) with GET /admin/users on mount (page=1, size=50)
- Replaced INITIAL_ROLES (4 fake roles) with the 2 real backend roles: "admin" and "user"
- initials computed from name; joined date formatted from created_at
- Role dropdown now contains only "admin" | "user" options
- changeRole() → PATCH /users/{id} { role }; updates local state on success
- toggleEmailAlerts() → PATCH /users/{id} { email_alerts_enabled }; Email Alerts column replaces Status column (clickable chip)
- removeUser() → DELETE /users/{id} (soft delete); removes from local state on success
- "Approve" and "Deactivate/Activate" buttons removed (no status/is_active field in UserResponse or UserUpdate)
- View panel now shows: phone_number, email_alerts_enabled, created_at, role permissions
- Roles tab shows 2 real system roles with user counts from loaded data
- "Create Custom Role" form kept as local-only with a disclaimer note

---

FLAG: /admin/stats requires admin role. Non-admin users get 403; all four cards show "—".
FLAG: ML model accuracy exists at GET /admin/model-performance but needs an extra API call — deferred.

---

## Task 3b — Role guard + non-admin stat cards
Status: DONE
Files changed:
- src/services/api.ts
- src/hooks/useData.ts
- src/pages/dashboard/DashboardOverview.tsx

Notes:
api.ts: added getSubscriptions() → GET /subscriptions

useData.ts:
- Removed old UserProfile interface (had optional/wrong fields)
- Added UserProfile interface with correct UserResponse shape
- Added useIsAdmin() → calls getProfile() (GET /users/me), returns { isAdmin, loading, profile }
- Added useSubscriptions() → GET /subscriptions
- Added useRegionDetail(regionId | null) → GET /regions/{id}, skips fetch when regionId is null
- useAuth user state changed from UserProfile|null to Record<string,unknown>|null (login response type)

DashboardOverview.tsx:
- Calls useIsAdmin(), useSubscriptions(), useRegionDetail(firstSubscriptionRegionId)
- adminStatCards: shown to admins — uses /admin/stats fields (existing Task 3 mapping)
- userStatCards: shown to non-admins — uses real API data:
    "Active Alerts"          → alerts.length (from useAlerts)
    "My Region Risk"         → regionDetail.latest_prediction.risk_level
    "Prediction Confidence"  → regionDetail.latest_prediction.confidence_score * 100
    "My Subscriptions"       → subscriptions.length
- While role is loading: statCards = [] (StatCards renders nothing)
- If user has no subscriptions: risk/confidence cards show "—" with hint "Subscribe to a region"

---

## Task 7 — Align Alert type with backend + wire alert mini-card to /regions/{id}
Status: DONE
Files changed:
- src/types.ts
- src/hooks/useData.ts
- src/components/dashboard/AlertsList.tsx
- src/pages/dashboard/AlertsManagementPage.tsx
- src/pages/dashboard/DashboardOverview.tsx
- src/constants.ts

### Alert type alignment
- `Alert` in types.ts rewritten to match backend shape exactly:
    { id, region_id, user_id, risk_level, channel, status, confidence_score, message, created_at, sent_at, region_name? }
- `region_name` is the only frontend-enriched field (populated from the parallel /regions fetch in useAlerts)
- Removed `AlertItem` interface, `_LVL_MAP`, `_mockAlerts()` from useData.ts — translation layer eliminated
- `useAlerts()` now starts with `[]` (no mock seed); maps backend rows directly, enriches region_name only
- `ALERTS` constant removed from constants.ts — no longer referenced anywhere

### AlertsList component
- Updated to use backend field names: `alert.risk_level`, `alert.message`, `alert.region_name ?? alert.region_id`, `alert.created_at`
- Title derived inline from `risk_level` (TITLE_MAP); time formatted inline from `created_at`
- Removed `selectedZone` prop — zone highlight via fuzzy string match was fragile and is no longer needed
- `alerts` prop type changed from mapped shape to `Alert[]` directly

### AlertsManagementPage
- All field references updated: `a.level` → `a.risk_level.toLowerCase()`, `alert.title` → synthesized inline,
  `alert.description` → `alert.message`, `alert.zone` → `alert.region_name ?? alert.region_id`,
  `alert.time` → formatted from `alert.created_at`
- `alert.id` is now always string (non-optional); removed `alert.id &&` guard on dismiss

### DashboardOverview — alert mini-card
- `selectedZone: Zone | null` state removed; replaced with `selectedRegionId: string | null`
- `handleAlertClick` now sets `selectedRegionId = alert.region_id` (direct UUID, no fuzzy match)
- Mini-card wired to `useRegionDetail(selectedRegionId)` — hits GET /regions/{id} on click
- Mini-card renders real backend fields only: name, risk_level chip, ML confidence bar, description, last predicted timestamp
- Removed fabricated fields: rainfall, river level, river capacity bar (backend doesn't provide these per region)
- `DashMap` `onZoneSelect` prop removed (selectedZone state gone; map zone selection was unused after this change)

---

## Task 8 — Wire Weekly Rainfall chart to real backend
Status: DONE
Files changed:
- src/types.ts
- src/hooks/useData.ts
- src/services/api.ts
- src/pages/dashboard/DashboardOverview.tsx

### Zone type
- Added `regionId: string` to `Zone` interface to preserve the backend UUID alongside the numeric display `id`
- `useZones()` mapping now populates `regionId: r.id`

### API
- Added `getRegionSensorReadings(regionId, source?, limit?)` → `GET /regions/{id}/sensor-readings?source=nasa_power&limit=7`

### Hook
- Added `useRainfallData(regionId: string | null)`:
  - `regionId = null` → `noSubscription = true`, `data = []` (no mock fallback)
  - `regionId` provided but no rows → `data = []`
  - Filters rows where `rainfall_mm` is non-null, maps `recorded_at` → short day label, reverses to chronological order
  - Returns `{ data, loading, noSubscription }`

### DashboardOverview — Rainfall panel
- Removed old `rainfallData` block (was analytics fallback → RAINFALL_DATA mock)
- Removed `RAINFALL_DATA` import from constants
- Admin: `adminRainfallRegionId` state; `<select>` dropdown populated from `zones`; defaults to `zones[0].regionId`
- User: uses `firstRegionId` from subscriptions
- Three empty states: no subscription message, loading spinner text, no data yet message
- No mock data used anywhere in this panel

---

## Task 9 — DashboardOverview cleanup + bug fixes
Status: DONE
Files changed:
- src/hooks/useData.ts
- src/components/dashboard/DashMap.tsx
- src/components/dashboard/Charts.tsx
- src/pages/dashboard/DashboardOverview.tsx
- src/utils/helpers.ts

### Bug fixes
- 422 on sensor readings: `useZones()` started with ZONES mock (regionId '1','2'…); changed initial state to `[]`; added `zonesLoading` guard on `rainfallRegionId`
- Map container already initialized: init effect had `displayZones` in deps causing destroy/re-create on zone load; removed it (`[]` deps); added `if (mapRef.current) return` inside `init()` to guard against StrictMode double-fire
- Rainfall chart bars invisible: CSS `flex:1` on `.db-bar-fill` overrode inline `height:%`; fixed with `alignItems:'stretch'` on bars container, `justifyContent:'flex-end'` on columns, `flex:'none'` on fill

### Rainfall chart
- Switched source from `openweather` (30-min readings, all 0mm today) to `nasa_power` (daily aggregates)
- Removed `rainfall_mm !== null` filter — nulls treated as 0mm so all 7 days always render
- Switched from `BarChart` to `LineChart` with `height={200}`
- Added optional `height` prop to `LineChart` (default 80, ML chart unaffected)

### Zones table (DashboardOverview)
- Removed entirely — redundant with ML Predictions panel above it and the AnalyticsPage table
- Removed `Fragment`, `TREND_ICON`, `TREND_COLOR`, `tableExpandedZoneId`, `riverData`, `RIVER_DATA`

### formatDateTime utility
- Added `FORMATS` + `formatDateTime(date, format)` using dayjs to `src/utils/helpers.ts`

---

## Task 10 — AnalyticsPage full rewrite
Status: DONE
Files changed:
- src/services/api.ts
- src/hooks/useData.ts
- src/pages/dashboard/AnalyticsPage.tsx

### API additions
- `getRegionSensorReadingLatest(regionId, source?)` → `GET /regions/{id}/sensor-readings/latest`
- `subscribe(regionId)` → `POST /subscriptions { region_id }`
- `unsubscribe(regionId)` → `DELETE /subscriptions/{region_id}`

### Hook additions
- `useAvgRainfall()`: fetches NASA POWER readings for all 5 regions in parallel, averages non-null `rainfall_mm` values

### AnalyticsPage
- Replaced entire mock-data page with real-data implementation
- 2 metric cards: Critical Zones (from zones data), Avg Rainfall (useAvgRainfall)
- Regions table: expandable rows; sensor reading fetched lazily on first expand, cached after
- Predict button (admin only) → POST /predict, shows risk + confidence + "Live Sensor" badge inline
- Subscribe/Unsubscribe button (user only) → toggles based on current subscriptions, refreshes list after action
- All styling follows db-panel / db-zone-table / zd-mini-card / db-btn-sm patterns
