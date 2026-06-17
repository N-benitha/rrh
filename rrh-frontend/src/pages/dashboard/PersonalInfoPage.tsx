import React, { useState } from 'react';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  role: string;
}

export const PersonalInfoPage: React.FC = () => {
  const [info, setInfo] = useState<PersonalInfo>({
    firstName: 'Yvette',
    lastName: 'Tuyizere',
    email: 'yvette@rrhub.rw',
    phone: '+250 788 123 456',
    location: 'Kigali, Rwanda',
    department: 'Flood Risk Assessment',
    role: 'Analyst',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(info);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setInfo(formData);
    setIsEditing(false);
    localStorage.setItem('userInfo', JSON.stringify(formData));
    alert('Personal info saved successfully!');
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

      {!isEditing && (
        <div className="pi-view-mode">
          <div className="pi-card">
            <div className="pi-section">
              <h3>Profile</h3>
              <div className="pi-grid">
                <div className="pi-field">
                  <label>First Name</label>
                  <p>{info.firstName}</p>
                </div>
                <div className="pi-field">
                  <label>Last Name</label>
                  <p>{info.lastName}</p>
                </div>
              </div>
            </div>

            <div className="pi-section">
              <h3>Contact Information</h3>
              <div className="pi-grid">
                <div className="pi-field">
                  <label>Email Address</label>
                  <p>{info.email}</p>
                </div>
                <div className="pi-field">
                  <label>Phone Number</label>
                  <p>{info.phone}</p>
                </div>
                <div className="pi-field">
                  <label>Location</label>
                  <p>{info.location}</p>
                </div>
              </div>
            </div>

            <div className="pi-section">
              <h3>Position</h3>
              <div className="pi-grid">
                <div className="pi-field">
                  <label>Department</label>
                  <p>{info.department}</p>
                </div>
                <div className="pi-field">
                  <label>Role</label>
                  <p>{info.role}</p>
                </div>
              </div>
            </div>
          </div>

          <button className="pi-btn-edit" onClick={() => setIsEditing(true)}>
            ✏️ Edit Information
          </button>
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
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pi-input"
                  />
                </div>
                <div className="pi-form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pi-input"
                  />
                </div>
              </div>
            </div>

            <div className="pi-section">
              <h3>Contact Information</h3>
              <div className="pi-form-grid">
                <div className="pi-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pi-input"
                  />
                </div>
                <div className="pi-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pi-input"
                  />
                </div>
                <div className="pi-form-group full-width">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="pi-input"
                  />
                </div>
              </div>
            </div>

            <div className="pi-section">
              <h3>Position</h3>
              <div className="pi-form-grid">
                <div className="pi-form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="pi-input"
                  />
                </div>
                <div className="pi-form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="pi-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pi-actions">
            <button className="pi-btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="pi-btn-save" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
