import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";

interface WeatherData {
  level: string;
  rainfall_mm: number;
  humidity_pct: number;
  temperature_c: number;
  description: string;
  time: string;
}

interface SensorReading {
  id: string;
  position: string;
  risk_level: string;
  water_level: number;
  rainfall: number;
  humidity: number;
  temperature: number;
}

const LEVEL_COLOR: Record<string, string> = {
  critical: Colors.critical,
  high:     Colors.high,
  moderate: Colors.moderate,
  low:      Colors.low,
};
const LEVEL_LABEL: Record<string, string> = {
  critical: "CRITICAL", high: "HIGH", moderate: "MODERATE", low: "LOW",
};

// Static fallback when backend / OpenWeather is unavailable
const FALLBACK_WEATHER: WeatherData = {
  level: "high",
  rainfall_mm: 68.0,
  humidity_pct: 85,
  temperature_c: 20.5,
  description: "Sustained heavy rainfall over the Sebeya catchment. River levels rising at midstream and downstream stations.",
  time: "—",
};

const FALLBACK_SENSORS: SensorReading[] = [
  { id: "SEBY-DS-03", position: "Downstream · Kanama/Rubavu", risk_level: "CRITICAL", water_level: 2.8, rainfall: 85.0, humidity: 92, temperature: 20.2 },
  { id: "SEBY-MS-02", position: "Midstream · Nyundo",         risk_level: "HIGH",     water_level: 2.1, rainfall: 68.0, humidity: 85, temperature: 20.8 },
  { id: "SEBY-US-01", position: "Upstream · Rutsiro",         risk_level: "MODERATE", water_level: 1.4, rainfall: 52.0, humidity: 76, temperature: 21.5 },
];

export default function WeatherScreen() {
  const [weather, setWeather]       = useState<WeatherData | null>(null);
  const [sensors, setSensors]       = useState<SensorReading[]>(FALLBACK_SENSORS);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt]   = useState("");
  const [liveSource, setLiveSource] = useState(false);

  const load = useCallback(async () => {
    // Try live weather for Sebeya (zone="Rubavu")
    try {
      const data = await apiService.getWeatherAlerts();
      if (data.alerts && Array.isArray(data.alerts)) {
        const sebeya = data.alerts.find((a: any) => a.zone === "Rubavu");
        if (sebeya) {
          setWeather({
            level:          sebeya.level,
            rainfall_mm:    sebeya.rainfall_mm,
            humidity_pct:   sebeya.humidity_pct,
            temperature_c:  sebeya.temperature_c,
            description:    sebeya.description,
            time:           sebeya.time,
          });
          setLiveSource(true);
        }
        if (data.fetched_at) {
          const d = new Date(data.fetched_at);
          setFetchedAt(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch { /* fall through */ }

    // Try live sensor readings
    try {
      const data = await apiService.getSensors();
      if (Array.isArray(data) && data.length) {
        const mapped: SensorReading[] = data.map((s: any) => ({
          id:          s.id,
          position:    `${s.position ?? ""} · ${s.name?.split("—")[1]?.trim() ?? ""}`,
          risk_level:  (s.risk_level ?? "low").toLowerCase(),
          water_level: s.last_reading?.water_level ?? 0,
          rainfall:    s.last_reading?.rainfall ?? 0,
          humidity:    s.last_reading?.humidity ?? 0,
          temperature: s.last_reading?.temperature ?? 0,
        }));
        setSensors(mapped);
      }
    } catch { /* keep fallback */ }

    if (!weather) setWeather(FALLBACK_WEATHER);
    setLoading(false);
    setRefreshing(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const wColor = LEVEL_COLOR[weather?.level ?? "low"] ?? Colors.n400;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Sebeya River Weather</Text>
          <Text style={s.headerSub}>Rubavu District · Northwest Rwanda</Text>
        </View>
        <View style={[s.sourceBadge, { backgroundColor: liveSource ? "#14532d" : Colors.navyMid }]}>
          <Text style={s.sourceBadgeText}>{liveSource ? "● LIVE" : "● STATIC"}</Text>
        </View>
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      {/* Main weather card */}
      {!loading && weather && (
        <View style={[wc.card, { borderColor: wColor }]}>
          <View style={[wc.banner, { backgroundColor: wColor }]}>
            <Text style={wc.bannerText}>
              {LEVEL_LABEL[weather.level] ?? weather.level.toUpperCase()} FLOOD RISK
            </Text>
          </View>

          <View style={wc.metricsRow}>
            <WeatherMetric icon="🌡️" label="Temperature" value={`${weather.temperature_c.toFixed(1)}°C`} />
            <WeatherMetric icon="🌧️" label="Rainfall"    value={`${weather.rainfall_mm.toFixed(1)} mm/h`} />
            <WeatherMetric icon="💧" label="Humidity"    value={`${weather.humidity_pct.toFixed(0)}%`} />
          </View>

          <View style={wc.divider} />
          <Text style={wc.desc}>{weather.description}</Text>

          <View style={wc.thresholdRow}>
            <ThresholdBar label="Rainfall" value={weather.rainfall_mm} threshold={70} unit="mm/h" color={wColor} />
          </View>

          {fetchedAt !== "" && (
            <Text style={wc.time}>⏱ Updated at {fetchedAt} UTC · OpenWeather</Text>
          )}
        </View>
      )}

      {/* 3 Sensor station readings */}
      <Text style={s.sectionTitle}>Sensor Station Readings</Text>
      <Text style={s.sectionSub}>SEBY-US-01 · SEBY-MS-02 · SEBY-DS-03</Text>

      {sensors.map((sensor) => {
        const color = LEVEL_COLOR[sensor.risk_level] ?? Colors.n400;
        const exceeds = sensor.water_level > 2.5;
        return (
          <View key={sensor.id} style={[sc.card, { borderLeftColor: color }]}>
            <View style={sc.top}>
              <View style={{ flex: 1 }}>
                <Text style={sc.sensorId}>{sensor.id}</Text>
                <Text style={sc.position}>{sensor.position}</Text>
              </View>
              <View style={[sc.badge, { backgroundColor: color }]}>
                <Text style={sc.badgeText}>{LEVEL_LABEL[sensor.risk_level] ?? sensor.risk_level.toUpperCase()}</Text>
              </View>
            </View>

            <View style={sc.metricsRow}>
              <SensorMetric label="Water Level" value={`${sensor.water_level.toFixed(1)}m`} highlight={exceeds} highlightColor={Colors.critical} />
              <SensorMetric label="Rainfall"    value={`${sensor.rainfall.toFixed(0)}mm/h`}    highlight={sensor.rainfall >= 70} highlightColor={Colors.critical} />
              <SensorMetric label="Humidity"    value={`${sensor.humidity.toFixed(0)}%`}        highlight={false} />
              <SensorMetric label="Temp"        value={`${sensor.temperature.toFixed(1)}°C`}    highlight={false} />
            </View>

            {exceeds && (
              <View style={sc.alertRow}>
                <Text style={sc.alertText}>⚠ Water level exceeds 2.5m critical threshold</Text>
              </View>
            )}
            {sensor.rainfall >= 70 && !exceeds && (
              <View style={sc.alertRow}>
                <Text style={sc.alertText}>⚠ Rainfall exceeds 70mm/h critical threshold</Text>
              </View>
            )}
          </View>
        );
      })}

      <Text style={s.footer}>
        Critical thresholds: water level &gt; 2.5m · rainfall &gt; 70mm/h · Pull to refresh
      </Text>
    </ScrollView>
  );
}

function WeatherMetric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={wm.wrap}>
      <Text style={wm.icon}>{icon}</Text>
      <Text style={wm.value}>{value}</Text>
      <Text style={wm.label}>{label}</Text>
    </View>
  );
}

function ThresholdBar({ label, value, threshold, unit, color }: { label: string; value: number; threshold: number; unit: string; color: string }) {
  const pct = Math.min(100, (value / (threshold * 1.5)) * 100);
  const exceeded = value >= threshold;
  return (
    <View style={tb.wrap}>
      <View style={tb.row}>
        <Text style={tb.label}>{label}: {value.toFixed(1)}{unit}</Text>
        <Text style={[tb.threshold, { color: exceeded ? Colors.critical : Colors.n400 }]}>
          {exceeded ? "⚠ EXCEEDS" : ""} threshold {threshold}{unit}
        </Text>
      </View>
      <View style={tb.track}>
        <View style={[tb.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
        <View style={[tb.marker, { left: `${(threshold / (threshold * 1.5)) * 100}%` as any }]} />
      </View>
    </View>
  );
}

function SensorMetric({ label, value, highlight, highlightColor }: { label: string; value: string; highlight: boolean; highlightColor?: string }) {
  return (
    <View style={sm.wrap}>
      <Text style={[sm.value, highlight && { color: highlightColor ?? Colors.critical }]}>{value}</Text>
      <Text style={sm.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 32 },

  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  headerTitle:  { fontSize: 20, fontWeight: "700", color: Colors.n900 },
  headerSub:    { fontSize: 12, color: Colors.n500, marginTop: 2 },
  sourceBadge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  sourceBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.n900, marginBottom: 2, marginTop: 20 },
  sectionSub:   { fontSize: 12, color: Colors.n500, marginBottom: 10 },

  footer: { textAlign: "center", fontSize: 11, color: Colors.n400, marginTop: 16 },
});

const wc = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 14, overflow: "hidden",
    borderWidth: 2, marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  banner:      { paddingVertical: 10, alignItems: "center" },
  bannerText:  { color: "#fff", fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  metricsRow:  { flexDirection: "row", justifyContent: "space-around", paddingVertical: 20 },
  divider:     { height: 1, backgroundColor: Colors.n100, marginHorizontal: 16 },
  desc:        { fontSize: 13, color: Colors.n600, padding: 14, lineHeight: 20 },
  thresholdRow:{ paddingHorizontal: 14, paddingBottom: 12 },
  time:        { fontSize: 11, color: Colors.n400, paddingHorizontal: 14, paddingBottom: 12 },
});

const sc = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  top:        { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  sensorId:   { fontSize: 12, fontWeight: "700", color: Colors.primary, letterSpacing: 0.5 },
  position:   { fontSize: 12, color: Colors.n500, marginTop: 2 },
  badge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText:  { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  metricsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  alertRow:   { backgroundColor: "#fef2f2", borderRadius: 6, padding: 8, marginTop: 8 },
  alertText:  { fontSize: 12, color: Colors.critical, fontWeight: "600" },
});

const wm = StyleSheet.create({
  wrap:  { alignItems: "center" },
  icon:  { fontSize: 22, marginBottom: 6 },
  value: { fontSize: 18, fontWeight: "800", color: Colors.n900, marginBottom: 2 },
  label: { fontSize: 11, color: Colors.n500 },
});

const sm = StyleSheet.create({
  wrap:  { alignItems: "center", flex: 1 },
  value: { fontSize: 14, fontWeight: "700", color: Colors.n900 },
  label: { fontSize: 10, color: Colors.n500 },
});

const tb = StyleSheet.create({
  wrap:      { marginBottom: 4 },
  row:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label:     { fontSize: 12, color: Colors.n700, fontWeight: "600" },
  threshold: { fontSize: 11, fontWeight: "600" },
  track:     { height: 6, backgroundColor: Colors.n100, borderRadius: 3, overflow: "visible" },
  fill:      { height: "100%", borderRadius: 3 },
  marker:    { position: "absolute", top: -3, width: 2, height: 12, backgroundColor: Colors.critical, borderRadius: 1 },
});
