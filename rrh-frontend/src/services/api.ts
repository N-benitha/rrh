const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api/v1";

class APIService {
  private authToken: string | null = localStorage.getItem("authToken");

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.authToken) headers.Authorization = `Bearer ${this.authToken}`;
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return data as T;
  }

  private async get<T>(path: string): Promise<T> {
    const r = await fetch(`${API_BASE_URL}${path}`, { headers: this.getHeaders() });
    return this.handleResponse<T>(r);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const r = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(r);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    const r = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(r);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    return this.post<{ access_token: string; user: Record<string, unknown>; detail?: string }>("/auth/login", { email, password });
  }

  async register(email: string, password: string, full_name: string, institution: string) {
    return this.post<{ access_token: string; user: Record<string, unknown>; detail?: string }>(
      "/auth/register",
      { email, password, full_name, institution, role: "viewer" }
    );
  }

  async validateToken() {
    return this.get<{ email: string; full_name: string }>("/auth/me");
  }

  async sendVerification(email: string) {
    return this.post<{ sent: boolean; emailed: boolean }>("/auth/send-verification", { email });
  }

  async verifyEmail(email: string, code: string) {
    return this.post<{ verified: boolean }>("/auth/verify-email", { email, code });
  }

  async resetPassword(email: string, code: string, new_password: string) {
    return this.post<{ reset: boolean }>("/auth/reset-password", { email, code, new_password });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem("authToken", token);
  }

  clearAuth() {
    this.authToken = null;
    localStorage.removeItem("authToken");
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboard() {
    return this.get<{
      active_alerts: number;
      critical_zones: number;
      ml_accuracy_pct: number;
      avg_rainfall_mm: number;
    }>("/dashboard");
  }

  // ── Zones ─────────────────────────────────────────────────────────────────

  async getZones() {
    return this.get<unknown[]>("/flood-risk/zones");
  }

  async getZoneDetail(zoneId: string) {
    return this.get<unknown>(`/zones/${zoneId}`);
  }

  async getSensorData(zoneId: string) {
    return this.get<unknown[]>(`/zones/${zoneId}/sensors`);
  }

  // ── Alerts ────────────────────────────────────────────────────────────────

  async getAlerts() {
    return this.get<unknown[]>("/alerts");
  }

  async getBasinPredictions() {
    return this.get<{
      predictions: {
        basin: string;
        zone: string;
        risk_level: "low" | "medium" | "high";
        confidence: number;
        model_type: string;
        features: {
          rainfall_24h: number;
          water_level: number;
          humidity: number;
          soil_saturation: number;
        };
      }[];
      weather_source: string;
      model_version: string;
      fetched_at: string;
    }>("/flood-risk/basin-predictions");
  }

  async getNasaRainfall(days: number = 7) {
    return this.get<{
      rainfall: { day: string; mm: number }[];
      source: string;
      basins?: number;
      fetched_at?: string;
      error?: string;
    }>(`/weather/nasa-rainfall?days=${days}`);
  }

  async getWeatherAlerts() {
    return this.get<{
      alerts: {
        id: string;
        level: string;
        title: string;
        description: string;
        zone: string;
        time: string;
        status: string;
        source: string;
        rainfall_mm: number;
        humidity_pct: number;
        temperature_c: number;
      }[];
      source: string;
      fetched_at: string;
      basins_checked: number;
    }>("/weather/live-alerts");
  }

  async createAlert(alertData: { region_id: string; risk_level: string; message: string; channel?: string }) {
    return this.post<unknown>("/alerts", alertData);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getAnalytics(timeRange: "1d" | "7d" | "30d" = "7d") {
    return this.get<Record<string, unknown>>(`/analytics?range=${timeRange}`);
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  async getReports() {
    return this.get<unknown[]>("/reports");
  }

  async generateReport(reportData: { type?: string; range?: string }) {
    return this.post<unknown>("/reports/generate", reportData);
  }

  // ── User ──────────────────────────────────────────────────────────────────

  async getProfile() {
    return this.get<Record<string, unknown>>("/user/profile");
  }

  async updateProfile(profileData: { email?: string; email_alerts_enabled?: boolean }) {
    return this.put<Record<string, unknown>>("/user/profile", profileData);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.put<Record<string, unknown>>("/user/password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  // ── Push notifications ─────────────────────────────────────────────────────

  async sendPushAlert(title: string, body: string, level: string) {
    return this.post<{ sent: number; expo_status?: number; error?: string }>(
      "/notifications/send-alert",
      { title, body, level }
    );
  }

  async getTokenCount() {
    return this.get<{ count: number }>("/notifications/token-count");
  }

  async getNotificationHistory() {
    return this.get<{ history: { title: string; body: string; level: string; sent_at: string }[] }>(
      "/notifications/history"
    );
  }
}

export default APIService;
export const apiService = new APIService();
