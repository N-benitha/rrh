const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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

  private async patch<T>(path: string, body: unknown = {}): Promise<T> {
    const r = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(r);
  }

  private async delete<T>(path: string): Promise<T> {
    const r = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    // 204 No Content has no body
    if (r.status === 204) return undefined as T;
    return this.handleResponse<T>(r);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    return this.post<{ access_token: string; user: Record<string, unknown>; detail?: string }>("/auth/login", { email, password });
  }

  async register(email: string, password: string, name: string, phone_number: string) {
    return this.post<{ access_token: string; user: Record<string, unknown>; detail?: string }>(
      "/auth/register",
      { name, email, password, phone_number }
    );
  }

  async logout() {
    return this.post<{ message: string }>("/auth/logout", {});
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

  // ── Admin Stats (was /dashboard) ──────────────────────────────────────────

  async getDashboard() {
    return this.get<{
      total_users: number;
      total_predictions: number;
      total_alerts: number;
      predictions_by_risk_level: Record<string, number>;
      alerts_by_status: Record<string, number>;
      total_sensor_readings: number;
      regions_count: number;
    }>("/admin/stats");
  }

  // ── Regions (was /zones) ──────────────────────────────────────────────────

  async getZones() {
    return this.get<unknown[]>("/regions");
  }

  async getZoneDetail(zoneId: string) {
    return this.get<unknown>(`/regions/${zoneId}`);
  }

  // TODO: no backend endpoint for sensor data per zone
  async getSensorData(_zoneId: string): Promise<unknown[]> {
    throw new Error("getSensorData: no backend endpoint — TODO");
  }

  // ── Alerts ────────────────────────────────────────────────────────────────

  async getAlerts() {
    return this.get<{
      id: string;
      region_id: string;
      user_id: string;
      risk_level: string;
      channel: string;
      status: string;
      confidence_score: number | null;
      message: string;
      created_at: string;
      sent_at: string | null;
    }[]>("/alerts");
  }

  async markAlertRead(alertId: string) {
    return this.patch<{ message: string }>(`/alerts/${alertId}/read`);
  }

  // ── Predictions ───────────────────────────────────────────────────────────

  async getPrediction(regionId: string) {
    return this.post<{
      zone_id: string;
      risk_level: string;
      confidence: number;
      timestamp: string;
    }>("/predict", { region_id: regionId });
  }

  // TODO: /flood-risk/basin-predictions has no backend equivalent — use getPrediction(regionId)
  async getBasinPredictions(): Promise<never> {
    throw new Error("getBasinPredictions: no backend endpoint — use getPrediction(regionId) instead");
  }

  // TODO: /weather/nasa-rainfall has no backend equivalent
  async getNasaRainfall(_days: number = 7): Promise<never> {
    throw new Error("getNasaRainfall: no backend endpoint — TODO");
  }

  // TODO: /weather/live-alerts has no backend equivalent — use getAlerts()
  async getWeatherAlerts(): Promise<never> {
    throw new Error("getWeatherAlerts: no backend endpoint — use getAlerts() instead");
  }

  // TODO: /analytics has no backend equivalent
  async getAnalytics(_timeRange: "1d" | "7d" | "30d" = "7d"): Promise<never> {
    throw new Error("getAnalytics: no backend endpoint — TODO");
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  // TODO: /reports has no backend equivalent
  async getReports(): Promise<never> {
    throw new Error("getReports: no backend endpoint — TODO");
  }

  // TODO: /reports/generate has no backend equivalent
  async generateReport(_reportData: { type?: string; range?: string }): Promise<never> {
    throw new Error("generateReport: no backend endpoint — TODO");
  }

  // ── User (current) ───────────────────────────────────────────────────────

  async getProfile() {
    return this.get<{
      id: string;
      name: string;
      email: string;
      phone_number: string;
      role: string;
      email_alerts_enabled: boolean;
      created_at: string;
      updated_at: string;
    }>("/users/me");
  }

  // TODO: no self-update endpoint; PATCH /users/{id} requires admin role
  async updateProfile(_profileData: { email?: string; email_alerts_enabled?: boolean }): Promise<never> {
    throw new Error("updateProfile: no self-update endpoint — PATCH /users/{id} is admin-only");
  }

  // TODO: no password change endpoint on backend
  async changePassword(_currentPassword: string, _newPassword: string): Promise<never> {
    throw new Error("changePassword: no backend endpoint — TODO");
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async getAdminUsers(page = 1, pageSize = 20) {
    return this.get<{
      id: string;
      name: string;
      email: string;
      phone_number: string;
      role: "admin" | "user";
      email_alerts_enabled: boolean;
      created_at: string;
      updated_at: string;
    }[]>(`/admin/users?page=${page}&page_size=${pageSize}`);
  }

  async updateUser(
    userId: string,
    data: { name?: string; email?: string; phone_number?: string; role?: string; email_alerts_enabled?: boolean }
  ) {
    return this.patch<{
      id: string;
      name: string;
      email: string;
      phone_number: string;
      role: string;
      email_alerts_enabled: boolean;
      created_at: string;
      updated_at: string;
    }>(`/users/${userId}`, data);
  }

  async deleteUser(userId: string) {
    return this.delete<void>(`/users/${userId}`);
  }

  async getSubscriptions() {
    return this.get<{
      id: string;
      region_id: string;
      region_name: string;
      created_at: string;
    }[]>("/subscriptions");
  }

  async getAdminAlerts(status?: string) {
    const query = status ? `?alert_status=${status}` : "";
    return this.get<{
      id: string;
      region_id: string;
      user_id: string;
      risk_level: string;
      channel: string;
      status: string;
      confidence_score: number | null;
      message: string;
      created_at: string;
      sent_at: string | null;
    }[]>(`/admin/alerts${query}`);
  }
}

export default APIService;
export const apiService = new APIService();
