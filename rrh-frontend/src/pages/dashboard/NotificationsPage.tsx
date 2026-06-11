import React, { useState } from 'react';

interface NotificationPrefs {
  emailAlerts: boolean;
  smsAlerts: boolean;
  inAppAlerts: boolean;
  dailyDigest: boolean;
  criticalOnly: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailAlerts: true,
    smsAlerts: false,
    inAppAlerts: true,
    dailyDigest: true,
    criticalOnly: false,
  });

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    // Save to local storage or API
    localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
    alert('Notification preferences saved!');
  };

  return (
    <div className="notif-container">
      <div className="notif-header">
        <h2>📧 Notification Preferences</h2>
        <p>Manage how you receive alerts and updates</p>
      </div>

      <div className="notif-section">
        <h3>Alert Channels</h3>
        
        <div className="notif-toggle">
          <div className="notif-info">
            <label>Email Alerts</label>
            <p>Receive alerts via email</p>
          </div>
          <button
            className={`notif-switch ${prefs.emailAlerts ? 'active' : ''}`}
            onClick={() => handleToggle('emailAlerts')}
          >
            {prefs.emailAlerts ? '✓' : '✗'}
          </button>
        </div>

        <div className="notif-toggle">
          <div className="notif-info">
            <label>SMS Alerts</label>
            <p>Receive alerts via text message</p>
          </div>
          <button
            className={`notif-switch ${prefs.smsAlerts ? 'active' : ''}`}
            onClick={() => handleToggle('smsAlerts')}
          >
            {prefs.smsAlerts ? '✓' : '✗'}
          </button>
        </div>

        <div className="notif-toggle">
          <div className="notif-info">
            <label>In-App Notifications</label>
            <p>See alerts inside the application</p>
          </div>
          <button
            className={`notif-switch ${prefs.inAppAlerts ? 'active' : ''}`}
            onClick={() => handleToggle('inAppAlerts')}
          >
            {prefs.inAppAlerts ? '✓' : '✗'}
          </button>
        </div>
      </div>

      <div className="notif-section">
        <h3>Frequency</h3>

        <div className="notif-toggle">
          <div className="notif-info">
            <label>Daily Digest</label>
            <p>Get one summary email per day at 9:00 AM</p>
          </div>
          <button
            className={`notif-switch ${prefs.dailyDigest ? 'active' : ''}`}
            onClick={() => handleToggle('dailyDigest')}
          >
            {prefs.dailyDigest ? '✓' : '✗'}
          </button>
        </div>

        <div className="notif-toggle">
          <div className="notif-info">
            <label>Critical Alerts Only</label>
            <p>Only notify for critical severity events</p>
          </div>
          <button
            className={`notif-switch ${prefs.criticalOnly ? 'active' : ''}`}
            onClick={() => handleToggle('criticalOnly')}
          >
            {prefs.criticalOnly ? '✓' : '✗'}
          </button>
        </div>
      </div>

      <div className="notif-actions">
        <button className="notif-btn-save" onClick={handleSave}>
          Save Preferences
        </button>
      </div>
    </div>
  );
};
