import React from 'react';

export const DataPrivacyPage: React.FC = () => {
  const handleDownloadData = () => {
    const data = {
      user: 'Yvette Tuyizere',
      email: 'yvette@rhh.rw',
      exportDate: new Date().toISOString(),
      dataTypes: ['Profile', 'Settings', 'Preferences', 'Activity'],
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rrh-data-${Date.now()}.json`;
    a.click();
  };

  const handleActivityLog = () => {
    alert('Opening activity log...');
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm(
      'Are you sure? This will permanently delete your account and all associated data. This cannot be undone.'
    );
    if (confirm) {
      alert('Account deletion initiated. You will receive a confirmation email.');
    }
  };

  return (
    <div className="dp-container">
      <div className="dp-header">
        <h2>🔒 Data & Privacy</h2>
        <p>Manage your data and privacy settings</p>
      </div>

      <div className="dp-section">
        <h3>Your Data</h3>
        
        <div className="dp-info-card">
          <div className="dp-stat">
            <span className="dp-label">Storage Used</span>
            <span className="dp-value">4.2 GB</span>
          </div>
          <div className="dp-progress">
            <div className="dp-progress-bar">
              <div className="dp-progress-fill" style={{ width: '42%' }}></div>
            </div>
            <span className="dp-progress-text">4.2 GB / 10 GB</span>
          </div>
        </div>

        <div className="dp-actions-group">
          <button className="dp-btn-secondary" onClick={handleActivityLog}>
            📋 View Activity Log
          </button>
          <button className="dp-btn-secondary" onClick={handleDownloadData}>
            💾 Download My Data
          </button>
        </div>
      </div>

      <div className="dp-section">
        <h3>Account Information</h3>
        
        <div className="dp-info-grid">
          <div className="dp-info-item">
            <label>Account Created</label>
            <p>March 15, 2024</p>
          </div>
          <div className="dp-info-item">
            <label>Last Login</label>
            <p>April 16, 2026 at 2:30 PM</p>
          </div>
          <div className="dp-info-item">
            <label>Email Verified</label>
            <p>✓ Yes</p>
          </div>
          <div className="dp-info-item">
            <label>Two-Factor Auth</label>
            <p>Not Enabled</p>
          </div>
        </div>
      </div>

      <div className="dp-section">
        <h3>Privacy Settings</h3>
        
        <div className="dp-info-box">
          <h4>Data Collection</h4>
          <p>We collect anonymous usage data to improve the platform. You can opt out at any time.</p>
          <label className="dp-checkbox">
            <input type="checkbox" defaultChecked />
            Allow usage analytics
          </label>
          <label className="dp-checkbox">
            <input type="checkbox" defaultChecked />
            Share error reports
          </label>
        </div>

        <div className="dp-info-box">
          <h4>Data Retention</h4>
          <p>Your data is retained according to our privacy policy:</p>
          <ul>
            <li>Activity logs: 90 days</li>
            <li>Alert history: 1 year</li>
            <li>Reports: Indefinite</li>
            <li>User profile: Until deletion</li>
          </ul>
        </div>
      </div>

      <div className="dp-section dp-danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <p>These actions cannot be undone</p>
        
        <button className="dp-btn-danger" onClick={handleDeleteAccount}>
          🗑️ Delete Account Permanently
        </button>
      </div>

      <div className="dp-footer">
        <p>For more information, see our <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a></p>
      </div>
    </div>
  );
};
