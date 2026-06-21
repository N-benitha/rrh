/* ─── RRH Shared Constants & Data ─── */
import type { Zone, RiskLevel } from "./types";

/* ── Zone data ──────────────────────────────────────────────── */
export const ZONES: Zone[] = [
  {
    id: 1,
    regionId: '1',
    name: "Nyabugogo Wetland",
    region: "Kigali City",
    lat: -1.9441,
    lng: 30.0619,
    level: "CRITICAL",
    rainfall: "142mm",
    river: "4.8m",
    score: 92,
    trend: "up",
    updated: "2m ago",
    desc: "High runoff, impermeable surfaces.",
  },
  {
    id: 2,
    regionId: '2',
    name: "Sebeya River Basin",
    region: "Rubavu District",
    lat: -1.68,
    lng: 29.38,
    level: "HIGH",
    rainfall: "98mm",
    river: "3.2m",
    score: 75,
    trend: "up",
    updated: "5m ago",
    desc: "Approaching flood stage.",
  },
  {
    id: 3,
    regionId: '3',
    name: "Nyabarongo River",
    region: "Central Rwanda",
    lat: -2.15,
    lng: 29.95,
    level: "MODERATE",
    rainfall: "61mm",
    river: "2.1m",
    score: 48,
    trend: "st",
    updated: "11m ago",
    desc: "Moderate threshold approaching.",
  },
  {
    id: 4,
    regionId: '4',
    name: "Kigali Urban Zone",
    region: "Gasabo District",
    lat: -1.9706,
    lng: 30.1044,
    level: "HIGH",
    rainfall: "87mm",
    river: "2.9m",
    score: 71,
    trend: "dn",
    updated: "3m ago",
    desc: "Reduced water infiltration.",
  },
  {
    id: 5,
    regionId: '5',
    name: "Akagera Wetlands",
    region: "Eastern Province",
    lat: -1.87,
    lng: 30.65,
    level: "LOW",
    rainfall: "28mm",
    river: "1.1m",
    score: 18,
    trend: "dn",
    updated: "18m ago",
    desc: "Stable baseline zone.",
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

/* ── Chart data ──────────────────────────────────────────── */
export const RAINFALL_DATA = [
  { day: "Mon", mm: 42 },
  { day: "Tue", mm: 68 },
  { day: "Wed", mm: 55 },
  { day: "Thu", mm: 98 },
  { day: "Fri", mm: 142 },
  { day: "Sat", mm: 87 },
  { day: "Sun", mm: 61 },
];

export const RIVER_DATA = [
  { t: "00:00", v: 2.1 },
  { t: "04:00", v: 2.4 },
  { t: "08:00", v: 2.8 },
  { t: "12:00", v: 3.4 },
  { t: "16:00", v: 4.2 },
  { t: "20:00", v: 4.8 },
  { t: "Now", v: 4.8 },
];

export const ML_HISTORY = [
  { date: "Mon", acc: 88 },
  { date: "Tue", acc: 90 },
  { date: "Wed", acc: 89 },
  { date: "Thu", acc: 91 },
  { date: "Fri", acc: 91 },
  { date: "Sat", acc: 92 },
  { date: "Sun", acc: 91 },
];


