import { useState, useEffect, Fragment } from "react";
import { apiService } from "../../services/api";

type RoleName = "admin" | "user";

interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: RoleName;
  email_alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Role {
  name: RoleName;
  permissions: string[];
  color: string;
}

const ROLES: Role[] = [
  {
    name: "admin",
    color: "#7c3aed",
    permissions: [
      "View Dashboard", "View Analytics", "Manage Alerts", "Create Reports",
      "Export Data", "Manage Zones", "Manage Users", "Configure Settings",
    ],
  },
  {
    name: "user",
    color: "#2563eb",
    permissions: ["View Dashboard", "View Analytics", "Manage Alerts"],
  },
];

const ROLE_COLOR: Record<RoleName, string> = { admin: "#7c3aed", user: "#2563eb" };

const ALL_PERMISSIONS = [
  "View Dashboard", "View Analytics", "Manage Alerts", "Create Reports",
  "Export Data", "Manage Zones", "Manage Users", "Configure Settings",
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });
  const [roleSuccess, setRoleSuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    apiService
      .getAdminUsers(1, 50)
      .then((data) => setUsers(data as BackendUser[]))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async (userId: string, role: string) => {
    try {
      const updated = await apiService.updateUser(userId, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role as RoleName } : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setEditingUserId(null);
    }
  };

  const toggleEmailAlerts = async (userId: string, current: boolean) => {
    try {
      const updated = await apiService.updateUser(userId, { email_alerts_enabled: !current });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, email_alerts_enabled: updated.email_alerts_enabled } : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update email alerts");
    }
  };

  const removeUser = async (userId: string) => {
    if (!window.confirm("Permanently remove this user?")) return;
    try {
      await apiService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (viewedUserId === userId) setViewedUserId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove user");
    }
  };

  const togglePerm = (perm: string) => {
    setNewRole((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const createRole = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!newRole.name.trim() || newRole.permissions.length === 0) return;
    setRoleSuccess(`Role "${newRole.name.trim()}" saved locally — no backend endpoint for custom roles.`);
    setNewRole({ name: "", permissions: [] });
    setTimeout(() => setRoleSuccess(""), 4000);
  };

  return (
    <div className="db-user-mgmt">
      {/* Stats */}
      <div className="um-stats">
        <div className="um-stat-card">
          <div className="um-stat-val">{loading ? "…" : users.length}</div>
          <div className="um-stat-lbl">👥 Total Users</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-val" style={{ color: "#7c3aed" }}>
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="um-stat-lbl">🔑 Admins</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-val" style={{ color: "#2563eb" }}>
            {users.filter((u) => u.role === "user").length}
          </div>
          <div className="um-stat-lbl">👤 Users</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-val" style={{ color: "#059669" }}>
            {users.filter((u) => u.email_alerts_enabled).length}
          </div>
          <div className="um-stat-lbl">📧 Email Alerts On</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="um-tabs">
        <button className={`um-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          👥 Users
        </button>
        <button className={`um-tab ${activeTab === "roles" ? "active" : ""}`} onClick={() => setActiveTab("roles")}>
          🔑 Roles & Permissions
        </button>
      </div>

      {/* ── Users Tab ── */}
      {activeTab === "users" && (
        <div className="um-panel">
          <div className="um-panel-header">
            <h2 className="um-panel-title">👥 Registered Users</h2>
            <input
              className="um-search"
              type="text"
              placeholder="Search name, email or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>
              ⚠ {error}
            </div>
          )}

          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Email Alerts</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "#9ca3af" }}>
                      Loading users…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "#9ca3af" }}>
                      {search ? "No users match your search." : "No users found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const rc = ROLE_COLOR[user.role] ?? "#6b7280";
                    const isViewed = viewedUserId === user.id;
                    const userRole = ROLES.find((r) => r.name === user.role);
                    return (
                      <Fragment key={user.id}>
                        <tr>
                          <td>
                            <div className="um-user-cell">
                              <div className="um-avatar" style={{ background: rc + "33", color: rc }}>
                                {getInitials(user.name)}
                              </div>
                              <span className="um-user-name">{user.name}</span>
                            </div>
                          </td>
                          <td className="um-email">{user.email}</td>
                          <td>
                            {editingUserId === user.id ? (
                              <select
                                className="um-role-select"
                                defaultValue={user.role}
                                autoFocus
                                onChange={(e) => changeRole(user.id, e.target.value)}
                                onBlur={() => setEditingUserId(null)}
                              >
                                {ROLES.map((r) => (
                                  <option key={r.name} value={r.name}>{r.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="um-role-badge" style={{ background: rc + "20", color: rc }}>
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              className="um-status-chip"
                              style={{
                                background: user.email_alerts_enabled ? "#d1fae5" : "#f3f4f6",
                                color: user.email_alerts_enabled ? "#059669" : "#6b7280",
                                cursor: "pointer",
                              }}
                              onClick={() => toggleEmailAlerts(user.id, user.email_alerts_enabled)}
                              title="Click to toggle"
                            >
                              {user.email_alerts_enabled ? "✓ On" : "Off"}
                            </span>
                          </td>
                          <td className="um-joined">{formatJoined(user.created_at)}</td>
                          <td>
                            <div className="um-actions">
                              <button
                                className="um-btn-sm um-btn-view"
                                onClick={() => setViewedUserId(isViewed ? null : user.id)}
                              >
                                {isViewed ? "✕ Close" : "👁 View"}
                              </button>
                              <button
                                className="um-btn-sm"
                                onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)}
                              >
                                Edit Role
                              </button>
                              <button
                                className="um-btn-sm um-btn-danger"
                                onClick={() => removeUser(user.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isViewed && (
                          <tr>
                            <td colSpan={6} style={{ padding: 0, background: "#f9fafb" }}>
                              <div className="um-user-detail">
                                <div className="um-detail-header">
                                  <div className="um-detail-avatar" style={{ background: rc + "22", color: rc }}>
                                    {getInitials(user.name)}
                                  </div>
                                  <div>
                                    <div className="um-detail-name">{user.name}</div>
                                    <div className="um-detail-email">{user.email}</div>
                                    <span className="um-role-badge" style={{ background: rc + "20", color: rc, marginTop: 6, display: "inline-block" }}>
                                      {user.role}
                                    </span>
                                  </div>
                                </div>
                                <div className="um-detail-body">
                                  <div className="um-detail-section">
                                    <div className="um-detail-lbl">📅 Member since</div>
                                    <div className="um-detail-val">{formatJoined(user.created_at)}</div>
                                  </div>
                                  <div className="um-detail-section">
                                    <div className="um-detail-lbl">📞 Phone</div>
                                    <div className="um-detail-val">{user.phone_number}</div>
                                  </div>
                                  <div className="um-detail-section">
                                    <div className="um-detail-lbl">📧 Email alerts</div>
                                    <div className="um-detail-val">{user.email_alerts_enabled ? "Enabled" : "Disabled"}</div>
                                  </div>
                                  <div className="um-detail-section">
                                    <div className="um-detail-lbl">🔑 Role permissions</div>
                                    <div className="um-detail-perms">
                                      {userRole?.permissions.map((p) => (
                                        <span key={p} className="um-perm-chip" style={{ background: rc + "15", color: rc }}>✓ {p}</span>
                                      )) ?? <span style={{ color: "#9ca3af", fontSize: 12 }}>No permissions found</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Roles Tab ── */}
      {activeTab === "roles" && (
        <>
          <div className="um-panel">
            <h2 className="um-panel-title">🔑 System Roles</h2>
            <div className="um-roles-grid">
              {ROLES.map((role) => (
                <div key={role.name} className="um-role-card" style={{ borderTop: `3px solid ${role.color}` }}>
                  <div className="um-role-head">
                    <span className="um-role-name">{role.name}</span>
                    <span className="um-role-users">
                      {users.filter((u) => u.role === role.name).length} user{users.filter((u) => u.role === role.name).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="um-role-perms">
                    {role.permissions.map((p) => (
                      <span key={p} className="um-perm-chip" style={{ background: role.color + "18", color: role.color }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="um-panel">
            <h2 className="um-panel-title">✨ Create Custom Role</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
              Note: custom roles are local only — the backend supports "admin" and "user" role assignments.
            </p>
            {roleSuccess && <div className="um-success-banner">ℹ {roleSuccess}</div>}
            <form className="um-role-form" onSubmit={createRole}>
              <div className="um-form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. Field Officer"
                  value={newRole.name}
                  onChange={(e) => setNewRole((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="um-form-group">
                <label>Permissions <span style={{ color: "#9ca3af", fontWeight: 400 }}>({newRole.permissions.length} selected)</span></label>
                <div className="um-perm-grid">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm} className="um-perm-checkbox">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(perm)}
                        onChange={() => togglePerm(perm)}
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="um-btn-primary">
                + Create Role
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
