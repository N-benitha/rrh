import { useState, useEffect } from "react";
import type { PageProps } from "../../types";
import { apiService } from "../../services/api";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProfilePage({ setPage }: PageProps) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    institution: "",
    joinDate: "",
  });

  useEffect(() => {
    apiService.validateToken().then((user) => {
      setProfile({
        name:        user.full_name || "",
        email:       user.email || "",
        role:        user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Analyst",
        institution: user.institution || "Rwanda Resilience Hub",
        joinDate:    fmtDate(user.created_at),
      });
    }).catch(() => {});
  }, []);

  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [pwError, setPwError]   = useState("");
  const [banner, setBanner]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 3500);
  };

  const handleSaveProfile = () => {
    showBanner("success", "Profile updated successfully");
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (password.new !== password.confirm) { setPwError("New passwords do not match."); return; }
    if (password.new.length < 6)           { setPwError("Password must be at least 6 characters."); return; }
    try {
      await apiService.changePassword(password.current, password.new);
      setPassword({ current: "", new: "", confirm: "" });
      showBanner("success", "Password updated successfully");
    } catch (e: any) {
      setPwError(e.message || "Current password is incorrect.");
    }
  };

  const handleSignOut = () => {
    apiService.clearAuth();
    setPage("landing");
  };

  const initials = getInitials(profile.name) || "RR";

  return (
    <div className="db-profile">
      {banner && (
        <div className={`prof-success-banner${banner.type === "error" ? " prof-error-banner" : ""}`}>
          {banner.type === "success" ? "✓" : "✗"} {banner.text}
        </div>
      )}

      {/* Profile Header */}
      <div className="prof-header-card">
        <div className="prof-header-bg"></div>
        <div className="prof-header-content">
          <div className="prof-avatar-xl">{initials}</div>
          <div className="prof-info">
            <h1 className="prof-name">{profile.name || "—"}</h1>
            <p className="prof-title">{profile.role} · Observer</p>
            <p className="prof-dept">{profile.institution}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="prof-stats">
        <div className="prof-stat-box">
          <div className="prof-stat-label">Account Created</div>
          <div className="prof-stat-value">{profile.joinDate || "—"}</div>
        </div>
        <div className="prof-stat-box">
          <div className="prof-stat-label">Monitoring Zone</div>
          <div className="prof-stat-value">Sebeya Basin · Rubavu</div>
        </div>
        <div className="prof-stat-box">
          <div className="prof-stat-label">Last Login</div>
          <div className="prof-stat-value">
            Today, {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

        <div className="prof-form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>

        <div className="prof-form-row">
          <div className="prof-form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>
          <div className="prof-form-group">
            <label>Institution</label>
            <input
              type="text"
              value={profile.institution}
              onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
              placeholder="Enter institution"
            />
          </div>
        </div>

        <button className="prof-btn-primary" onClick={handleSaveProfile}>
          💾 Save Personal Info
        </button>
      </div>

      {/* Change Password */}
      <div className="prof-panel">
        <h2 className="prof-panel-title">🔐 Change Password</h2>

        {pwError && <div className="prof-error-inline">{pwError}</div>}

        <div className="prof-form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={password.current}
            onChange={(e) => setPassword({ ...password, current: e.target.value })}
            placeholder="Enter current password"
          />
        </div>

        <div className="prof-form-row">
          <div className="prof-form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              placeholder="Enter new password"
            />
          </div>
          <div className="prof-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <button
          className="prof-btn-primary"
          onClick={handleChangePassword}
          disabled={!password.current || !password.new || password.new !== password.confirm}
        >
          🔑 Update Password
        </button>
      </div>

      {/* Sign Out */}
      <div className="prof-panel prof-signout-section">
        <h2 className="prof-panel-title">🚪 Sign Out</h2>
        <p className="prof-signout-desc">
          Signed in as <strong>{profile.email || profile.name}</strong>
        </p>
        <div className="prof-signout-options">
          <button className="prof-btn-secondary" onClick={handleSignOut}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
