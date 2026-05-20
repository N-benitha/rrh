import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";
import { drainQueue } from "../services/notificationQueue";

const fmtTime = (minsAgo: number) => {
  const d = new Date(Date.now() - minsAgo * 60000);
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

// Fallback mock used only when backend is unreachable
const makeSebeyaAlerts = (): AlertItem[] => [
  {
    id: 1, lvl: "crit",
    zone: "SEBY-DS-03 — Kanama/Rubavu",
    title: "CRITICAL — Downstream Water Level",
    desc: "Water level 2.8m exceeds the 2.5m critical threshold at SEBY-DS-03. Evacuation of riverside communities in Kanama sector required immediately.",
    time: fmtTime(2),
  },
  {
    id: 2, lvl: "high",
    zone: "SEBY-MS-02 — Nyundo",
    title: "HIGH — Rainfall Approaching Critical",
    desc: "Rainfall 68mm/h at SEBY-MS-02, approaching 70mm/h critical threshold. River level 2.1m and rising. Downstream impact expected within 2–3 hours.",
    time: fmtTime(5),
  },
  {
    id: 3, lvl: "mod",
    zone: "SEBY-US-01 — Rutsiro",
    title: "MODERATE — Upstream Rainfall",
    desc: "Sustained rainfall 52mm/h upstream at SEBY-US-01. River level 1.4m — stable but trending upward. Monitor for rapid increase.",
    time: fmtTime(8),
  },
];

const LVL_COLOR: Record<string, string> = {
  crit:     Colors.critical,
  critical: Colors.critical,
  high:     Colors.high,
  mod:      Colors.moderate,
  moderate: Colors.moderate,
  low:      Colors.low,
};
const LVL_KEY: Record<string, string> = {
  crit: "crit", critical: "crit",
  high: "high",
  mod: "mod", moderate: "mod",
  low: "low",
};
const LVL_LABEL: Record<string, string> = {
  crit: "CRITICAL", high: "HIGH", mod: "MODERATE", low: "LOW",
};
const LVL_BG: Record<string, string> = {
  crit: "#fef2f2", high: "#fff7ed", mod: "#fefce8", low: "#f0fdf4",
};

export type AlertItem = {
  id: number | string;
  lvl: string;
  zone: string;
  title: string;
  desc: string;
  time: string;
  isWeb?: boolean;
};

export default function AlertsScreen() {
  // Web notifications pushed from the dashboard
  const [webAlerts, setWebAlerts]       = useState<AlertItem[]>([]);
  // Sensor-based alerts from the API
  const [sensorAlerts, setSensorAlerts] = useState<AlertItem[]>([]);
  const [allNormal, setAllNormal]       = useState(false);
  const [filter, setFilter]             = useState<string>("all");
  const [refreshing, setRefreshing]     = useState(false);
  const [source, setSource]             = useState("Sebeya Sensors");

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await apiService.getWeatherAlerts();
      if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
        const mapped: AlertItem[] = data.alerts.map((a: any, i: number) => ({
          id:  a.id ?? i,
          lvl: LVL_KEY[a.level?.toLowerCase()] ?? "low",
          zone:  a.zone ?? "Sebeya",
          title: a.title ?? "Alert",
          desc:  a.description ?? "",
          time:  a.time ?? "",
        }));
        const hasAlert = mapped.some(a => a.lvl !== "low");
        if (hasAlert) {
          setSensorAlerts(mapped);
          setAllNormal(false);
        } else {
          setSensorAlerts([]);
          setAllNormal(true);
        }
        setSource("OpenWeather Live");
      } else {
        // API returned nothing — show demo data
        setSensorAlerts(makeSebeyaAlerts());
        setAllNormal(false);
      }
    } catch {
      // Backend unreachable — show demo data
      setSensorAlerts(makeSebeyaAlerts());
      setAllNormal(false);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // While this tab is focused: drain queue immediately, then every 5 s
  useFocusEffect(
    useCallback(() => {
      const drain = () => {
        const queued = drainQueue();
        if (queued.length === 0) return;
        setWebAlerts(prev => [...queued, ...prev]);
        const urgent = queued.find(n => n.lvl === "crit" || n.lvl === "high");
        if (urgent) Alert.alert(urgent.title, urgent.desc, [{ text: "OK" }]);
      };
      drain(); // immediate on focus
      const id = setInterval(drain, 5_000);
      return () => clearInterval(id);
    }, [])
  );

  const onRefresh = () => { load(true); };

  // Sensor alerts respect filter; web alerts always show at top
  const filteredSensor = filter === "all"
    ? sensorAlerts
    : sensorAlerts.filter(a => (LVL_KEY[a.lvl] ?? a.lvl) === filter);

  const renderAlert = ({ item }: { item: AlertItem }) => {
    const key = LVL_KEY[item.lvl] ?? item.lvl;
    return (
      <View style={[
        s.card,
        { backgroundColor: LVL_BG[key] ?? "#fff", borderLeftColor: LVL_COLOR[item.lvl] ?? Colors.n400 },
        item.isWeb && s.webCard,
      ]}>
        <View style={s.cardTop}>
          <View style={[s.badge, { backgroundColor: LVL_COLOR[item.lvl] ?? Colors.n400 }]}>
            <Text style={s.badgeText}>{LVL_LABEL[key] ?? item.lvl.toUpperCase()}</Text>
          </View>
          <Text style={s.time}>{item.time}</Text>
        </View>
        <Text style={s.alertTitle}>{item.title}</Text>
        <Text style={s.zone}>{item.zone}</Text>
        <Text style={s.desc}>{item.desc}</Text>
      </View>
    );
  };

  return (
    <View style={s.root}>
      {/* Source badge */}
      <View style={s.sourceBanner}>
        <Text style={s.sourceBannerText}>
          {source === "OpenWeather Live" ? "● Live from OpenWeather" : "● Sebeya River · 3 sensor stations"}
        </Text>
      </View>

      {/* Filter pills */}
      <View style={s.filterRow}>
        {["all", "crit", "high", "mod", "low"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterBtn, filter === f && s.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f === "all" ? "All" : LVL_LABEL[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={[...webAlerts, ...filteredSensor]}
        keyExtractor={(a) => String(a.id)}
        renderItem={renderAlert}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          webAlerts.length > 0 ? (
            <View style={s.sectionHeader}>
              <Text style={s.sectionHeaderText}>📱 Dashboard Notifications</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          allNormal ? (
            <View style={s.normalBox}>
              <Text style={s.normalIcon}>✅</Text>
              <Text style={s.normalTitle}>All Sensors Normal</Text>
              <Text style={s.normalSub}>
                No flood risk detected across all 3 Sebeya River monitoring stations.
                {"\n"}SEBY-DS-03 · SEBY-MS-02 · SEBY-US-01
              </Text>
            </View>
          ) : (
            <Text style={s.empty}>No alerts for this level.</Text>
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  sourceBanner: { backgroundColor: Colors.navy, paddingHorizontal: 14, paddingVertical: 6 },
  sourceBannerText: { color: "rgba(255,255,255,.65)", fontSize: 11, fontWeight: "600" },

  filterRow:        { flexDirection: "row", padding: 12, gap: 8, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: Colors.n200, flexWrap: "wrap" },
  filterBtn:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.n200, backgroundColor: Colors.n50 },
  filterActive:     { backgroundColor: Colors.navy, borderColor: Colors.navy },
  filterText:       { fontSize: 12, fontWeight: "600", color: Colors.n700 },
  filterTextActive: { color: "#fff" },

  list: { padding: 12, paddingBottom: 32 },

  sectionHeader: {
    backgroundColor: "#1e3a5f", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
  },
  sectionHeaderText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  card: {
    borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  webCard: { borderStyle: "solid", borderWidth: 1, borderColor: "#bfdbfe", borderLeftWidth: 4 },
  cardTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  badge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:  { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  time:       { fontSize: 12, color: Colors.n400 },
  alertTitle: { fontSize: 15, fontWeight: "700", color: Colors.n900, marginBottom: 2 },
  zone:       { fontSize: 12, color: Colors.navyMid, fontWeight: "600", marginBottom: 6 },
  desc:       { fontSize: 13, color: Colors.n700, lineHeight: 19 },

  normalBox:   { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  normalIcon:  { fontSize: 48, marginBottom: 16 },
  normalTitle: { fontSize: 18, fontWeight: "700", color: "#059669", marginBottom: 8 },
  normalSub:   { fontSize: 13, color: Colors.n400, textAlign: "center", lineHeight: 20 },

  empty: { textAlign: "center", color: Colors.n400, marginTop: 40, fontSize: 14 },
});
