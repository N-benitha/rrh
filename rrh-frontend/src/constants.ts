/* ─── RRH Shared Constants & Data ─── */
import type { Zone, RiskLevel } from "./types";

/* ── Zone data — Sebeya River, 3 IoT sensor stations ───────── */
export const ZONES: Zone[] = [
  {
    id: 1,
    name: "SEBY-DS-03 — Kanama / Rubavu",
    region: "Downstream · Rubavu District",
    lat: -1.6849,
    lng: 29.3892,
    level: "CRITICAL",
    rainfall: "85mm/h",
    river: "2.8m",
    score: 91,
    trend: "up",
    updated: "2m ago",
    desc: "Water level 2.8m — exceeds critical threshold (2.5m). Immediate flood risk in Kanama sector. 131 fatalities from May 2023 event. Evacuation recommended.",
  },
  {
    id: 2,
    name: "SEBY-MS-02 — Nyundo",
    region: "Midstream · Rubavu District",
    lat: -1.5554,
    lng: 29.5375,
    level: "HIGH",
    rainfall: "68mm/h",
    river: "2.1m",
    score: 74,
    trend: "up",
    updated: "5m ago",
    desc: "Rainfall 68mm/h approaching 70mm/h critical threshold. River rising — 2.1m and climbing. Downstream communities should prepare to evacuate.",
  },
  {
    id: 3,
    name: "SEBY-US-01 — Rutsiro",
    region: "Upstream · Rutsiro District",
    lat: -1.3954,
    lng: 29.4849,
    level: "MODERATE",
    rainfall: "52mm/h",
    river: "1.4m",
    score: 47,
    trend: "up",
    updated: "8m ago",
    desc: "Sustained upstream rainfall at 52mm/h. Monitoring for downstream impact. River level stable but conditions trending upward.",
  },
];

/* ── Risk level colours (reusable across components) ──────── */
export const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH:     "#F97316",
  MODERATE: "#EAB308",
  LOW:      "#22C55E",
  critical: "#EF4444",
  high:     "#F97316",
  moderate: "#EAB308",
  low:      "#22C55E",
};

/* ── Risk metadata ──────────────────────────────────────────── */
export const RISK_META: {
  [k in RiskLevel]: {
    color: string;
    glow: string;
    chip: string;
    radius: number;
    bar: string;
  };
} = {
  CRITICAL: {
    color: "#EF4444",
    glow: "rgba(239,68,68,.5)",
    chip: "c",
    radius: 18000,
    bar: "#EF4444",
  },
  HIGH: {
    color: "#F97316",
    glow: "rgba(249,115,22,.45)",
    chip: "h",
    radius: 13000,
    bar: "#F97316",
  },
  MODERATE: {
    color: "#EAB308",
    glow: "rgba(234,179,8,.4)",
    chip: "m",
    radius: 8500,
    bar: "#EAB308",
  },
  LOW: {
    color: "#22C55E",
    glow: "rgba(34,197,94,.4)",
    chip: "l",
    radius: 5000,
    bar: "#22C55E",
  },
};

/* ── Features ──────────────────────────────────────────────── */
export const FEATURES = [
  {
    name: "Real-Time Monitoring",
    text: "Live sensor and API data from NASA POWER, OpenWeather, and simulated IoT streams — refreshed every 15 minutes.",
  },
  {
    name: "ML Risk Classification",
    text: "Random Forest model trained on historical flood data classifies conditions as Low, Moderate, High, or Critical.",
  },
  {
    name: "Interactive Risk Maps",
    text: "Leaflet-powered geospatial maps display flood zones across Nyabarongo, Sebeya, Nyabugogo, and urban Kigali.",
  },
  {
    name: "IoT Sensor Simulation",
    text: "Simulated sensor streams validate real-time data ingestion and demonstrate extensibility for physical deployment.",
  },
  {
    name: "Automated Alert System",
    text: "When risk thresholds are exceeded, the system dispatches alerts to MINEMA, RWB, and registered users.",
  },
  {
    name: "Analytics Dashboard",
    text: "Track rainfall trends, river levels, and ML confidence scores — exportable for disaster management agencies.",
  },
];

/* ── Process steps ────────────────────────────────────────── */
export const PROCESS = [
  { title: "Data Collection", desc: "NASA POWER, OpenWeather APIs and simulated IoT streams fetched continuously." },
  { title: "Normalization", desc: "Raw datasets cleaned, standardized, and stored in PostgreSQL via FastAPI." },
  { title: "ML Classification", desc: "Random Forest model classifies conditions into Low, Moderate, High, or Critical." },
  { title: "Alert Processing", desc: "FastAPI backend evaluates predictions and dispatches threshold-based alerts." },
  { title: "Visualization", desc: "Risk levels and maps surfaced to users via the React dashboard in real time." },
];

/* ── Partners ──────────────────────────────────────────────── */
export const PARTNERS = [
  "Rwanda Water Resources Board",
  "Meteo Rwanda",
  "MINEMA",
  "University of Rwanda",
  "NASA POWER",
  "OpenWeather API",
  "RISA",
  "UNDRR",
];

/* ── FAQs ──────────────────────────────────────────────────── */
export const FAQS = [
  {
    q: "What is the Rwanda Resilience Hub?",
    a: "RRH is a full-stack flood risk prediction platform built as a capstone project at the University of Rwanda. It combines satellite data, simulated IoT sensor streams, and machine learning to deliver localized flood risk estimates.",
  },
  {
    q: "Who built this platform?",
    a: "RRH was designed and built by Benitha NGUNGA (backend, ML pipeline, data ingestion) and Yvette Tuyizere (frontend, UI/UX, routing, dashboard). Supervised by Mr. Dieudonne Ukurikiyeyesu and Mr. Omar Sinayobye.",
  },
  {
    q: "How are flood risk levels calculated?",
    a: "Risk levels — Low, Moderate, High, Critical — are predicted by a Random Forest model trained on historical rainfall, river level, humidity, and soil moisture data. Predictions update every 15–30 minutes.",
  },
  {
    q: "Who is the platform for?",
    a: "Disaster management personnel, meteorological agencies (Meteo Rwanda, RWB), MINEMA stakeholders, and community members wanting timely flood risk information.",
  },
  {
    q: "How does email verification work?",
    a: "After registration a 6-digit code is sent to your email. Enter it within 5 minutes to activate your account. You can request a new code if it expires.",
  },
  {
    q: "How current is the data?",
    a: "Environmental data is ingested continuously from external APIs and sensor streams. The ML engine re-classifies risk approximately every 15–30 minutes.",
  },
  {
    q: "How do I contact the team?",
    a: "Contact support through the platform contact form or Help Centre.",
  },
];

/* ── Chart data — Sebeya River Basin (Rubavu) ───────────────── */
export const RAINFALL_DATA = [
  { day: "Mon", mm: 38 },
  { day: "Tue", mm: 52 },
  { day: "Wed", mm: 44 },
  { day: "Thu", mm: 71 },
  { day: "Fri", mm: 85 },
  { day: "Sat", mm: 68 },
  { day: "Sun", mm: 52 },
];

/* Sebeya River downstream (SEBY-DS-03) water level — last 24h */
export const RIVER_DATA = [
  { t: "00:00", v: 1.4 },
  { t: "04:00", v: 1.7 },
  { t: "08:00", v: 2.0 },
  { t: "12:00", v: 2.3 },
  { t: "16:00", v: 2.6 },
  { t: "20:00", v: 2.8 },
  { t: "Now",   v: 2.8 },
];

/* Random Forest accuracy — NASA POWER training, 2010–2023 */
export const ML_HISTORY = [
  { date: "Mon", acc: 88.0 },
  { date: "Tue", acc: 90.2 },
  { date: "Wed", acc: 89.7 },
  { date: "Thu", acc: 91.0 },
  { date: "Fri", acc: 91.4 },
  { date: "Sat", acc: 91.4 },
  { date: "Sun", acc: 91.4 },
];

/* ── Dashboard alerts — Sebeya River Basin ─────────────────── */
export const ALERTS = [
  {
    lvl: "crit" as const,
    title: "CRITICAL — SEBY-DS-03 Downstream (Kanama/Rubavu)",
    desc: "Water level 2.8m exceeds 2.5m critical threshold. ML confidence 91%. Riverside communities in Kanama sector advised to evacuate immediately.",
    zone: "Rubavu District",
    time: "2 min ago",
  },
  {
    lvl: "high" as const,
    title: "HIGH ALERT — SEBY-MS-02 Midstream (Nyundo)",
    desc: "Rainfall 68mm/h approaching 70mm/h critical threshold. River level 2.1m and rising. Downstream impact expected within 2–3 hours.",
    zone: "Rubavu District",
    time: "5 min ago",
  },
  {
    lvl: "mod" as const,
    title: "MODERATE — SEBY-US-01 Upstream (Rutsiro)",
    desc: "Upstream rainfall 52mm/h sustained. River at 1.4m — stable but trending upward. Monitor for rapid increase.",
    zone: "Rutsiro District",
    time: "8 min ago",
  },
];

