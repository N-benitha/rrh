import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from "react-native";
import { Colors } from "../constants/colors";
import { apiService } from "../services/api";

type Step = 1 | 2 | 3;

export default function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep]           = useState<Step>(1);
  const [email, setEmail]         = useState("");
  const [code, setCode]           = useState(["", "", "", "", "", ""]);
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading]     = useState(false);

  const inputRefs = Array.from({ length: 6 }, () => React.createRef<TextInput>());

  const sendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await apiService.sendVerification(email.trim());
      setStep(2);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Could not send code. Please try again.");
    } finally { setLoading(false); }
  };

  const onDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...code]; n[i] = v.slice(-1); setCode(n);
    if (v && i < 5) inputRefs[i + 1].current?.focus();
  };

  const onKeyPress = (i: number, key: string) => {
    if (key === "Backspace" && !code[i] && i > 0) inputRefs[i - 1].current?.focus();
  };

  const verifyCode = async () => {
    if (code.join("").length < 6) return;
    setLoading(true);
    try {
      await apiService.verifyEmail(email.trim(), code.join(""));
      setStep(3);
    } catch (e: any) {
      Alert.alert("Invalid Code", e?.response?.data?.detail || "Please check the code and try again.");
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (!newPw || newPw !== confirmPw) {
      Alert.alert("Error", "Passwords do not match."); return;
    }
    if (newPw.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      await apiService.resetPassword(email.trim(), code.join(""), newPw);
      Alert.alert("Success", "Password reset successfully!", [{ text: "Sign In", onPress: onBack }]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Reset failed. Please start again.");
    } finally { setLoading(false); }
  };

  const StepDots = () => (
    <View style={s.stepRow}>
      {[1, 2, 3].map((n) => (
        <React.Fragment key={n}>
          <View style={[s.dot, step === n && s.dotActive, step > n && s.dotDone]}>
            <Text style={[s.dotText, (step === n || step > n) && s.dotTextLight]}>
              {step > n ? "✓" : n}
            </Text>
          </View>
          {n < 3 && <View style={[s.line, step > n && s.lineDone]} />}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView style={s.root} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backText}>← Back to sign in</Text>
          </TouchableOpacity>
          <Text style={s.title}>Reset Password</Text>
          <Text style={s.sub}>
            {step === 1 ? "Enter your email to receive a 6-digit code"
              : step === 2 ? `Enter the code sent to ${email}`
              : "Choose a new password"}
          </Text>
        </View>

        <StepDots />

        {/* Step 1 — Email */}
        {step === 1 && (
          <View style={s.card}>
            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.n400}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={[s.btn, (!email || loading) && s.btnDisabled]}
              onPress={sendCode}
              disabled={!email || loading}
            >
              <Text style={s.btnText}>{loading ? "Sending…" : "Send Verification Code →"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <View style={s.card}>
            <Text style={s.label}>6-Digit Code</Text>
            <View style={s.otpRow}>
              {code.map((d, i) => (
                <TextInput
                  key={i}
                  ref={inputRefs[i]}
                  style={[s.otpCell, d ? s.otpFilled : null]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={d}
                  onChangeText={(v) => onDigit(i, v)}
                  onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[s.btn, (code.join("").length < 6 || loading) && s.btnDisabled]}
              onPress={verifyCode}
              disabled={code.join("").length < 6 || loading}
            >
              <Text style={s.btnText}>{loading ? "Verifying…" : "Verify Code →"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendCode} style={{ marginTop: 12, alignItems: "center" }}>
              <Text style={s.resend}>Resend code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <View style={s.card}>
            <Text style={s.label}>New Password</Text>
            <TextInput
              style={s.input}
              placeholder="Min. 6 characters"
              placeholderTextColor={Colors.n400}
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
            />
            <Text style={[s.label, { marginTop: 12 }]}>Confirm Password</Text>
            <TextInput
              style={s.input}
              placeholder="Repeat new password"
              placeholderTextColor={Colors.n400}
              secureTextEntry
              value={confirmPw}
              onChangeText={setConfirmPw}
            />
            <TouchableOpacity
              style={[s.btn, (!newPw || newPw !== confirmPw || loading) && s.btnDisabled]}
              onPress={resetPassword}
              disabled={!newPw || newPw !== confirmPw || loading}
            >
              <Text style={s.btnText}>{loading ? "Resetting…" : "Reset Password →"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },

  header:   { marginBottom: 24 },
  backBtn:  { marginBottom: 16 },
  backText: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  title:    { fontSize: 26, fontWeight: "800", color: Colors.navy, marginBottom: 6 },
  sub:      { fontSize: 14, color: Colors.n500, lineHeight: 20 },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  dot:     { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.n200, alignItems: "center", justifyContent: "center" },
  dotActive: { backgroundColor: Colors.navy },
  dotDone:   { backgroundColor: "#059669" },
  dotText:   { fontSize: 12, fontWeight: "700", color: Colors.n500 },
  dotTextLight: { color: "#fff" },
  line:     { flex: 1, height: 2, backgroundColor: Colors.n200, marginHorizontal: 4 },
  lineDone: { backgroundColor: "#059669" },

  card:  { backgroundColor: "#fff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  label: { fontSize: 12, fontWeight: "700", color: Colors.n600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.n200, borderRadius: 10, padding: 14, fontSize: 15, color: Colors.n900, backgroundColor: "#fafafa", marginBottom: 16 },

  otpRow:  { flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 20 },
  otpCell: { width: 44, height: 52, borderRadius: 10, borderWidth: 1, borderColor: Colors.n200, backgroundColor: "#fff", textAlign: "center", fontSize: 22, fontWeight: "800", color: Colors.navy },
  otpFilled: { backgroundColor: "#eff6ff", borderColor: Colors.navy },

  btn:         { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  btnDisabled: { backgroundColor: Colors.n300 },
  btnText:     { color: "#fff", fontSize: 15, fontWeight: "700" },
  resend:      { color: Colors.navy, fontSize: 14, fontWeight: "600" },
});
