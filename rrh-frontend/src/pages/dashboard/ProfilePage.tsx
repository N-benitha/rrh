import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiService } from "../../services/api";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  email_alerts_enabled: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  region_id: string;
  region_name: string;
  created_at: string;
}

interface Region {
  id: string;
  name: string;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);

  const [regions, setRegions] = useState<Region[]>([]);

  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);
  const [subMsg, setSubMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    Promise.allSettled([
      apiService.getProfile(),
      apiService.getSubscriptions(),
      apiService.getZones(),
    ]).then(([profResult, subsResult, regResult]) => {
      if (profResult.status === "fulfilled") setProfile(profResult.value);
      setProfileLoading(false);

      if (subsResult.status === "fulfilled") setSubscriptions(subsResult.value);
      setSubsLoading(false);

      if (regResult.status === "fulfilled")
        setRegions((regResult.value as Region[]) ?? []);
    });
  }, []);

  const handleSubscribe = async () => {
    if (!selectedRegionId) return;
    setSubscribing(true);
    setSubMsg(null);
    try {
      const sub = await apiService.subscribe(selectedRegionId);
      setSubscriptions((prev) => [...prev, sub]);
      setSelectedRegionId("");
      setSubMsg({ type: "ok", text: `Subscribed to ${sub.region_name}` });
    } catch (err) {
      setSubMsg({ type: "err", text: err instanceof Error ? err.message : "Failed to subscribe" });
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async (regionId: string) => {
    setUnsubscribingId(regionId);
    setSubMsg(null);
    try {
      await apiService.unsubscribe(regionId);
      setSubscriptions((prev) => prev.filter((s) => s.region_id !== regionId));
    } catch (err) {
      setSubMsg({ type: "err", text: err instanceof Error ? err.message : "Failed to unsubscribe" });
    } finally {
      setUnsubscribingId(null);
    }
  };

  const subscribedIds = new Set(subscriptions.map((s) => s.region_id));
  const availableRegions = regions.filter((r) => !subscribedIds.has(r.id));

  const initials = profile?.name ? getInitials(profile.name) : "—";

  return (
    <div className="db-profile">

      {/* Profile Header */}
      <div className="prof-header-card">
        <div className="prof-header-bg" />
        <div className="prof-header-content">
          <div className="prof-avatar-xl">
            {profileLoading ? "…" : initials}
          </div>
          <div className="prof-info">
            <h1 className="prof-name">{profileLoading ? "Loading…" : (profile?.name ?? "—")}</h1>
            <p className="prof-title">{profile?.role ?? ""}</p>
            <p className="prof-dept">{profile?.email ?? ""}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="prof-stats">
        <div className="prof-stat-box">
          <div className="prof-stat-label">Member Since</div>
          <div className="prof-stat-value">
            {profileLoading ? "…" : profile?.created_at ? fmtDate(profile.created_at) : "—"}
          </div>
        </div>
        <div className="prof-stat-box">
          <div className="prof-stat-label">Email Alerts</div>
          <div className="prof-stat-value">
            {profileLoading ? "…" : profile?.email_alerts_enabled ? "🟢 Enabled" : "⚪ Disabled"}
          </div>
        </div>
        <div className="prof-stat-box">
          <div className="prof-stat-label">Subscriptions</div>
          <div className="prof-stat-value">
            {subsLoading ? "…" : `${subscriptions.length} region${subscriptions.length !== 1 ? "s" : ""}`}
          </div>
        </div>
        <div className="prof-stat-box">
          <div className="prof-stat-label">Account Status</div>
          <div className="prof-stat-value prof-active">🟢 Active</div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="prof-panel">
        <h2 className="prof-panel-title">📋 Personal Information</h2>

        {profileLoading ? (
          <p style={{ color: "var(--n400)", fontSize: 14, marginBottom: 16 }}>Loading profile…</p>
        ) : (
          <>
            <div className="prof-form-row">
              <div className="prof-form-group">
                <label>Full Name</label>
                <input type="text" value={profile?.name ?? "—"} disabled />
              </div>
              <div className="prof-form-group">
                <label>Role</label>
                <input type="text" value={profile?.role ?? "—"} disabled />
              </div>
            </div>
            <div className="prof-form-row">
              <div className="prof-form-group">
                <label>Email Address</label>
                <input type="email" value={profile?.email ?? "—"} disabled />
              </div>
              <div className="prof-form-group">
                <label>Phone Number</label>
                <input type="tel" value={profile?.phone_number ?? "—"} disabled />
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--n400)", marginBottom: 20 }}>
              Profile details are managed by an administrator.
            </p>
          </>
        )}

        {/* Subscribed Regions */}
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--n700)", marginBottom: 10, marginTop: 4 }}>
          Subscribed Regions
        </h3>
        <p style={{ fontSize: 12, color: "var(--n400)", marginBottom: 12 }}>
          You receive flood predictions and alerts for these regions.
        </p>

        {subMsg && (
          <div
            style={{
              padding: "9px 13px", borderRadius: 6, fontSize: 13, marginBottom: 12,
              background: subMsg.type === "ok" ? "var(--ok-lt)" : "var(--err-lt)",
              border: `1px solid ${subMsg.type === "ok" ? "var(--ok-bd)" : "var(--err-bd)"}`,
              color: subMsg.type === "ok" ? "var(--ok)" : "var(--err)",
            }}
          >
            {subMsg.type === "ok" ? "✓" : "⚠"} {subMsg.text}
          </div>
        )}

        {subsLoading ? (
          <p style={{ color: "var(--n400)", fontSize: 14, marginBottom: 12 }}>Loading subscriptions…</p>
        ) : subscriptions.length === 0 ? (
          <p style={{ color: "var(--n400)", fontSize: 14, marginBottom: 12 }}>
            No subscriptions yet. Add a region below.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {subscriptions.map((s) => (
              <div
                key={s.region_id}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 10px", borderRadius: 20,
                  background: "var(--s50)", border: "1px solid var(--s200)",
                  fontSize: 13, color: "var(--s700)",
                }}
              >
                <span>📍 {s.region_name}</span>
                <button
                  onClick={() => handleUnsubscribe(s.region_id)}
                  disabled={unsubscribingId === s.region_id}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--n400)", fontSize: 14, lineHeight: 1, padding: 0,
                    opacity: unsubscribingId === s.region_id ? 0.5 : 1,
                  }}
                  title="Unsubscribe"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {availableRegions.length > 0 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              style={{
                flex: 1, padding: "9px 12px", borderRadius: 6,
                border: "1px solid var(--n200)", background: "#fff",
                color: "var(--n700)", fontSize: 14, outline: "none",
              }}
            >
              <option value="">Select a region to subscribe…</option>
              {availableRegions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button
              className="prof-btn-primary"
              onClick={handleSubscribe}
              disabled={!selectedRegionId || subscribing}
              style={{ whiteSpace: "nowrap", marginBottom: 0 }}
            >
              {subscribing ? "Subscribing…" : "+ Subscribe"}
            </button>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="prof-panel prof-signout-section">
        <h2 className="prof-panel-title">🚪 Sign Out</h2>
        {profile && (
          <p className="prof-signout-desc">
            You are signed in as <strong>{profile.name}</strong> ({profile.email})
          </p>
        )}
        <div className="prof-signout-options">
          <button
            className="prof-btn-secondary"
            onClick={() => { apiService.clearAuth(); navigate("/"); }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

    </div>
  );
}
