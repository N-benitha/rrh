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
    id: 4, name: "Resident", users: 1, color: "#6b7280",
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
  const [currentUserRole, setCurrentUserRole] = useState<string>("admin");

  useEffect(() => {
    apiService.validateToken().then((u) => {
      setCurrentUserRole(u.role?.toLowerCase() || "admin");
    }).catch(() => {});
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
  const [showCreate, setShowCreate] = useState(false);
  const isSuperAdmin = currentUserRole === "superadmin";
  const [createForm, setCreateForm] = useState({ full_name: "", email: "", password: "", role: "RESIDENT", region: "" });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      setCreateError("Name, email and password are required.");
      return;
    }
    try {
      const res = await apiService.adminCreateUser(createForm);
      const role = res.role.charAt(0).toUpperCase() + res.role.slice(1).toLowerCase();
      const initials = createForm.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
      setUsers((prev) => [...prev, {
        id: res.id, name: createForm.full_name, email: createForm.email,
        role, status: "active", joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), initials,
      }]);
      setCreateSuccess(`Account created for ${createForm.full_name}`);
      setCreateForm({ full_name: "", email: "", password: "", role: "VIEWER", region: "" });
      setShowCreate(false);
      setTimeout(() => setCreateSuccess(""), 4000);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create user.");
    }
  };

  const changeRole = async (userId: number, roleName: string) => {
    try {
      await apiService.updateUserRole(userId, roleName);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: roleName } : u)));
    } catch {
      alert("Failed to update role. Please try again.");
    }
    setEditingUserId(null);
  };

  const toggleStatus = async (userId: number) => {
    try {
      const res = await apiService.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: res.is_active ? "active" : "inactive" } : u
        )
      );
    } catch {
      alert("Failed to update status. Please try again.");
    }
  };

  const approveUser = async (userId: number) => {
    try {
      const res = await apiService.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: res.is_active ? "active" : "inactive" } : u))
      );
    } catch {
      alert("Failed to approve user. Please try again.");
    }
  };

  const removeUser = async (userId: number) => {
    if (!window.confirm("Remove this user?")) return;
    try {
      await apiService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      alert("Failed to remove user. Please try again.");
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
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="um-search"
                type="text"
                placeholder="Search name, email or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="um-btn-primary" style={{ whiteSpace: "nowrap" }} onClick={() => setShowCreate((v) => !v)}>
                {showCreate ? "✕ Cancel" : "+ Create User"}
              </button>
            </div>
          </div>

          {createSuccess && <div className="um-success-banner">✅ {createSuccess}</div>}

          {showCreate && (
            <form className="um-role-form" onSubmit={handleCreate} style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#1e3a5f" }}>Create New Account</h3>
              {createError && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{createError}</div>}
              <div className="um-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="um-form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="e.g. Jean Paul" value={createForm.full_name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div className="um-form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="user@example.com" value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="um-form-group">
                  <label>Password *</label>
                  <input type="password" placeholder="Minimum 6 characters" value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="um-form-group">
                  <label>Role *</label>
                  <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}>
                    <option value="RESIDENT">Resident</option>
                    {isSuperAdmin && <option value="ANALYST">Analyst</option>}
                    {isSuperAdmin && <option value="ZONE_MANAGER">Zone Manager</option>}
                    {isSuperAdmin && <option value="ADMIN">Admin</option>}
                    {isSuperAdmin && <option value="SUPERADMIN">Super Admin</option>}
                  </select>
                </div>
                <div className="um-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Region *</label>
                  <select value={createForm.region} onChange={(e) => setCreateForm((f) => ({ ...f, region: e.target.value }))}>
                    <option value="">— Select region —</option>
                    <option value="Rutsiro (Upstream — SEBY-US-01)">Rutsiro — Upstream (SEBY-US-01)</option>
                    <option value="Nyundo (Midstream — SEBY-MS-02)">Nyundo — Midstream (SEBY-MS-02)</option>
                    <option value="Kanama/Rubavu (Downstream — SEBY-DS-03)">Kanama/Rubavu — Downstream (SEBY-DS-03)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="um-btn-primary" style={{ marginTop: 12 }}>
                Create Account
              </button>
            </form>
          )}
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
                              <option value="Resident">Resident</option>
                              {isSuperAdmin && <option value="Analyst">Analyst</option>}
                              {isSuperAdmin && <option value="Zone Manager">Zone Manager</option>}
                              {isSuperAdmin && <option value="Admin">Admin</option>}
                              {isSuperAdmin && <option value="Superadmin">Super Admin</option>}
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
