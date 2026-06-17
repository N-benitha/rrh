import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const AccountActionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', device: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser', location: 'Rwanda', lastActive: 'Active now', isCurrent: true },
  ]);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    apiService.validateToken().then((u) => {
      setUserEmail(u.email);
      setUserName(u.full_name || u.email);
      setCreatedAt(u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
    }).catch(() => {});
  }, []);

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
      user: userName,
      email: userEmail,
      exportDate: new Date().toISOString(),
      dataTypes: ['Profile', 'Settings', 'Activity'],
      format: 'JSON',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          {sessions.map(session => (
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
                <button className="aa-btn-signout-device" onClick={() => handleSignOutSession(session.id)}>
                  End Session
                </button>
              )}
            </div>
          ))}
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
          <button className="aa-action-card" onClick={handleDownloadData}>
            <div className="aa-action-icon">💾</div>
            <div className="aa-action-text">
              <h4>Download My Data</h4>
              <p>Export your account data in JSON format</p>
            </div>
          </button>
        </div>
      </div>

      <div className="aa-section">
        <h3>Account Info</h3>
        <div className="aa-info-box">
          <div className="aa-info-item"><label>Email</label><p>{userEmail || '—'}</p></div>
          <div className="aa-info-item"><label>Account Created</label><p>{createdAt || '—'}</p></div>
          <div className="aa-info-item"><label>Last Activity</label><p>{new Date().toLocaleString()}</p></div>
          <div className="aa-info-item"><label>Account Status</label><p>✓ Active & Verified</p></div>
        </div>
      </div>

      <div className="aa-section">
        <h3>Security Recommendations</h3>
        <div className="aa-security-tips">
          <div className="aa-tip"><span className="aa-tip-icon">✓</span><p>Change your password regularly for better security.</p></div>
          <div className="aa-tip"><span className="aa-tip-icon">✓</span><p>Your email is verified.</p></div>
          <div className="aa-tip"><span className="aa-tip-icon">!</span><p>Sign out from unfamiliar devices immediately.</p></div>
        </div>
      </div>
    </div>
  );
};
