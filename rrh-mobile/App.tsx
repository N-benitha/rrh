import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, LogBox } from "react-native";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "`expo-notifications` functionality is not fully supported",
]);
import { apiService } from "./src/services/api";
import LoginScreen    from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import TabNavigator   from "./src/components/TabNavigator";
import { Colors } from "./src/constants/colors";
import { enqueue } from "./src/services/notificationQueue";
import { useNotifications, showLocalNotification } from "./src/hooks/useNotifications";
import type { AlertItem } from "./src/screens/AlertsScreen";

const LVL_KEY: Record<string, string> = {
  crit: "crit", critical: "crit",
  high: "high",
  mod: "mod", moderate: "mod",
  low: "low",
};

type Screen = "login" | "register";

export default function App() {
  useNotifications(); // request local notification permissions on startup
  const [authed,  setAuthed]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [screen,  setScreen]  = useState<Screen>("login");
  const nextIdRef = useRef(Date.now());

  // Background poll: enqueue web-dashboard alerts regardless of active tab
  useEffect(() => {
    const poll = async () => {
      try {
        const incoming = await apiService.getPendingNotifications();
        if (incoming.length === 0) return;
        const items: AlertItem[] = incoming.map((n) => ({
          id:   `web-${nextIdRef.current++}`,
          lvl:  LVL_KEY[n.level.toLowerCase()] ?? "high",
          zone: "Web Dashboard Alert",
          title: n.title,
          desc:  n.body,
          time:  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        enqueue(items);
        // Fire a real system notification on the device
        await showLocalNotification(items[0].title, items[0].desc);
      } catch { /* backend unreachable */ }
    };
    poll(); // immediate first check
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500);
    apiService.isAuthenticated()
      .then((ok) => { setAuthed(ok); setLoading(false); clearTimeout(timeout); })
      .catch(() => { setLoading(false); clearTimeout(timeout); });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.navy }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {authed ? (
        <TabNavigator onLogout={() => setAuthed(false)} />
      ) : screen === "register" ? (
        <RegisterScreen
          onBack={() => setScreen("login")}
          onRegister={() => setScreen("login")}
        />
      ) : (
        <LoginScreen
          onLogin={() => setAuthed(true)}
          onRegister={() => setScreen("register")}
        />
      )}
    </NavigationContainer>
  );
}
