import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiService } from '../../services/api';

export const SignOutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = () => {
    setShowConfirm(true);
  };

  const handleConfirmSignOut = async () => {
    setIsLoading(true);
    
    // Simulate logout API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    apiService.clearAuth();
    
    setIsLoading(false);
    navigate('/');
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="so-container">
      {!showConfirm ? (
        <div className="so-main">
          <div className="so-header">
            <h2>👋 Sign Out</h2>
            <p>You are about to sign out of your account</p>
          </div>

          <div className="so-info-card">
            <div className="so-info-section">
              <h3>Current Session</h3>
              <div className="so-session-info">
                <div className="so-info-row">
                  <span className="so-label">Device</span>
                  <span className="so-value">Windows - Chrome</span>
                </div>
                <div className="so-info-row">
                  <span className="so-label">Location</span>
                  <span className="so-value">Kigali, Rwanda</span>
                </div>
                <div className="so-info-row">
                  <span className="so-label">Session Duration</span>
                  <span className="so-value">2 hours 45 minutes</span>
                </div>
                <div className="so-info-row">
                  <span className="so-label">Last Activity</span>
                  <span className="so-value">Just now</span>
                </div>
              </div>
            </div>
          </div>

          <div className="so-options">
            <h3>Sign Out Options</h3>

            <label className="so-option">
              <input type="radio" name="signout-type" defaultChecked />
              <div>
                <strong>Sign Out This Device Only</strong>
                <p>You'll be signed out on this device, but remain signed in on other devices</p>
              </div>
            </label>

            <label className="so-option">
              <input type="radio" name="signout-type" />
              <div>
                <strong>Sign Out From All Devices</strong>
                <p>You'll be signed out on all devices where you're currently logged in</p>
              </div>
            </label>
          </div>

          <div className="so-actions">
            <button
              className="so-btn-cancel"
              onClick={() => navigate('/dashboard')}
            >
              ← Return to Dashboard
            </button>
            <button
              className="so-btn-signout"
              onClick={handleSignOut}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="so-confirm">
          <div className="so-confirm-card">
            <div className="so-confirm-icon">⚠️</div>
            <h2>Confirm Sign Out</h2>
            <p>Are you sure you want to sign out?</p>

            <div className="so-confirm-details">
              <p>You can sign back in anytime with your email and password. Your data will be safely stored.</p>
            </div>

            <div className="so-confirm-actions">
              <button
                className="so-btn-keep-signed"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Keep Me Signed In
              </button>
              <button
                className="so-btn-confirm-logout"
                onClick={handleConfirmSignOut}
                disabled={isLoading}
              >
                {isLoading ? 'Signing Out...' : 'Yes, Sign Me Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
