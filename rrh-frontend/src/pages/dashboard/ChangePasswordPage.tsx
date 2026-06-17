import { useState } from 'react';
import { apiService } from '../../services/api';

interface PasswordForm {
  current: string;
  newPassword: string;
  confirm: string;
}

export const ChangePasswordPage: React.FC = () => {
  const [form, setForm] = useState<PasswordForm>({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors([]);
    setSuccess(false);
  };

  const validatePassword = (): boolean => {
    const newErrors: string[] = [];

    if (!form.current) newErrors.push('Current password is required');
    if (!form.newPassword) newErrors.push('New password is required');
    if (!form.confirm) newErrors.push('Password confirmation is required');

    if (form.newPassword !== form.confirm) {
      newErrors.push('New passwords do not match');
    }

    if (form.newPassword && form.newPassword.length < 8) {
      newErrors.push('New password must be at least 8 characters long');
    }

    if (form.newPassword === form.current) {
      newErrors.push('New password must be different from current password');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setLoading(true);
    try {
      await apiService.changePassword(form.current, form.newPassword);
      setSuccess(true);
      setForm({ current: '', newPassword: '', confirm: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) {
      setErrors([e.message || 'Current password is incorrect.']);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setForm({ current: '', newPassword: '', confirm: '' });
    setErrors([]);
    setSuccess(false);
  };

  return (
    <div className="cp-container">
      <div className="cp-header">
        <h2>🔐 Change Password</h2>
        <p>Update your account password to keep your account secure</p>
      </div>

      {success && (
        <div className="cp-success-banner">
          ✓ Password changed successfully!
        </div>
      )}

      {errors.length > 0 && (
        <div className="cp-error-banner">
          <h4>Please fix the following errors:</h4>
          <ul>
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="cp-card">
        <div className="cp-form-group">
          <label htmlFor="current">Current Password</label>
          <input
            id="current"
            type="password"
            name="current"
            value={form.current}
            onChange={handleChange}
            placeholder="Enter your current password"
            className="cp-input"
          />
          <p className="cp-hint">For security, we need your current password to verify it's you</p>
        </div>

        <div className="cp-divider"></div>

        <div className="cp-form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Enter your new password"
            className="cp-input"
          />
          <div className="cp-password-requirements">
            <p>Password must be:</p>
            <ul>
              <li className={form.newPassword.length >= 8 ? 'met' : ''}>At least 8 characters</li>
              <li className={/[A-Z]/.test(form.newPassword) ? 'met' : ''}>Include uppercase letter</li>
              <li className={/[a-z]/.test(form.newPassword) ? 'met' : ''}>Include lowercase letter</li>
              <li className={/[0-9]/.test(form.newPassword) ? 'met' : ''}>Include number</li>
            </ul>
          </div>
        </div>

        <div className="cp-form-group">
          <label htmlFor="confirm">Confirm New Password</label>
          <input
            id="confirm"
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Re-enter your new password"
            className="cp-input"
          />
        </div>
      </div>

      <div className="cp-info-box">
        <h4>🔒 Password Security Tips</h4>
        <ul>
          <li>Use a unique password not used on other sites</li>
          <li>Avoid using personal information (birthdate, names, etc.)</li>
          <li>Use a mix of uppercase, lowercase, numbers, and symbols</li>
          <li>Don't share your password with anyone</li>
        </ul>
      </div>

      <div className="cp-actions">
        <button className="cp-btn-reset" onClick={handleResetForm}>
          Clear Form
        </button>
        <button className="cp-btn-save" onClick={handleChangePassword} disabled={loading}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </div>
  );
};
