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

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(apiService.isAuthenticated());
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

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
  total_users: number;
  total_predictions: number;
  total_alerts: number;
  predictions_by_risk_level: Record<string, number>;
  alerts_by_status: Record<string, number>;
  total_sensor_readings: number;
  regions_count: number;
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertResult, regionResult] = await Promise.allSettled([
        apiService.getAlerts(),
        apiService.getZones(),
      ]);

      // Build region_id → name lookup; silently ignored if regions fetch fails
      const regionMap = new Map<string, string>();
      if (regionResult.status === "fulfilled" && Array.isArray(regionResult.value)) {
        for (const r of regionResult.value as { id: string; name: string }[]) {
          regionMap.set(r.id, r.name);
        }
      }

      if (alertResult.status === "rejected") {
        throw alertResult.reason;
      }

      const data = alertResult.value;
      if (Array.isArray(data) && data.length > 0) {
        const titleMap: Record<string, string> = {
          critical: "Critical Flood Risk Alert",
          high: "High Flood Risk Alert",
          moderate: "Moderate Flood Risk Warning",
          low: "Low Flood Risk Notice",
        };
        setAlerts(
          data.map((a) => {
            const level = _LVL_MAP[a.risk_level.toLowerCase()] ?? "low";
            return {
              id: a.id,
              level,
              title: titleMap[level] ?? "Flood Risk Alert",
              description: a.message,
              zone: regionMap.get(a.region_id) ?? a.region_id,
              time: new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: a.status,
            };
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const markRead = useCallback(async (alertId: string) => {
    try {
      await apiService.markAlertRead(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      // keep alert visible if API call fails
    }
  }, []);

  return { alerts, loading, error, refresh: load, markRead };
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

// ── ML Predictions ────────────────────────────────────────────────────────

export interface PredictionResult {
  regionId: string;
  regionName: string;
  risk_level: string;
  confidence: number; // 0–1 from API
  timestamp: string;
}

export function usePredictions() {
  return useFetch<PredictionResult[]>(async () => {
    const regions = await apiService.getZones() as { id: string; name: string }[];
    if (!Array.isArray(regions) || regions.length === 0) return [];

    const results = await Promise.allSettled(
      regions.map((r) =>
        apiService.getPrediction(r.id).then((pred) => ({
          regionId: r.id,
          regionName: r.name,
          risk_level: pred.risk_level,
          confidence: pred.confidence,
          timestamp: pred.timestamp,
        }))
      )
    );

    return results
      .filter((r): r is PromiseFulfilledResult<PredictionResult> => r.status === "fulfilled")
      .map((r) => r.value);
  });
}

// ── Auth / role ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  email_alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useIsAdmin() {
  const { data: profile, loading } = useFetch<UserProfile>(() => apiService.getProfile());
  return { isAdmin: profile?.role === "admin", loading, profile };
}

// ── Subscriptions ─────────────────────────────────────────────────────────

export interface SubscriptionItem {
  id: string;
  region_id: string;
  region_name: string;
  created_at: string;
}

export function useSubscriptions() {
  return useFetch<SubscriptionItem[]>(() => apiService.getSubscriptions());
}

// ── Region detail (for non-admin stat cards) ──────────────────────────────

export interface RegionDetail {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  risk_level: string;
  latest_prediction: {
    id: string;
    region_id: string;
    risk_level: string;
    confidence_score: number;
    model_version: string;
    predicted_at: string;
  } | null;
}

export function useRegionDetail(regionId: string | null) {
  return useFetch<RegionDetail | null>(
    () => regionId ? (apiService.getZoneDetail(regionId) as Promise<RegionDetail>) : Promise.resolve(null),
    [regionId]
  );
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
