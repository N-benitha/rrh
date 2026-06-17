import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { apiService } from "../services/api";

// Show alerts even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
  }),
});

async function registerExpoPushToken() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const projectId =
      (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
      (Constants.easConfig?.projectId as string | undefined);

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    await apiService.registerPushToken(tokenData.data);
  } catch {
    // Fails on simulators or when projectId is not set — safe to ignore
  }
}

export function useNotifications() {
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("rrh-alerts", {
        name: "Flood Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF0000",
        sound: "default",
      }).catch(() => {});
    }

    registerExpoPushToken();
  }, []);
}

/** Trigger an immediate local system notification on the device. */
export async function showLocalNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
      ...(Platform.OS === "android" ? { channelId: "rrh-alerts" } : {}),
    } as any);
  } catch {
    // Silently ignore if permissions not granted
  }
}
