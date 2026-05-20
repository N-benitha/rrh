import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, Alert, Image,
} from "react-native";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";

export default function RegisterScreen({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) {
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [institution, setInstitution] = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);

  const submit = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await apiService.register({ firstName, lastName, email, password, institution });
      Alert.alert("Account created!", "You can now sign in.", [
        { text: "Sign In", onPress: onRegister },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "Registration failed. Try a different email.";
      Alert.alert("Error", msg);
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
          <Text style={s.tagline}>Create your account</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.title}>Get access</Text>
          <Text style={s.sub}>Join the Sebeya River flood monitoring platform</Text>

          {/* Name row */}
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.label}>FIRST NAME</Text>
              <TextInput style={s.input} placeholder="First name" placeholderTextColor={Colors.n400}
                value={firstName} onChangeText={setFirstName} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>LAST NAME</Text>
              <TextInput style={s.input} placeholder="Last name" placeholderTextColor={Colors.n400}
                value={lastName} onChangeText={setLastName} />
            </View>
          </View>

          <Text style={s.label}>EMAIL ADDRESS</Text>
          <TextInput style={s.input} placeholder="your@email.com" placeholderTextColor={Colors.n400}
            autoCapitalize="none" keyboardType="email-address"
            value={email} onChangeText={setEmail} />

          <Text style={s.label}>INSTITUTION / ORGANIZATION <Text style={s.optional}>(optional)</Text></Text>
          <TextInput style={s.input} placeholder="e.g. University of Rwanda" placeholderTextColor={Colors.n400}
            value={institution} onChangeText={setInstitution} />

          <Text style={s.label}>PASSWORD</Text>
          <View style={s.pwWrap}>
            <TextInput
              style={s.pwInput}
              placeholder="Create a password (min 6 chars)"
              placeholderTextColor={Colors.n400}
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={s.eyeText}>👁</Text>
                {showPw && <View style={s.eyeLine} />}
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={submit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Create account →</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.backBtn} onPress={onBack}>
            <Text style={s.backText}>← Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>Rwanda Resilience Hub · Sebeya River · Flood Early Warning System</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.navy },
  scroll:  { flexGrow: 1, padding: 24 },
  header:  { alignItems: "center", marginBottom: 24, marginTop: 16 },
  logoWrap: {
    width: 100, height: 100, borderRadius: 20,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
    overflow: "hidden",
  },
  logo: { width: 96, height: 96 },
  appName: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  tagline:  { color: "rgba(255,255,255,.45)", fontSize: 12 },

  card:  { backgroundColor: "#fff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 6, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.n900, marginBottom: 4 },
  sub:   { fontSize: 14, color: Colors.n500, marginBottom: 20 },

  row:      { flexDirection: "row", marginBottom: 0 },
  label:    { fontSize: 11, fontWeight: "600", color: Colors.n500, letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" },
  optional: { fontWeight: "400", textTransform: "none", letterSpacing: 0, fontSize: 11, color: Colors.n400 },
  input: {
    borderWidth: 1, borderColor: Colors.n200, borderRadius: 10,
    padding: 12, fontSize: 15, color: Colors.n900, marginBottom: 14,
    backgroundColor: Colors.n50,
  },

  pwWrap:  { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.n200, borderRadius: 10, backgroundColor: Colors.n50, marginBottom: 14 },
  pwInput: { flex: 1, padding: 12, fontSize: 15, color: Colors.n900 },
  eyeBtn:  { paddingHorizontal: 13, paddingVertical: 12 },
  eyeText: { fontSize: 16 },
  eyeLine: { position: "absolute", width: 22, height: 2, backgroundColor: Colors.n700, borderRadius: 1, transform: [{ rotate: "45deg" }] },

  btn:         { backgroundColor: Colors.primary, borderRadius: 10, padding: 15, alignItems: "center", marginTop: 4 },
  btnDisabled: { backgroundColor: Colors.n400 },
  btnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },

  backBtn:  { marginTop: 14, alignItems: "center" },
  backText: { color: Colors.navyMid, fontSize: 14, fontWeight: "600" },

  footer: { textAlign: "center", color: "rgba(255,255,255,.25)", fontSize: 12 },
});
