import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";

interface User {
  full_name?: string;
  email?: string;
  role?: string;
  zone?: string;
}

export default function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getMe()
      .then(setUser)
      .catch(() => setUser({ full_name: "Analyst User", email: "analyst@rrh.rw", role: "analyst" }))
      .finally(() => setLoading(false));
  }, []);

  const confirmLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: async () => {
          await apiService.clearToken();
          onLogout();
        }},
      ]
    );
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "RR";

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>

      {/* Avatar card */}
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.name}>{user?.full_name || "RRH Analyst"}</Text>
        <Text style={s.email}>{user?.email || "—"}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{(user?.role || "analyst").toUpperCase()}</Text>
        </View>
      </View>

      {/* Info rows */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Account Details</Text>
        {[
          ["Platform", "Rwanda Resilience Hub"],
          ["Role",     user?.role || "Analyst"],
          ["Zone",     user?.zone || "Sebeya River · Rubavu"],
          ["Access",   "Flood Risk Intelligence"],
        ].map(([label, value]) => (
          <View key={label} style={s.row}>
            <Text style={s.rowLabel}>{label}</Text>
            <Text style={s.rowValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* System info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>System Info</Text>
        {[
          ["Focus Area",    "Sebeya River · Rubavu District"],
          ["ML Model",      "Random Forest · 91.4% accuracy"],
          ["IoT Sensors",   "SEBY-US-01 · MS-02 · DS-03"],
          ["Data Sources",  "NASA POWER · OpenWeather"],
          ["Update Cycle",  "Every 15 minutes"],
          ["Training Data", "NASA POWER 2010–2023"],
        ].map(([label, value]) => (
          <View key={label} style={s.row}>
            <Text style={s.rowLabel}>{label}</Text>
            <Text style={s.rowValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={s.signOutBtn} onPress={confirmLogout}>
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.footer}>Rwanda Resilience Hub v1.0 · Capstone Project 2025</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 40 },

  profileCard: {
    backgroundColor: Colors.navy, borderRadius: 16, padding: 24, alignItems: "center",
    marginBottom: 20, shadowColor: Colors.navy, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "800" },
  name:       { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  email:      { color: "rgba(255,255,255,.55)", fontSize: 13, marginBottom: 12 },
  roleBadge:  { backgroundColor: "rgba(245,124,0,.25)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: Colors.primary },
  roleText:   { color: Colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1 },

  section:      { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: Colors.n500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  row:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.n100 },
  rowLabel:     { fontSize: 14, color: Colors.n700, flex: 1 },
  rowValue:     { fontSize: 14, color: Colors.n900, fontWeight: "600", flex: 1, textAlign: "right" },

  signOutBtn: {
    backgroundColor: "#fef2f2", borderRadius: 12, padding: 16, alignItems: "center",
    borderWidth: 1, borderColor: "#fecaca", marginBottom: 20,
  },
  signOutText: { color: Colors.critical, fontSize: 15, fontWeight: "700" },

  footer: { textAlign: "center", color: Colors.n400, fontSize: 12 },
});
