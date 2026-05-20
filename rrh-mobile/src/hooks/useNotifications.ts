import { useEffect } from "react";
import * as Notifications from "expo-notifications";

// Show alerts even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
  }),
});

export function useNotifications() {
  useEffect(() => {
    // Request permission for local notifications (works in Expo Go SDK 54)
    Notifications.requestPermissionsAsync().catch(() => {});
  }, []);
}

/** Trigger an immediate local system notification on the device. */
export async function showLocalNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null, // show immediately
    });
  } catch {
    // Silently ignore if permissions not granted
  }
}
