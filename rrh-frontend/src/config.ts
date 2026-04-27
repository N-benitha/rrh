/**
 * Environment Configuration
 * Configure API endpoints and environment variables
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 10000,
  },

  // App Configuration
  app: {
    name: "Rwanda Resilience Hub",
    version: "1.0.0",
    environment: import.meta.env.MODE || "development",
  },

  // Feature Flags
  features: {
    enableLiveUpdates: true,
    enableMapMarkers: true,
    enableAlertNotifications: true,
    enableReports: true,
  },

  // Default Settings
  defaults: {
    timeRange: "7d",
    refreshInterval: 30000, // 30 seconds in milliseconds
    pageSize: 20,
  },

  // Map Configuration
  map: {
    center: [-1.95, 30.05],
    zoom: 8,
    tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
};

export default config;
