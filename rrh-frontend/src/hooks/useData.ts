import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { ZONES, ALERTS, RAINFALL_DATA, RIVER_DATA, ML_HISTORY } from "../constants";
import type { Zone } from "../types";

// ── Generic fetcher ────────────────────────────────────────────────────────

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  institution?: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(apiService.isAuthenticated());
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    apiService.setAuthToken(response.access_token);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = () => {
    apiService.clearAuth();
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
}

// ── Dashboard overview data ────────────────────────────────────────────────

export interface DashboardStats {
  active_alerts: number;
  critical_zones: number;
  ml_accuracy_pct: number;
  avg_rainfall_mm: number;
}

export function useDashboardStats() {
  return useFetch<DashboardStats>(() => apiService.getDashboard());
}

// ── Zones ─────────────────────────────────────────────────────────────────

export function useZones() {
  const [zones, setZones] = useState<Zone[]>(ZONES);   // start with mock data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .getZones()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setZones(data as Zone[]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { zones, loading, error };
}

// ── Alerts ────────────────────────────────────────────────────────────────

export interface AlertItem {
  id?: string;
  level: "critical" | "high" | "moderate" | "low";
  title: string;
  description: string;
  zone: string;
  time: string;
  status?: string;
}

const _LVL_MAP: Record<string, AlertItem["level"]> = {
  crit: "critical",
  critical: "critical",
  high: "high",
  mod: "moderate",
  moderate: "moderate",
  low: "low",
};

function _mockAlerts(): AlertItem[] {
  return ALERTS.map((a) => ({
    level: _LVL_MAP[a.lvl] ?? "low",
    title: a.title,
    description: a.desc,
    zone: a.zone,
    time: a.time,
  }));
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>(_mockAlerts());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("mock");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try live weather alerts first
      const weatherRes = await apiService.getWeatherAlerts();
      if (weatherRes.alerts && weatherRes.alerts.length > 0) {
        setAlerts(
          weatherRes.alerts.map((a) => ({
            id: a.id,
            level: _LVL_MAP[a.level] ?? "low",
            title: a.title,
            description: a.description,
            zone: a.zone,
            time: a.time,
            status: a.status,
          }))
        );
        setSource(weatherRes.source || "OpenWeather Live");
        return;
      }
    } catch {
      // fall through to backend alerts
    }

    try {
      // Fall back to backend /alerts endpoint
      const data = await apiService.getAlerts();
      if (Array.isArray(data) && data.length > 0) {
        setAlerts(
          (data as Record<string, unknown>[]).map((a, i) => ({
            id: String(a.id ?? i),
            level: _LVL_MAP[String(a.severity ?? a.level ?? "low")] ?? "low",
            title: a.title as string,
            description: (a.message ?? a.description ?? "") as string,
            zone: Array.isArray(a.affected_areas)
              ? (a.affected_areas as string[])[0]
              : (a.zone as string) ?? "Rwanda",
            time: a.created_at
              ? new Date(a.created_at as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : (a.time as string) ?? "",
            status: (a.status as string) ?? "active",
          }))
        );
        setSource("backend");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { alerts, loading, error, source, refresh: load };
}

// ── Analytics ─────────────────────────────────────────────────────────────

interface AnalyticsData {
  rainfall: { day: string; mm: number }[];
  river: { t: string; v: number }[];
  ml_history: { date: string; acc: number }[];
  risk_distribution: Record<string, number>;
}

export function useAnalytics(range: "1d" | "7d" | "30d" = "7d") {
  const [data, setData] = useState<AnalyticsData>({
    rainfall: RAINFALL_DATA.map((d) => ({ day: d.day, mm: d.mm })),
    river: RIVER_DATA,
    ml_history: ML_HISTORY.map((h) => ({ date: h.date, acc: h.acc })),
    risk_distribution: { LOW: 1, MODERATE: 1, HIGH: 2, CRITICAL: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .getAnalytics(range)
      .then((result) => {
        if (result) {
          const r = result as unknown as AnalyticsData;
          setData((prev) => ({
            rainfall: r.rainfall?.length ? r.rainfall : prev.rainfall,
            river: r.river?.length ? r.river : prev.river,
            ml_history: r.ml_history?.length ? r.ml_history : prev.ml_history,
            risk_distribution: r.risk_distribution || prev.risk_distribution,
          }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [range]);

  return { data, loading, error };
}

// ── ML Basin Predictions ──────────────────────────────────────────────────

export interface BasinPrediction {
  basin: string;
  zone: string;
  risk_level: "low" | "medium" | "high";
  confidence: number;
  model_type: string;
  features: {
    rainfall_24h: number;
    water_level: number;
    humidity: number;
    soil_saturation: number;
  };
}

export function usePredictions() {
  return useFetch<{
    predictions: BasinPrediction[];
    weather_source: string;
    model_version: string;
    fetched_at: string;
  }>(() => apiService.getBasinPredictions());
}

// ── Local storage ──────────────────────────────────────────────────────────

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // ignore
    }
  };

  return [storedValue, setValue] as const;
}
