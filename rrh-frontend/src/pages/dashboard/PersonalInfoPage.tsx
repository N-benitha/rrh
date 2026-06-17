import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  role: string;
}

export const PersonalInfoPage: React.FC = () => {
  const [info, setInfo] = useState<PersonalInfo>({
    firstName: '', lastName: '', email: '', institution: '', role: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(info);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiService.validateToken().then((u) => {
      const parts = (u.full_name || '').split(' ');
      const loaded = {
        firstName:   parts[0] || '',
        lastName:    parts.slice(1).join(' ') || '',
        email:       u.email || '',
        institution: u.institution || '',
        role:        u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : '',
      };
      setInfo(loaded);
      setFormData(loaded);
    }).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setInfo(formData);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData(info);
    setIsEditing(false);
  };

  return (
    <div className="pi-container">
      <div className="pi-header">
        <h2>👤 Personal Information</h2>
        <p>Manage your profile details</p>
      </div>

      {saved && <div className="set-success-banner">✓ Profile updated successfully</div>}

      {!isEditing && (
        <div className="pi-view-mode">
          <div className="pi-card">
            <div className="pi-section">
              <h3>Profile</h3>
              <div className="pi-grid">
                <div className="pi-field"><label>First Name</label><p>{info.firstName || '—'}</p></div>
                <div className="pi-field"><label>Last Name</label><p>{info.lastName || '—'}</p></div>
              </div>
            </div>
            <div className="pi-section">
              <h3>Contact Information</h3>
              <div className="pi-grid">
                <div className="pi-field"><label>Email Address</label><p>{info.email}</p></div>
                <div className="pi-field"><label>Institution</label><p>{info.institution || '—'}</p></div>
              </div>
            </div>
            <div className="pi-section">
              <h3>Position</h3>
              <div className="pi-grid">
                <div className="pi-field"><label>Role</label><p>{info.role}</p></div>
              </div>
            </div>
          </div>
          <button className="pi-btn-edit" onClick={() => setIsEditing(true)}>✏️ Edit Information</button>
        </div>
      )}

      {isEditing && (
        <div className="pi-edit-mode">
          <div className="pi-card">
            <div className="pi-section">
              <h3>Profile</h3>
              <div className="pi-form-grid">
                <div className="pi-form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="pi-input" />
                </div>
                <div className="pi-form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="pi-input" />
                </div>
              </div>
            </div>
            <div className="pi-section">
              <h3>Contact Information</h3>
              <div className="pi-form-grid">
                <div className="pi-form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="pi-input" disabled />
                </div>
                <div className="pi-form-group">
                  <label>Institution</label>
                  <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="pi-input" />
                </div>
              </div>
            </div>
          </div>
          <div className="pi-actions">
            <button className="pi-btn-cancel" onClick={handleCancel}>Cancel</button>
            <button className="pi-btn-save" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoPage;
