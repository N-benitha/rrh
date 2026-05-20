import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Physical phone / Expo Go: uses your PC's LAN IP (run `ipconfig` to verify)
// Android emulator: replace with http://10.0.2.2:8001/api/v1
const BASE_URL = "http://192.168.1.185:8001/api/v1";

const TOKEN_KEY = "rrh_token";

const http = axios.create({ baseURL: BASE_URL, timeout: 10000 });

http.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiService = {
  async login(email: string, password: string) {
    const res = await http.post("/auth/login", { email, password });
    return res.data;
  },

  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  },

  async register(data: { firstName: string; lastName: string; email: string; password: string; institution?: string }) {
    const res = await http.post("/auth/register", {
      full_name:   `${data.firstName} ${data.lastName}`.trim(),
      email:       data.email,
      password:    data.password,
      institution: data.institution || "",
    });
    return res.data;
  },

  async getMe() {
    const res = await http.get("/auth/me");
    return res.data;
  },

  async getZones() {
    const res = await http.get("/flood-risk/zones");
    return res.data;
  },

  async getAlerts() {
    const res = await http.get("/flood-risk/alerts");
    return res.data;
  },

  async getBasinPredictions() {
    const res = await http.get("/flood-risk/basin-predictions");
    return res.data;
  },

  async getWeatherAlerts() {
    const res = await http.get("/weather/live-alerts");
    return res.data;
  },

  async getSensors() {
    const res = await http.get("/sensors/");
    return res.data;
  },

  async registerPushToken(token: string) {
    const res = await http.post("/notifications/register-token", { token });
    return res.data;
  },

  async getPendingNotifications(): Promise<{ title: string; body: string; level: string }[]> {
    const res = await http.get("/notifications/pending");
    return res.data.notifications ?? [];
  },

  async sendVerification(email: string) {
    const res = await http.post("/auth/send-verification", { email });
    return res.data;
  },

  async verifyEmail(email: string, code: string) {
    const res = await http.post("/auth/verify-email", { email, code });
    return res.data;
  },

  async resetPassword(email: string, code: string, new_password: string) {
    const res = await http.post("/auth/reset-password", { email, code, new_password });
    return res.data;
  },
};
