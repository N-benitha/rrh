import React, { useState } from 'react';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const AccountActionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Windows - Chrome',
      location: 'Kigali, Rwanda',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'iPhone - Safari',
      location: 'Kigali, Rwanda',
      lastActive: '3 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'MacBook - Firefox',
      location: 'Huye, Rwanda',
      lastActive: '2 days ago',
      isCurrent: false,
    },
  ]);

  const handleSignOutSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    alert('Session ended successfully');
  };

  const handleSignOutAll = () => {
    if (window.confirm('This will end all sessions. Continue?')) {
      setSessions([]);
      alert('All sessions ended. You will be logged out.');
    }
  };

  const handleDownloadData = () => {
    const data = {
      user: 'Yvette Tuyizere',
      email: 'yvette@rrhub.rw',
      exportDate: new Date().toISOString(),
      dataTypes: ['Profile', 'Settings', 'Activity', 'Reports'],
      format: 'JSON',
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-data-${Date.now()}.json`;
    a.click();
  };

  const handleActivityLog = () => {
    alert('Activity log:\n- Login: Apr 16, 2026 2:30 PM\n- Settings updated: Apr 16, 2026 1:00 PM\n- Profile viewed: Apr 16, 2026 12:30 PM');
  };

  return (
    <div className="aa-container">
      <div className="aa-header">
        <h2>⚙️ Account Actions</h2>
        <p>Manage your account sessions and data</p>
      </div>

      <div className="aa-section">
        <h3>Active Sessions</h3>
        <p className="aa-subtitle">These devices are currently connected to your account</p>

        <div className="aa-sessions-list">
          {sessions.length > 0 ? (
            sessions.map(session => (
              <div key={session.id} className={`aa-session-item ${session.isCurrent ? 'current' : ''}`}>
                <div className="aa-session-info">
                  <div className="aa-device">
                    <span className="aa-device-name">{session.device}</span>
                    {session.isCurrent && <span className="aa-badge-current">Current Device</span>}
                  </div>
                  <div className="aa-session-details">
                    <p className="aa-location">📍 {session.location}</p>
                    <p className="aa-time">⏱️ {session.lastActive}</p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    className="aa-btn-signout-device"
                    onClick={() => handleSignOutSession(session.id)}
                  >
                    End Session
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="aa-no-sessions">No active sessions</p>
          )}
        </div>

        {sessions.length > 1 && (
          <button className="aa-btn-signout-all" onClick={handleSignOutAll}>
            🚪 Sign Out From All Other Devices
          </button>
        )}
      </div>

      <div className="aa-section">
        <h3>Data & Account</h3>

        <div className="aa-actions-grid">
          <button className="aa-action-card" onClick={handleActivityLog}>
            <div className="aa-action-icon">📋</div>
            <div className="aa-action-text">
              <h4>Activity Log</h4>
              <p>View your recent account activity</p>
            </div>
          </button>

          <button className="aa-action-card" onClick={handleDownloadData}>
            <div className="aa-action-icon">💾</div>
            <div className="aa-action-text">
              <h4>Download My Data</h4>
              <p>Export all your data in JSON format</p>
            </div>
          </button>
        </div>
      </div>

      <div className="aa-section">
        <h3>Account Settings</h3>

        <div className="aa-info-box">
          <div className="aa-info-item">
            <label>Account Created</label>
            <p>March 15, 2024</p>
          </div>
          <div className="aa-info-item">
            <label>Last Login</label>
            <p>April 16, 2026 at 2:30 PM</p>
          </div>
          <div className="aa-info-item">
            <label>Last Password Change</label>
            <p>January 10, 2026</p>
          </div>
          <div className="aa-info-item">
            <label>Account Status</label>
            <p>✓ Active & Verified</p>
          </div>
        </div>
      </div>

      <div className="aa-section">
        <h3>Security Recommendations</h3>
        <div className="aa-security-tips">
          <div className="aa-tip">
            <span className="aa-tip-icon">✓</span>
            <p>Your password was last changed on January 10, 2026. Consider updating it regularly.</p>
          </div>
          <div className="aa-tip">
            <span className="aa-tip-icon">✓</span>
            <p>Your email is verified and you have 3 active sessions.</p>
          </div>
          <div className="aa-tip">
            <span className="aa-tip-icon">!</span>
            <p>We recommend signing out from unfamiliar devices immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
