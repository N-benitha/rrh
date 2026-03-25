import { useState, useEffect } from 'react';
import type { PageProps } from '../types';

interface DashboardMetrics {
  total_sensors: number;
  active_sensors: number;
  high_risk_areas: number;
  medium_risk_areas: number;
  low_risk_areas: number;
  active_alerts: number;
  last_update: string;
}

interface RiverBasin {
  name: string;
  current_risk_level: 'low' | 'medium' | 'high';
  average_water_level: number;
  rainfall_24h: number;
  sensor_count: number;
  last_update: string;
}

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  affected_areas: string[];
  latitude: number;
  longitude: number;
  radius_km: number;
  status: string;
  created_at: string;
  expires_at: string;
}

const COLORS = {
  primary: "#0A5C36",
  primaryLight: "#0F7A48",
  primaryDark: "#073D24",
  accent: "#F5A623",
  danger: "#DC3545",
  bg: "#F4F7F4",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textMuted: "#6B7B6F",
  border: "#C8D8CB",
};

const styles = `
  .dashboard-container {
    padding: 80px 40px 40px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .dashboard-header {
    margin-bottom: 32px;
  }

  .dashboard-title {
    font-size: 32px;
    font-weight: 700;
    color: ${COLORS.primaryDark};
    margin-bottom: 8px;
  }

  .dashboard-subtitle {
    color: ${COLORS.textMuted};
    font-size: 16px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid ${COLORS.border};
    text-align: center;
    transition: all 0.2s;
  }

  .metric-card:hover {
    border-color: ${COLORS.primary};
    box-shadow: 0 4px 20px rgba(10,92,54,0.1);
  }

  .metric-value {
    font-size: 36px;
    font-weight: 700;
    color: ${COLORS.primary};
    margin-bottom: 8px;
  }

  .metric-label {
    font-size: 14px;
    color: ${COLORS.textMuted};
    margin-bottom: 4px;
  }

  .metric-change {
    font-size: 12px;
    color: ${COLORS.textMuted};
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }

  .dashboard-section {
    background: white;
    border-radius: 16px;
    border: 1px solid ${COLORS.border};
    overflow: hidden;
  }

  .section-header {
    padding: 20px 24px;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: ${COLORS.text};
  }

  .section-content {
    padding: 24px;
  }

  .river-basin-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .basin-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: ${COLORS.bg};
    border-radius: 8px;
    transition: all 0.2s;
  }

  .basin-item:hover {
    background: #E8F5ED;
  }

  .basin-info {
    flex: 1;
  }

  .basin-name {
    font-weight: 600;
    color: ${COLORS.text};
    margin-bottom: 4px;
  }

  .basin-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: ${COLORS.textMuted};
  }

  .risk-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .risk-high {
    background: #FFF0F0;
    color: ${COLORS.danger};
  }

  .risk-medium {
    background: #FFF8E8;
    color: ${COLORS.accent};
  }

  .risk-low {
    background: #E8F5ED;
    color: ${COLORS.primary};
  }

  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
  }

  .alert-item {
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid;
    background: ${COLORS.bg};
  }

  .alert-item.high {
    border-color: ${COLORS.danger};
    background: #FFF0F0;
  }

  .alert-item.medium {
    border-color: ${COLORS.accent};
    background: #FFF8E8;
  }

  .alert-item.low {
    border-color: ${COLORS.primary};
    background: #E8F5ED;
  }

  .alert-title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .alert-message {
    font-size: 14px;
    color: ${COLORS.textMuted};
    margin-bottom: 8px;
  }

  .alert-meta {
    font-size: 12px;
    color: ${COLORS.textMuted};
  }

  .map-container {
    background: white;
    border-radius: 16px;
    border: 1px solid ${COLORS.border};
    overflow: hidden;
    height: 500px;
    position: relative;
  }

  .map-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #E8F5ED, #C8E6D4);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .map-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(10,92,54,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(10,92,54,0.05) 1px, transparent 1px);
    background-size: 30px 30px;
  }

  .map-content {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .refresh-button {
    background: ${COLORS.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .refresh-button:hover {
    background: ${COLORS.primaryLight};
  }

  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 900px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .dashboard-container {
      padding: 80px 20px 20px;
    }
    
    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function Dashboard({ setPage }: PageProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [riverBasins, setRiverBasins] = useState<RiverBasin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use setPage to avoid unused variable warning
  const handleNavigateToAlerts = () => {
    setPage('landing'); // Navigate to alerts page when implemented
  };

  const handleNavigateToMap = () => {
    setPage('map'); // Navigate to full map view
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/dashboard');
      const data = await response.json();
      
      setMetrics(data.metrics);
      setRiverBasins(data.river_basins);
      setAlerts(data.recent_alerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data if API fails
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setMetrics({
      total_sensors: 25,
      active_sensors: 22,
      high_risk_areas: 3,
      medium_risk_areas: 5,
      low_risk_areas: 17,
      active_alerts: 4,
      last_update: new Date().toISOString()
    });

    setRiverBasins([
      {
        name: "Nyabarongo",
        current_risk_level: "medium",
        average_water_level: 3.2,
        rainfall_24h: 72.0,
        sensor_count: 8,
        last_update: new Date().toISOString()
      },
      {
        name: "Sebeya",
        current_risk_level: "high",
        average_water_level: 3.9,
        rainfall_24h: 89.0,
        sensor_count: 5,
        last_update: new Date().toISOString()
      }
    ]);

    setAlerts([
      {
        id: 1,
        title: "High Flood Risk - Sebeya River Basin",
        message: "Elevated water levels detected in Ruhengeri area.",
        severity: "high",
        affected_areas: ["Ruhengeri", "Musanze"],
        latitude: -1.5097,
        longitude: 29.6324,
        radius_km: 15.0,
        status: "active",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      }
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <style>{styles}</style>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
          <p style={{ marginTop: '16px', color: COLORS.textMuted }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Flood Risk Dashboard</h1>
          <p className="dashboard-subtitle">Real-time monitoring and prediction for Rwanda river basins</p>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{metrics?.total_sensors || 0}</div>
            <div className="metric-label">Total Sensors</div>
            <div className="metric-change">{metrics?.active_sensors || 0} active</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: COLORS.danger }}>{metrics?.high_risk_areas || 0}</div>
            <div className="metric-label">High Risk Areas</div>
            <div className="metric-change">Requires immediate attention</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: COLORS.accent }}>{metrics?.medium_risk_areas || 0}</div>
            <div className="metric-label">Medium Risk Areas</div>
            <div className="metric-change">Monitor closely</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: COLORS.primary }}>{metrics?.low_risk_areas || 0}</div>
            <div className="metric-label">Low Risk Areas</div>
            <div className="metric-change">Normal conditions</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics?.active_alerts || 0}</div>
            <div className="metric-label">Active Alerts</div>
            <div className="metric-change">Last updated: {metrics?.last_update ? new Date(metrics.last_update).toLocaleTimeString() : 'Never'}</div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* River Basins Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">River Basin Status</h2>
              <button className="refresh-button" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <span className="loading-spinner"></span> : 'Refresh'}
              </button>
            </div>
            <div className="section-content">
              <div className="river-basin-list">
                {riverBasins.map((basin, index) => (
                  <div key={index} className="basin-item">
                    <div className="basin-info">
                      <div className="basin-name">{basin.name}</div>
                      <div className="basin-stats">
                        <span>Water: {basin.average_water_level}m</span>
                        <span>Rain: {basin.rainfall_24h}mm</span>
                        <span>{basin.sensor_count} sensors</span>
                      </div>
                    </div>
                    <span className={`risk-badge risk-${basin.current_risk_level}`}>
                      {basin.current_risk_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Alerts Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Alerts</h2>
              <button className="refresh-button" onClick={handleNavigateToAlerts}>
                View All
              </button>
            </div>
            <div className="section-content">
              <div className="alert-list">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      {alert.affected_areas.join(', ')} • {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Map */}
        <div className="map-container">
          <div className="section-header">
            <h2 className="section-title">Risk Map - Rwanda</h2>
            <button className="refresh-button" onClick={handleNavigateToMap}>
              Full Map View
            </button>
          </div>
          <div className="map-placeholder">
            <div className="map-grid"></div>
            <div className="map-content">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <h3 style={{ color: COLORS.primaryDark, marginBottom: '8px' }}>Interactive Risk Map</h3>
              <p style={{ color: COLORS.textMuted, maxWidth: '400px', margin: '0 auto' }}>
                Real-time flood risk visualization across Rwanda river basins with sensor locations and alert zones
              </p>
              <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.danger }}></div>
                  <span style={{ fontSize: '14px', color: COLORS.textMuted }}>High Risk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.accent }}></div>
                  <span style={{ fontSize: '14px', color: COLORS.textMuted }}>Medium Risk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.primary }}></div>
                  <span style={{ fontSize: '14px', color: COLORS.textMuted }}>Low Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
