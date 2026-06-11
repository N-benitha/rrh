import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, Callout, PROVIDER_DEFAULT } from "react-native-maps";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";

const BASE_sensors = [
  { id: "SEBY-DS-03", place: "Kanama",  district: "Rubavu District",  position: "Downstream", lat: -1.6849, lng: 29.3892 },
  { id: "SEBY-MS-02", place: "Nyundo",  district: "Rubavu District",  position: "Midstream",  lat: -1.5554, lng: 29.5375 },
  { id: "SEBY-US-01", place: "Rutsiro", district: "Rutsiro District", position: "Upstream",   lat: -1.3954, lng: 29.4849 },
];

const MOCK_sensors = [
  { ...BASE_sensors[0], level: "CRITICAL", water: "2.8m", rainfall: "85mm/h", note: "Exceeds 2.5m critical threshold",        color: "#dc2626" },
  { ...BASE_sensors[1], level: "HIGH",     water: "2.1m", rainfall: "68mm/h", note: "Approaching 70mm/h critical threshold",  color: "#ea580c" },
  { ...BASE_sensors[2], level: "MODERATE", water: "1.4m", rainfall: "52mm/h", note: "Rising trend — monitor closely",         color: "#ca8a04" },
];

// Approximate Sebeya River path (upstream → Lake Kivu)
const RIVER_PATH = [
  { latitude: -1.3954, longitude: 29.4849 },
  { latitude: -1.4400, longitude: 29.4600 },
  { latitude: -1.4900, longitude: 29.4400 },
  { latitude: -1.5554, longitude: 29.5375 },
  { latitude: -1.6000, longitude: 29.4800 },
  { latitude: -1.6400, longitude: 29.4200 },
  { latitude: -1.6849, longitude: 29.3892 },
];

const LEVEL_COLOR: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MODERATE: "#ca8a04",
  LOW: "#16a34a",
};

const CENTER = {
  latitude: -1.54,
  longitude: 29.44,
  latitudeDelta: 0.42,
  longitudeDelta: 0.28,
};

export default function MapScreen() {
  const [sensors, setSensors] = useState(MOCK_sensors);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedSensor = sensors.find(s => s.id === selected);

  useEffect(() => {
    apiService.getZones().then((zones: any[]) => {
      if (!Array.isArray(zones) || zones.length === 0) return;
      setSensors(BASE_sensors.map((base, i) => {
        const z = zones[i] ?? zones[0];
        const lvl = (z.level ?? "LOW").toUpperCase();
        const color = lvl === "CRITICAL" ? "#dc2626" : lvl === "HIGH" ? "#ea580c" : lvl === "MODERATE" ? "#ca8a04" : "#16a34a";
        return {
          ...base,
          level: lvl,
          water: z.river ? `${z.river}m` : MOCK_sensors[i].water,
          rainfall: z.rainfall ?? MOCK_sensors[i].rainfall,
          note: z.description ?? MOCK_sensors[i].note,
          color,
        };
      }));
    }).catch(() => {/* keep mock */});
  }, []);

  return (
    <View style={s.root}>
      <MapView
        style={s.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={CENTER}
        showsCompass
        showsScale
      >
        {/* Sebeya River path */}
        <Polyline
          coordinates={RIVER_PATH}
          strokeColor="#3b82f6"
          strokeWidth={3}
        />

        {/* Sensor markers */}
        {sensors.map(sensor => (
          <Marker
            key={sensor.id}
            coordinate={{ latitude: sensor.lat, longitude: sensor.lng }}
            onPress={() => setSelected(sensor.id === selected ? null : sensor.id)}
            pinColor={sensor.color}
          >
            <Callout tooltip>
              <View style={s.callout}>
                <Text style={s.calloutPlace}>{sensor.place}</Text>
                <Text style={s.calloutId}>{sensor.id} · {sensor.position}</Text>
                <View style={[s.calloutBadge, { backgroundColor: LEVEL_COLOR[sensor.level] }]}>
                  <Text style={s.calloutBadgeText}>{sensor.level}</Text>
                </View>
                <Text style={s.calloutStat}>💧 {sensor.water}  🌧 {sensor.rainfall}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bottom info panel */}
      <View style={s.panel}>
        {selectedSensor ? (
          <View style={s.detail}>
            <View style={s.detailHeader}>
              <View>
                <Text style={s.detailPlace}>{selectedSensor.place}</Text>
                <Text style={s.detailDistrict}>{selectedSensor.district} · {selectedSensor.position}</Text>
                <Text style={s.detailId}>{selectedSensor.id}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: LEVEL_COLOR[selectedSensor.level] }]}>
                <Text style={s.badgeText}>{selectedSensor.level}</Text>
              </View>
            </View>
            <View style={s.stats}>
              <View style={s.stat}>
                <Text style={s.statVal}>{selectedSensor.water}</Text>
                <Text style={s.statLbl}>Water Level</Text>
              </View>
              <View style={s.stat}>
                <Text style={s.statVal}>{selectedSensor.rainfall}</Text>
                <Text style={s.statLbl}>Rainfall</Text>
              </View>
            </View>
            <Text style={[s.note, { color: LEVEL_COLOR[selectedSensor.level] }]}>
              ⚠ {selectedSensor.note}
            </Text>
            <TouchableOpacity onPress={() => setSelected(null)} style={s.closeBtn}>
              <Text style={s.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            {sensors.map(s2 => (
              <TouchableOpacity
                key={s2.id}
                style={[s.chip, { borderColor: LEVEL_COLOR[s2.level] }]}
                onPress={() => setSelected(s2.id)}
              >
                <Text style={[s.chipLevel, { color: LEVEL_COLOR[s2.level] }]}>{s2.level}</Text>
                <Text style={s.chipPlace}>{s2.place}</Text>
                <Text style={s.chipPos}>{s2.position}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={s.legend}>
          <View style={s.legendItem}>
            <View style={[s.legendLine, { backgroundColor: "#3b82f6" }]} />
            <Text style={s.legendText}>Sebeya River</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: "#dc2626" }]} />
            <Text style={s.legendText}>Critical (&gt;2.5m/70mm)</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: "#ea580c" }]} />
            <Text style={s.legendText}>High</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: "#ca8a04" }]} />
            <Text style={s.legendText}>Moderate</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  map:  { flex: 1 },

  callout:          { backgroundColor: "#fff", borderRadius: 10, padding: 10, minWidth: 160, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  calloutPlace:     { fontSize: 15, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  calloutId:        { fontSize: 11, color: "#64748b", marginBottom: 6 },
  calloutBadge:     { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 },
  calloutBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  calloutStat:      { fontSize: 12, color: "#374151" },

  panel: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },

  detail:         { marginBottom: 10 },
  detailHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  detailPlace:    { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  detailDistrict: { fontSize: 12, color: "#64748b", marginTop: 2 },
  detailId:       { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  badge:          { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:      { color: "#fff", fontSize: 11, fontWeight: "700" },
  stats:          { flexDirection: "row", gap: 20, marginBottom: 8 },
  stat:           { alignItems: "center" },
  statVal:        { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  statLbl:        { fontSize: 11, color: "#94a3b8" },
  note:           { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  closeBtn:       { alignSelf: "flex-end", paddingHorizontal: 14, paddingVertical: 6, backgroundColor: "#f1f5f9", borderRadius: 8 },
  closeBtnText:   { fontSize: 13, color: "#64748b", fontWeight: "600" },

  chips:     { gap: 10, paddingVertical: 4, paddingHorizontal: 2, marginBottom: 10 },
  chip:      { borderWidth: 1.5, borderRadius: 10, padding: 10, minWidth: 110, backgroundColor: "#fafafa" },
  chipLevel: { fontSize: 10, fontWeight: "700", marginBottom: 2 },
  chipPlace: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  chipPos:   { fontSize: 11, color: "#94a3b8" },

  legend:     { flexDirection: "row", flexWrap: "wrap", gap: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendLine: { width: 16, height: 3, borderRadius: 2 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#64748b" },
});
