import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import DashboardScreen  from "../screens/DashboardScreen";
import AlertsScreen     from "../screens/AlertsScreen";
import WeatherScreen    from "../screens/WeatherScreen";
import SafetyTipsScreen from "../screens/SafetyTipsScreen";
import MapScreen        from "../screens/MapScreen";
import ProfileScreen    from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_ICONS: Record<string, { focused: IoniconsName; outline: IoniconsName }> = {
  Dashboard:     { focused: "bar-chart",        outline: "bar-chart-outline" },
  Alerts:        { focused: "notifications",     outline: "notifications-outline" },
  Weather:       { focused: "partly-sunny",      outline: "partly-sunny-outline" },
  Map:           { focused: "map",               outline: "map-outline" },
  "Safety Tips": { focused: "shield-checkmark",  outline: "shield-checkmark-outline" },
  Profile:       { focused: "person-circle",     outline: "person-circle-outline" },
};

export default function TabNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name];
          const name = focused ? icons?.focused : icons?.outline;
          return (
            <Ionicons
              name={name ?? "ellipse-outline"}
              size={size}
              color={focused ? Colors.primary : Colors.n400}
            />
          );
        },
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
