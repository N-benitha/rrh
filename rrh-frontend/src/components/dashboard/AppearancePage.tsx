import React, { useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface AppearanceSettings {
  theme: Theme;
  fontSize: number;
  compactMode: boolean;
  showAnimations: boolean;
}

export const AppearancePage: React.FC = () => {
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: 'dark',
    fontSize: 14,
    compactMode: false,
    showAnimations: true,
  });

  const handleThemeChange = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const handleFontSizeChange = (size: number) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof AppearanceSettings],
    }));
  };

  const handleSave = () => {
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.style.fontSize = settings.fontSize + 'px';
    
    alert('Appearance settings saved!');
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>🎨 Appearance</h2>
        <p>Customize how the dashboard looks and feels</p>
      </div>

      <div className="app-section">
        <h3>Theme</h3>
        <div className="app-theme-grid">
          <label className={`app-theme-card ${settings.theme === 'light' ? 'active' : ''}`}>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={settings.theme === 'light'}
              onChange={() => handleThemeChange('light')}
              style={{ display: 'none' }}
            />
            <div className="app-preview light-preview">
              <div className="app-bar"></div>
              <div className="app-content">
                <div className="app-box"></div>
                <div className="app-box"></div>
              </div>
            </div>
            <span>Light</span>
          </label>

          <label className={`app-theme-card ${settings.theme === 'dark' ? 'active' : ''}`}>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={settings.theme === 'dark'}
              onChange={() => handleThemeChange('dark')}
              style={{ display: 'none' }}
            />
            <div className="app-preview dark-preview">
              <div className="app-bar"></div>
              <div className="app-content">
                <div className="app-box"></div>
                <div className="app-box"></div>
              </div>
            </div>
            <span>Dark</span>
          </label>

          <label className={`app-theme-card ${settings.theme === 'auto' ? 'active' : ''}`}>
            <input
              type="radio"
              name="theme"
              value="auto"
              checked={settings.theme === 'auto'}
              onChange={() => handleThemeChange('auto')}
              style={{ display: 'none' }}
            />
            <div className="app-preview auto-preview">
              <div className="app-bar"></div>
              <div className="app-content">
                <div className="app-box"></div>
                <div className="app-box"></div>
              </div>
            </div>
            <span>Auto</span>
          </label>
        </div>
      </div>

      <div className="app-section">
        <h3>Font Size</h3>
        <div className="app-font-control">
          <span className="font-small">A</span>
          <input
            type="range"
            min="12"
            max="18"
            value={settings.fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="app-slider"
          />
          <span className="font-large">A</span>
          <span className="font-value">{settings.fontSize}px</span>
        </div>
      </div>

      <div className="app-section">
        <h3>Display Options</h3>
        
        <div className="app-toggle">
          <div>
            <label>Compact Mode</label>
            <p>Reduce padding and spacing for a compact layout</p>
          </div>
          <button
            className={`app-switch ${settings.compactMode ? 'active' : ''}`}
            onClick={() => handleToggle('compactMode')}
          >
            {settings.compactMode ? '✓' : '✗'}
          </button>
        </div>

        <div className="app-toggle">
          <div>
            <label>Show Animations</label>
            <p>Enable smooth transitions and animations</p>
          </div>
          <button
            className={`app-switch ${settings.showAnimations ? 'active' : ''}`}
            onClick={() => handleToggle('showAnimations')}
          >
            {settings.showAnimations ? '✓' : '✗'}
          </button>
        </div>
      </div>

      <div className="app-actions">
        <button className="app-btn-save" onClick={handleSave}>
          Save Appearance Settings
        </button>
      </div>
    </div>
  );
};
