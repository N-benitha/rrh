import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { Colors } from "../constants/colors";
import DashboardScreen  from "../screens/DashboardScreen";
import AlertsScreen     from "../screens/AlertsScreen";
import WeatherScreen    from "../screens/WeatherScreen";
import SafetyTipsScreen from "../screens/SafetyTipsScreen";
import MapScreen        from "../screens/MapScreen";
import ProfileScreen    from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Dashboard:   "📊",
  Alerts:      "🔔",
  Weather:     "🌤️",
  Map:         "🗺️",
  "Safety Tips": "🛡️",
  Profile:     "👤",
};

const icon = (label: string, focused: boolean) => (
  <Text style={{ fontSize: 21, opacity: focused ? 1 : 0.4 }}>{ICONS[label] ?? "●"}</Text>
);

export default function TabNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => icon(route.name, focused),
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.n400,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: Colors.n200,
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        headerStyle:      { backgroundColor: Colors.navy },
        headerTintColor:  "#fff",
        headerTitleStyle: { fontWeight: "700", fontSize: 17 },
      })}
    >
      <Tab.Screen name="Dashboard"   component={DashboardScreen}  options={{ title: "Overview" }} />
      <Tab.Screen name="Alerts"      component={AlertsScreen}     options={{ title: "Alerts" }} />
      <Tab.Screen name="Weather"     component={WeatherScreen}    options={{ title: "Weather" }} />
      <Tab.Screen name="Map"         component={MapScreen}        options={{ title: "Sebeya Map" }} />
      <Tab.Screen
        name="Safety Tips"
        component={SafetyTipsScreen}
        options={{ title: "Safety Tips" }}
      />
      <Tab.Screen
        name="Profile"
        options={{ title: "Profile" }}
      >
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
