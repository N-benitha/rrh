import dayjs from "dayjs";
import type { Zone } from "../types";

export const FORMATS = {
  default: "MMM DD, YYYY h:mm A",
  dateOnly: "MMM DD, YYYY",
  timeOnly: "h:mm A",
  iso: "YYYY-MM-DD",
  full: "MMMM DD, YYYY h:mm:ss A",
} as const;

export function formatDateTime(
  date: Date | string | number | undefined,
  format: keyof typeof FORMATS | string = "default",
): string {
  if (!date) return "";
  try {
    const d = dayjs(date);
    const formatString = format in FORMATS ? FORMATS[format as keyof typeof FORMATS] : format;
    return d.isValid() ? d.format(formatString) : "";
  } catch {
    return "";
  }
}

// Color utilities
export const getRiskColor = (level: string): string => {
  const colors: { [key: string]: string } = {
    CRITICAL: "#DC2626",
    HIGH: "#F97316",
    MODERATE: "#EAB308",
    LOW: "#059669",
  };
  return colors[level] || "#6B7280";
};

// Format utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
};

// Number utilities
export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatPercentage = (num: number): string => {
  return `${Math.round(num)}%`;
};

// Risk calculation
export const calculateAverageRisk = (zones: Zone[]): number => {
  if (zones.length === 0) return 0;
  return Math.round(zones.reduce((sum, z) => sum + (z.score || 0), 0) / zones.length);
};

// Storage utilities
export const saveToStorage = (key: string, data: unknown): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromStorage = (key: string): unknown => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const clearStorage = (key?: string): void => {
  if (key) {
    localStorage.removeItem(key);
  } else {
    localStorage.clear();
  }
};
