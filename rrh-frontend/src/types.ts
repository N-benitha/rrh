/* ─── RRH shared types ─── */

export type Page =
  | "landing"
  | "login"
  | "register"
  | "forgot"
  | "verify"
  | "help"
  | "about"
  | "dashboard";

export interface PageProps {
  setPage: (p: Page) => void;
}

/* ── Risk levels ──────────────────── */
export type RiskLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

/* ── Zone interface ───────────────── */
export interface Zone {
  id: number;
  name: string;
  region: string;
  lat: number;
  lng: number;
  level: RiskLevel;
  rainfall: string;
  river: string;
  score: number;
  trend: "up" | "dn" | "st";
  updated: string;
  desc: string;
}

/* ── Dashboard types ───────────────── */
export interface StatCardItem {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  type: "alert" | "zone" | "accuracy" | "rainfall";
}

export interface Alert {
  level: "critical" | "high" | "moderate" | "low";
  title: string;
  description: string;
  zone: string;
  time: string;
}