import { useState } from "react";
import type { PageProps } from "../../types";

export default function ProfilePage({ setPage }: PageProps) {
  const [profile, setProfile] = useState({
    name: "Yvette Tuyizere",
    email: "yvette@rrh.org",
    role: "Analyst",
    phone: "+250 798 123 456",
    location: "Kigali, Rwanda",
    joinDate: "March 1, 2024",
    department: "Hydrology & Risk Assessment",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [saved, setSaved] = useState(false);

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = () => {
    if (password.new === password.confirm && password.current) {
      setSaved(true);
      setPassword({ current: "", new: "", confirm: "" });
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSignOut = () => {
    setPage("landing");
  };

  return (
    <div className="db-profile">
      {/* Success Message */}
      {saved && (
        <div className="prof-success-banner">
          ✓ Profile updated successfully
        </div>
      )}

      {/* Profile Header Card */}
      <div className="prof-header-card">
        <div className="prof-header-bg"></div>
        <div className="prof-header-content">
          <div className="prof-avatar-xl">YT</div>
          <div className="prof-info">
            <h1 className="prof-name">{profile.name}</h1>
            <p className="prof-title">{profile.role} · Observer</p>
            <p className="prof-dept">{profile.department}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="prof-stats">
        <div className="prof-stat-box">
          <div className="prof-stat-label">Account Created</div>
          <div className="prof-stat-value">{profile.joinDate}</div>
        </div>
        <div className="prof-stat-box">
          <div className="prof-stat-label">Location</div>
          <div className="prof-stat-value">{profile.location}</div>
        </div>
        <div className="prof-stat-box">
          <div className="prof-stat-label">Last Login</div>
          <div className="prof-stat-value">Today, 2:45 PM</div>
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
            <label>Phone Number</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Enter phone"
            />
          </div>
        </div>

        <div className="prof-form-row">
          <div className="prof-form-group">
            <label>Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Enter location"
            />
          </div>
          <div className="prof-form-group">
            <label>Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              placeholder="Enter department"
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

      {/* Account Actions */}
      <div className="prof-panel">
        <h2 className="prof-panel-title">⚙️ Account Actions</h2>

        <div className="prof-action-grid">
          <div className="prof-action-box">
            <div className="prof-action-icon">📥</div>
            <div className="prof-action-title">Download My Data</div>
            <p className="prof-action-desc">Export all your account data</p>
            <button className="prof-btn-secondary">Download</button>
          </div>

          <div className="prof-action-box">
            <div className="prof-action-icon">📱</div>
            <div className="prof-action-title">Activity Log</div>
            <p className="prof-action-desc">View your login history</p>
            <button className="prof-btn-secondary">View Log</button>
          </div>

          <div className="prof-action-box">
            <div className="prof-action-icon">🌐</div>
            <div className="prof-action-title">Active Sessions</div>
            <p className="prof-action-desc">Manage your sessions</p>
            <button className="prof-btn-secondary">Manage</button>
          </div>

          <div className="prof-action-box">
            <div className="prof-action-icon">🗑️</div>
            <div className="prof-action-title">Delete Account</div>
            <p className="prof-action-desc">Permanently remove account</p>
            <button className="prof-btn-danger">Delete</button>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="prof-panel prof-signout-section">
        <h2 className="prof-panel-title">🚪 Sign Out</h2>
        <p className="prof-signout-desc">You are currently logged in as <strong>{profile.name}</strong></p>
        
        <div className="prof-signout-options">
          <button className="prof-btn-secondary" onClick={handleSignOut}>
            🚪 Sign Out Current Device
          </button>
          <button className="prof-btn-secondary">
            🌐 Sign Out All Devices
          </button>
        </div>
      </div>
    </div>
  );
}
