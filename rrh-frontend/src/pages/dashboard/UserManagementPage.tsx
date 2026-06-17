import { useState, useEffect, Fragment } from "react";
import { apiService } from "../../services/api";

type UserStatus = "active" | "pending" | "inactive";
type RoleName = string;

interface User {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  status: UserStatus;
  joined: string;
  initials: string;
}

interface Role {
  id: number;
  name: string;
  permissions: string[];
  users: number;
  color: string;
}

const ALL_PERMISSIONS = [
  "View Dashboard",
  "View Analytics",
  "Manage Alerts",
  "Create Reports",
  "Export Data",
  "Manage Zones",
  "Manage Users",
  "Configure Settings",
];


const INITIAL_ROLES: Role[] = [
  {
    id: 1, name: "Admin", users: 1, color: "#7c3aed",
    permissions: ["View Dashboard", "View Analytics", "Manage Alerts", "Create Reports", "Export Data", "Manage Zones", "Manage Users", "Configure Settings"],
  },
  {
    id: 2, name: "Analyst", users: 2, color: "#2563eb",
    permissions: ["View Dashboard", "View Analytics", "Create Reports", "Export Data", "Manage Alerts"],
  },
  {
    id: 3, name: "Zone Manager", users: 1, color: "#059669",
    permissions: ["View Dashboard", "Manage Zones", "Manage Alerts", "View Analytics"],
  },
  {
    id: 4, name: "Observer", users: 1, color: "#6b7280",
    permissions: ["View Dashboard", "View Analytics"],
  },
];

const ROLE_COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#7c3aed", "#be185d"];

const STATUS_STYLE: Record<UserStatus, { color: string; bg: string }> = {
  active:   { color: "#059669", bg: "#d1fae5" },
  pending:  { color: "#d97706", bg: "#fef3c7" },
  inactive: { color: "#6b7280", bg: "#f3f4f6" },
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);

  useEffect(() => {
    apiService.getUsers().then((data) => {
      const mapped: User[] = data.map((u: any) => ({
        id: u.id,
        name: u.full_name || u.email,
        email: u.email,
        role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : "Viewer",
        status: u.is_active ? "active" : "inactive",
        joined: u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
        initials: (u.full_name || u.email).split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
      }));
      setUsers(mapped);
    }).catch(() => {});
  }, []);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewedUserId, setViewedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });
  const [roleSuccess, setRoleSuccess] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = (userId: number, roleName: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: roleName } : u)));
    setEditingUserId(null);
  };

  const toggleStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  const approveUser = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u))
    );
  };

  const removeUser = (userId: number) => {
    if (!window.confirm("Remove this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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
    const name = newRole.name.trim();
    setRoles((prev) => [
      ...prev,
      { id: Date.now(), name, permissions: [...newRole.permissions], users: 0, color: ROLE_COLORS[prev.length % ROLE_COLORS.length] },
    ]);
    setRoleSuccess(`Role "${name}" created!`);
    setNewRole({ name: "", permissions: [] });
    setTimeout(() => setRoleSuccess(""), 3000);
  };

  const deleteRole = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.users > 0) return;
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
  };

  const getRoleColor = (roleName: string) =>
    roles.find((r) => r.name === roleName)?.color ?? "#6b7280";

  return (
    <div className="db-user-mgmt">
      {/* Stats */}
      <div className="um-stats">
        <div className="um-stat-card">
          <div className="um-stat-val">{users.length}</div>
          <div className="um-stat-lbl">👥 Total Users</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-val" style={{ color: "#059669" }}>
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="um-stat-lbl">✅ Active</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-val" style={{ color: "#d97706" }}>
            {users.filter((u) => u.status === "pending").length}
          </div>
          <div className="um-stat-lbl">⏳ Pending Approval</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-val" style={{ color: "#7c3aed" }}>
            {roles.length}
          </div>
          <div className="um-stat-lbl">🔑 Roles</div>
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
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const ss = STATUS_STYLE[user.status];
                  const rc = getRoleColor(user.role);
                  const isViewed = viewedUserId === user.id;
                  const userRole = roles.find((r) => r.name === user.role);
                  return (
                    <Fragment key={user.id}>
                      <tr>
                        <td>
                          <div className="um-user-cell">
                            <div className="um-avatar" style={{ background: rc + "33", color: rc }}>{user.initials}</div>
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
                              {roles.map((r) => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="um-role-badge" style={{ background: rc + "20", color: rc }}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="um-status-chip" style={{ background: ss.bg, color: ss.color }}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="um-joined">{user.joined}</td>
                        <td>
                          <div className="um-actions">
                            <button className="um-btn-sm um-btn-view" onClick={() => setViewedUserId(isViewed ? null : user.id)}>
                              {isViewed ? "✕ Close" : "👁 View"}
                            </button>
                            <button className="um-btn-sm" onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)}>
                              Edit Role
                            </button>
                            {user.status === "pending" ? (
                              <button className="um-btn-sm um-btn-approve" onClick={() => approveUser(user.id)}>
                                Approve
                              </button>
                            ) : (
                              <button className="um-btn-sm" onClick={() => toggleStatus(user.id)}>
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            <button className="um-btn-sm um-btn-danger" onClick={() => removeUser(user.id)}>
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
                                <div className="um-detail-avatar" style={{ background: rc + "22", color: rc }}>{user.initials}</div>
                                <div>
                                  <div className="um-detail-name">{user.name}</div>
                                  <div className="um-detail-email">{user.email}</div>
                                  <span className="um-role-badge" style={{ background: rc + "20", color: rc, marginTop: 6, display: "inline-block" }}>
                                    {user.role}
                                  </span>
                                </div>
                                <span className="um-status-chip" style={{ background: ss.bg, color: ss.color, alignSelf: "flex-start" }}>
                                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                </span>
                              </div>
                              <div className="um-detail-body">
                                <div className="um-detail-section">
                                  <div className="um-detail-lbl">📅 Member since</div>
                                  <div className="um-detail-val">{user.joined}</div>
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
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "#9ca3af" }}>
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Roles Tab ── */}
      {activeTab === "roles" && (
        <>
          {/* Existing roles */}
          <div className="um-panel">
            <h2 className="um-panel-title">🔑 Existing Roles</h2>
            <div className="um-roles-grid">
              {roles.map((role) => (
                <div key={role.id} className="um-role-card" style={{ borderTop: `3px solid ${role.color}` }}>
                  <div className="um-role-head">
                    <span className="um-role-name">{role.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="um-role-users">{role.users} user{role.users !== 1 ? "s" : ""}</span>
                      {role.users === 0 && (
                        <button className="um-btn-sm um-btn-danger" style={{ padding: "2px 8px", fontSize: 10 }} onClick={() => deleteRole(role.id)}>
                          Delete
                        </button>
                      )}
                    </div>
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

          {/* Create Role */}
          <div className="um-panel">
            <h2 className="um-panel-title">✨ Create New Role</h2>
            {roleSuccess && <div className="um-success-banner">✅ {roleSuccess}</div>}
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
