import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView, Image,
} from "react-native";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";
import ForgotPasswordScreen from "./ForgotPasswordScreen";

export default function LoginScreen({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) {
    return <ForgotPasswordScreen onBack={() => setShowForgot(false)} />;
  }

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.login(email.trim(), password);
      if (res.access_token) {
        await apiService.saveToken(res.access_token);
        onLogin();
      } else {
        Alert.alert("Login failed", res.detail || "Invalid credentials.");
      }
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = detail || e?.message || "Could not connect to server.";
      Alert.alert("Error", `${msg}\n\nURL: ${e?.config?.url ?? "unknown"}\nCode: ${e?.code ?? "none"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <View style={s.logoWrap}>
            <Image source={require("../../assets/logo.png")} style={s.logo} resizeMode="contain" />
          </View>
          <Text style={s.appName}>Rwanda Resilience Hub</Text>
          <Text style={s.tagline}>Flood Intelligence Platform</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.title}>Sign in</Text>
          <Text style={s.sub}>Access real-time flood risk data and alerts</Text>

          <Text style={s.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={s.input}
            placeholder="your@email.com"
            placeholderTextColor={Colors.n400}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={s.label}>PASSWORD</Text>
          <View style={s.pwWrap}>
            <TextInput
              style={s.pwInput}
              placeholder="••••••••"
              placeholderTextColor={Colors.n400}
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={s.eyeText}>👁</Text>
                {showPw && <View style={s.eyeLine} />}
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setShowForgot(true)} style={s.forgotBtn}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={submit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Sign in →</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.registerBtn} onPress={onRegister}>
            <Text style={s.registerText}>No account? Create one →</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>Rwanda Resilience Hub · Flood Early Warning System</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.navy },
  scroll:  { flexGrow: 1, justifyContent: "center", padding: 24 },
  header:  { alignItems: "center", marginBottom: 32 },
  logoWrap: {
    width: 100, height: 100, borderRadius: 20,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
    overflow: "hidden",
  },
  logo: { width: 96, height: 96 },
  appName: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  tagline:   { color: "rgba(255,255,255,.45)", fontSize: 13, letterSpacing: 0.5 },

  card:  { backgroundColor: "#fff", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.n900, marginBottom: 4 },
  sub:   { fontSize: 14, color: Colors.n500, marginBottom: 24, lineHeight: 20 },

  label: { fontSize: 11, fontWeight: "600", color: Colors.n500, letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" },
  input: {
    borderWidth: 1, borderColor: Colors.n200, borderRadius: 10,
    padding: 13, fontSize: 15, color: Colors.n900, marginBottom: 16,
    backgroundColor: Colors.n50,
  },

  pwWrap:  { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.n200, borderRadius: 10, backgroundColor: Colors.n50, marginBottom: 16 },
  pwInput: { flex: 1, padding: 13, fontSize: 15, color: Colors.n900 },
  eyeBtn:  { paddingHorizontal: 13, paddingVertical: 13 },
  eyeText: { fontSize: 16 },
  eyeLine: { position: "absolute", width: 22, height: 2, backgroundColor: Colors.n700, borderRadius: 1, transform: [{ rotate: "45deg" }] },

  forgotBtn:  { alignItems: "flex-end", marginBottom: 14 },
  forgotText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },

  btn:         { backgroundColor: Colors.primary, borderRadius: 10, padding: 15, alignItems: "center", marginTop: 4 },
  btnDisabled: { backgroundColor: Colors.n400 },
  btnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },

  footer:       { textAlign: "center", color: "rgba(255,255,255,.25)", fontSize: 12, marginTop: 32 },
  registerBtn:  { marginTop: 14, alignItems: "center" },
  registerText: { color: Colors.navyMid, fontSize: 14, fontWeight: "600" },
});
