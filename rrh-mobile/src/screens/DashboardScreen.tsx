import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";

const RISK_COLOR: Record<string, string> = {
  CRITICAL: Colors.critical,
  HIGH:     Colors.high,
  MODERATE: Colors.moderate,
  LOW:      Colors.low,
};

const RISK_SCORE: Record<string, number> = {
  CRITICAL: 91, HIGH: 74, MODERATE: 47, LOW: 18,
};

// Sebeya River — 3 virtual IoT sensors (SEBY-US-01, SEBY-MS-02, SEBY-DS-03)
const MOCK_ZONES = [
  { id: 1, name: "SEBY-DS-03 — Kanama",  region: "Downstream · Rubavu",  level: "CRITICAL", score: 91, rainfall: "85mm/h", river: "2.8m" },
  { id: 2, name: "SEBY-MS-02 — Nyundo",  region: "Midstream · Rubavu",   level: "HIGH",     score: 74, rainfall: "68mm/h", river: "2.1m" },
  { id: 3, name: "SEBY-US-01 — Rutsiro", region: "Upstream · Rutsiro",   level: "MODERATE", score: 47, rainfall: "52mm/h", river: "1.4m" },
];

const STATS = [
  { label: "Active Alerts",  value: "2",     color: Colors.critical },
  { label: "IoT Sensors",    value: "3",     color: Colors.navyMid  },
  { label: "ML Accuracy",    value: "91.4%", color: Colors.low      },
  { label: "Data Refresh",   value: "15m",   color: Colors.primary  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen() {
  const [zones, setZones]           = useState(MOCK_ZONES);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState<{ full_name?: string; email?: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const me = await apiService.getMe();
      setUser(me);
    } catch { /* use defaults */ }

    try {
      const data = await apiService.getSensors();
      if (Array.isArray(data) && data.length) {
        const mapped = data.map((s: any, i: number) => ({
          id: i + 1,
          name: s.id ?? s.name,
          region: `${s.position ?? ""} · ${s.river_basin ?? "Sebeya"}`.replace(/^\s*·\s*/, ""),
          level: (s.risk_level ?? "LOW").toUpperCase(),
          score: RISK_SCORE[(s.risk_level ?? "LOW").toUpperCase()] ?? 30,
          rainfall: `${s.last_reading?.rainfall ?? 0}mm/h`,
          river: `${s.last_reading?.water_level ?? 0}m`,
        }));
        setZones(mapped);
      }
    } catch { /* keep mock */ }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const criticalCount = zones.filter(z => z.level === "CRITICAL").length;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{greeting()}</Text>
          <Text style={s.username}>{user?.full_name || "Analyst"}</Text>
          <Text style={s.location}>Sebeya River · Rubavu District</Text>
        </View>
        {criticalCount > 0 && (
          <View style={s.critBadge}>
            <Text style={s.critText}>{criticalCount} CRITICAL</Text>
          </View>
        )}
      </View>

      {/* Stats strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsRow}>
        {STATS.map((st) => (
          <View key={st.label} style={s.statCard}>
            <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLbl}>{st.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Critical threshold notice */}
      <View style={s.thresholdBanner}>
        <Text style={s.thresholdText}>
          ⚠ Critical thresholds: water level &gt; 2.5m · rainfall &gt; 70mm/h
        </Text>
      </View>

      {/* Section title */}
      <Text style={s.sectionTitle}>Sebeya River — IoT Sensors</Text>
      <Text style={s.sectionSub}>SEBY-US-01 · SEBY-MS-02 · SEBY-DS-03 · pull to refresh</Text>

      {/* Sensor cards */}
      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
        : zones.map((z) => (
          <View key={z.id} style={[s.zoneCard, { borderLeftColor: RISK_COLOR[z.level] ?? Colors.n400 }]}>
            <View style={s.zoneTop}>
              <View style={{ flex: 1 }}>
                <Text style={s.zoneName}>{z.name}</Text>
                <Text style={s.zoneRegion}>{z.region}</Text>
              </View>
              <View style={[s.levelBadge, { backgroundColor: RISK_COLOR[z.level] ?? Colors.n400 }]}>
                <Text style={s.levelText}>{z.level}</Text>
              </View>
            </View>
            <View style={s.zoneMetrics}>
              <MetricPill icon="🌧️" label="Rainfall" value={z.rainfall} />
              <MetricPill icon="💧" label="River"    value={z.river} />
              <MetricPill icon="📊" label="Score"    value={`${z.score}%`} />
            </View>
            <View style={s.scoreBarTrack}>
              <View style={[s.scoreBarFill, {
                width: `${z.score}%` as any,
                backgroundColor: RISK_COLOR[z.level] ?? Colors.n400,
              }]} />
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

function MetricPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={mp.pill}>
      <Text style={mp.icon}>{icon}</Text>
      <Text style={mp.val}>{value}</Text>
      <Text style={mp.lbl}>{label}</Text>
    </View>
  );
}

const mp = StyleSheet.create({
  pill: { alignItems: "center", marginRight: 16 },
  icon: { fontSize: 14, marginBottom: 2 },
  val:  { fontSize: 14, fontWeight: "700", color: Colors.n900 },
  lbl:  { fontSize: 11, color: Colors.n500 },
});

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 32 },

  header:   { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  greeting: { fontSize: 13, color: Colors.n500 },
  username: { fontSize: 20, fontWeight: "700", color: Colors.n900, marginBottom: 2 },
  location: { fontSize: 12, color: Colors.primary, fontWeight: "600" },

  critBadge: { backgroundColor: Colors.critical, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  critText:  { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  statsRow: { marginBottom: 14 },
  statCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginRight: 12,
    minWidth: 100, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statVal: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  statLbl: { fontSize: 11, color: Colors.n500, textAlign: "center" },

  thresholdBanner: { backgroundColor: "#FFF3CD", borderRadius: 8, padding: 10, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: "#f59e0b" },
  thresholdText:   { fontSize: 12, color: "#92400e", fontWeight: "600" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.n900, marginBottom: 2 },
  sectionSub:   { fontSize: 12, color: Colors.n500, marginBottom: 12 },

  zoneCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  zoneTop:    { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  zoneName:   { fontSize: 15, fontWeight: "700", color: Colors.n900, marginBottom: 2 },
  zoneRegion: { fontSize: 12, color: Colors.n500 },
  levelBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  levelText:  { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },

  zoneMetrics:   { flexDirection: "row", marginBottom: 12 },
  scoreBarTrack: { height: 4, backgroundColor: Colors.n100, borderRadius: 2, overflow: "hidden" },
  scoreBarFill:  { height: "100%", borderRadius: 2 },
});
