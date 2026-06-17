import { useState } from 'react';
import type { PageProps } from '../../types';
import { apiService } from '../../services/api';

export const SignOutPage: React.FC<PageProps> = ({ setPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    apiService.clearAuth();
    setIsLoading(false);
    setPage('landing');
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
                  <span className="so-label">Browser</span>
                  <span className="so-value">{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'}</span>
                </div>
                <div className="so-info-row">
                  <span className="so-label">Last Activity</span>
                  <span className="so-value">Just now</span>
                </div>
              </div>
            </div>
          </div>

          <div className="so-actions">
            <button className="so-btn-cancel" onClick={() => setPage('dashboard')}>
              ← Return to Dashboard
            </button>
            <button className="so-btn-signout" onClick={() => setShowConfirm(true)}>
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
              <p>You can sign back in anytime with your email and password.</p>
            </div>
            <div className="so-confirm-actions">
              <button className="so-btn-keep-signed" onClick={() => setShowConfirm(false)} disabled={isLoading}>
                Keep Me Signed In
              </button>
              <button className="so-btn-confirm-logout" onClick={handleConfirmSignOut} disabled={isLoading}>
                {isLoading ? 'Signing Out...' : 'Yes, Sign Me Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
