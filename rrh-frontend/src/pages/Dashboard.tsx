import { useState, useEffect } from "react";
import type { PageProps } from "../types";

const COLORS = {
  primary: "#1E5BA8",      // Water blue instead of green
  primaryLight: "#3B82F6",   // Lighter blue
  primaryDark: "#1E40AF",   // Darker blue
  accent: "#F97316",       // Orange for warnings
  accentLight: "#FB923C",   // Light orange
  danger: "#DC2626",       // Red for high risk
  bg: "#F8FAFC",          // Light gray background
  bgDark: "#0F172A",       // Dark background
  white: "#FFFFFF",
  text: "#1E293B",         // Dark text
  textMuted: "#64748B",     // Muted text
  border: "#E2E8F0",       // Light border
  cardBg: "#FFFFFF",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@400;500&display=swap');

  .dashboard {
    min-height: 100vh;
    background: ${COLORS.bg};
    padding: 80px 20px 20px;
  }

  .dashboard-header {
    max-width: 1400px;
    margin: 0 auto 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .dashboard-title {
    font-family: 'Sora', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: ${COLORS.primaryDark};
    margin: 0;
  }

  .dashboard-subtitle {
    font-size: 16px;
    color: ${COLORS.textMuted};
    margin: 4px 0 0 0;
  }

  .dashboard-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .refresh-btn {
    padding: 10px 16px;
    background: white;
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .refresh-btn:hover {
    border-color: ${COLORS.primary};
    background: #f0f7f3;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: white;
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    font-size: 14px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10B981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }

  .dashboard-grid {
    max-width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid ${COLORS.border};
    transition: all 0.2s;
  }

  .card:hover {
    border-color: ${COLORS.primaryLight};
    box-shadow: 0 4px 20px rgba(10,92,54,0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .card-title {
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: ${COLORS.text};
    margin: 0;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .metric-value {
    font-family: 'Sora', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: ${COLORS.text};
    margin: 8px 0;
  }

  .metric-label {
    font-size: 14px;
    color: ${COLORS.textMuted};
    margin-bottom: 4px;
  }

  .metric-change {
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .metric-change.positive {
    color: ${COLORS.primary};
  }

  .metric-change.negative {
    color: ${COLORS.danger};
  }

  .risk-level {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
  }

  .risk-high {
    background: #FEE2E2;
    color: ${COLORS.danger};
  }

  .risk-medium {
    background: #FED7AA;
    color: ${COLORS.accent};
  }

  .risk-low {
    background: #DBEAFE;
    color: ${COLORS.primary};
  }

  .map-container {
    grid-column: span 2;
    min-height: 400px;
    background: linear-gradient(145deg, #DBEAFE, #BFDBFE);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }

  .map-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: ${COLORS.primary};
  }

  .map-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(30,91,168,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,91,168,0.05) 1px, transparent 1px);
    background-size: 30px 30px;
  }

  .map-pins {
    position: absolute;
    inset: 0;
  }

  .map-pin {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: transform 0.2s;
  }

  .map-pin:hover {
    transform: scale(1.2);
  }

  .alert-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .alert-item {
    padding: 12px;
    border-left: 4px solid ${COLORS.border};
    background: #FAFBFA;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .alert-item.high {
    border-left-color: ${COLORS.danger};
    background: #FFF0F0;
  }

  .alert-item.medium {
    border-left-color: ${COLORS.accent};
    background: #FFF8E8;
  }

  .alert-item.low {
    border-left-color: ${COLORS.primary};
    background: #E8F5ED;
  }

  .alert-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .alert-message {
    font-size: 13px;
    color: ${COLORS.textMuted};
    margin-bottom: 8px;
  }

  .alert-time {
    font-size: 11px;
    color: ${COLORS.textMuted};
  }

  .chart-container {
    height: 200px;
    margin-top: 16px;
  }

  .chart-placeholder {
    height: 100%;
    background: linear-gradient(135deg, #F8FAF8, #ECF2ED);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${COLORS.textMuted};
    font-size: 13px;
  }

  .sensor-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 16px;
  }

  .sensor-item {
    padding: 12px;
    background: #F8FAF8;
    border-radius: 8px;
    border: 1px solid #ECF2ED;
  }

  .sensor-name {
    font-size: 12px;
    color: ${COLORS.textMuted};
    margin-bottom: 4px;
  }

  .sensor-value {
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: ${COLORS.text};
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(10,92,54,0.2);
    border-top-color: ${COLORS.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    
    .map-container {
      grid-column: span 1;
    }
  }
`;

interface DashboardData {
  overview: {
    active_alerts: number;
    monitored_regions: string[];
    system_status: string;
    last_update: string;
    risk_summary: { high: number; medium: number; low: number };
  };
  currentRisk: {
    region: string;
    risk_level: string;
    confidence_score: number;
    rainfall_mm: number;
    river_level_m: number;
    next_update: string;
  }[];
  alerts: {
    id: number;
    title: string;
    severity: string;
    message: string;
    created_at: string;
    affected_areas: string[];
  }[];
  sensorData: {
    region: string;
    water_level_avg: number;
    rainfall_24h: number;
    temperature: number;
    humidity: number;
    soil_moisture_avg: number;
  }[];
}

// @ts-ignore unused parameter
function Dashboard({ setPage }: PageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - in real app, these would be actual API calls
      const mockData: DashboardData = {
        overview: {
          active_alerts: 2,
          monitored_regions: ['Kigali', 'Nyabarongo', 'Sebeya', 'Mukungwa', 'Akanyaru'],
          system_status: 'operational',
          last_update: new Date().toISOString(),
          risk_summary: { high: 1, medium: 2, low: 5 }
        },
        currentRisk: [
          {
            region: 'Kigali',
            risk_level: 'medium',
            confidence_score: 0.85,
            rainfall_mm: 32.5,
            river_level_m: 3.2,
            next_update: new Date(Date.now() + 30 * 60000).toISOString()
          },
          {
            region: 'Nyabarongo',
            risk_level: 'high',
            confidence_score: 0.92,
            rainfall_mm: 58.3,
            river_level_m: 4.5,
            next_update: new Date(Date.now() + 30 * 60000).toISOString()
          },
          {
            region: 'Sebeya',
            risk_level: 'low',
            confidence_score: 0.78,
            rainfall_mm: 12.1,
            river_level_m: 2.1,
            next_update: new Date(Date.now() + 30 * 60000).toISOString()
          }
        ],
        alerts: [
          {
            id: 1,
            title: 'High Flood Risk Alert - Nyabarongo',
            severity: 'high',
            message: 'Heavy rainfall detected. River levels approaching critical threshold.',
            created_at: new Date(Date.now() - 45 * 60000).toISOString(),
            affected_areas: ['Kigali', 'Bugesera', 'Rwamagana']
          },
          {
            id: 2,
            title: 'Medium Flood Risk - Kigali',
            severity: 'medium',
            message: 'Moderate rainfall expected. Monitor conditions closely.',
            created_at: new Date(Date.now() - 120 * 60000).toISOString(),
            affected_areas: ['Kigali City Center', 'Nyarugenge']
          }
        ],
        sensorData: [
          {
            region: 'Kigali',
            water_level_avg: 3.2,
            rainfall_24h: 32.5,
            temperature: 22.8,
            humidity: 78,
            soil_moisture_avg: 65
          },
          {
            region: 'Nyabarongo',
            water_level_avg: 4.5,
            rainfall_24h: 58.3,
            temperature: 21.5,
            humidity: 82,
            soil_moisture_avg: 78
          }
        ]
      };
      
      setData(mockData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates (every 30 seconds)
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getRiskLevelClass = (level: string) => {
    switch (level) {
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low': return 'risk-low';
      default: return 'risk-low';
    }
  };

  const getAlertClass = (severity: string) => {
    switch (severity) {
      case 'high': return 'alert-item high';
      case 'medium': return 'alert-item medium';
      case 'low': return 'alert-item low';
      default: return 'alert-item low';
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard">
      <style>{styles}</style>
      
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Flood Risk Dashboard</h1>
          <p className="dashboard-subtitle">Real-time monitoring for Rwanda's river basins</p>
        </div>
        <div className="dashboard-actions">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Live</span>
          </div>
          <button className="refresh-btn" onClick={fetchDashboardData}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <span>🔄</span>
            )}
            Refresh
          </button>
          <span style={{ fontSize: '12px', color: COLORS.textMuted }}>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {data && (
        <div className="dashboard-grid">
          {/* Overview Cards */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active Alerts</h3>
              <div className="card-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                ⚠️
              </div>
            </div>
            <div className="metric-value">{data.overview.active_alerts}</div>
            <div className="metric-label">Current alerts</div>
            <div className="metric-change negative">
              <span>↑</span> 2 new in last hour
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Risk Distribution</h3>
              <div className="card-icon" style={{ background: '#DBEAFE', color: '#1E5BA8' }}>
                📊
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="metric-value" style={{ fontSize: '24px' }}>{data.overview.risk_summary.high}</div>
                <div className="metric-label">High</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="metric-value" style={{ fontSize: '24px' }}>{data.overview.risk_summary.medium}</div>
                <div className="metric-label">Medium</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="metric-value" style={{ fontSize: '24px' }}>{data.overview.risk_summary.low}</div>
                <div className="metric-label">Low</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">System Status</h3>
              <div className="card-icon" style={{ background: '#DBEAFE', color: '#1E5BA8' }}>
                ✅
              </div>
            </div>
            <div className="risk-level risk-low">
              <span className="status-dot" style={{ width: '6px', height: '6px' }}></span>
              {data.overview.system_status}
            </div>
            <div className="metric-label" style={{ marginTop: '12px' }}>
              Last updated: {formatTime(data.overview.last_update)}
            </div>
          </div>

          {/* Risk Map */}
          <div className="card map-container">
            <div className="card-header" style={{ position: 'relative', zIndex: 10 }}>
              <h3 className="card-title">Risk Map - Rwanda</h3>
              <div className="card-icon" style={{ background: '#DBEAFE', color: '#1E5BA8' }}>
                🗺️
              </div>
            </div>
            <div className="map-placeholder">
              <div className="map-grid"></div>
              <div className="map-pins">
                {data.currentRisk.map((risk, index) => (
                  <div
                    key={risk.region}
                    className="map-pin"
                    style={{
                      background: risk.risk_level === 'high' ? '#DC3545' : 
                                 risk.risk_level === 'medium' ? '#F5A623' : '#0A5C36',
                      top: `${20 + index * 25}%`,
                      left: `${25 + index * 15}%`
                    }}
                    title={`${risk.region}: ${risk.risk_level} risk`}
                  ></div>
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                <div>🔴 High &nbsp;🟡 Medium &nbsp;🟢 Low</div>
              </div>
            </div>
          </div>

          {/* Current Risk Levels */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Current Risk Levels</h3>
              <div className="card-icon" style={{ background: '#FED7AA', color: '#F97316' }}>
                ⚡
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.currentRisk.map((risk) => (
                <div key={risk.region} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{risk.region}</div>
                    <div className={`risk-level ${getRiskLevelClass(risk.risk_level)}`}>
                      {risk.risk_level.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                      {Math.round(risk.confidence_score * 100)}% confidence
                    </div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>
                      Update: {formatTime(risk.next_update)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active Alerts</h3>
              <div className="card-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                🔔
              </div>
            </div>
            <div className="alert-list">
              {data.alerts.map((alert) => (
                <div key={alert.id} className={getAlertClass(alert.severity)}>
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">{formatDate(alert.created_at)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor Data */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sensor Readings</h3>
              <div className="card-icon" style={{ background: '#DBEAFE', color: '#1E5BA8' }}>
                📡
              </div>
            </div>
            <div className="sensor-grid">
              {data.sensorData.map((sensor) => (
                <div key={sensor.region} className="sensor-item">
                  <div className="sensor-name">{sensor.region}</div>
                  <div className="sensor-value">{sensor.water_level_avg}m</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>Water Level</div>
                </div>
              ))}
              {data.sensorData.map((sensor) => (
                <div key={`${sensor.region}-rain`} className="sensor-item">
                  <div className="sensor-name">{sensor.region}</div>
                  <div className="sensor-value">{sensor.rainfall_24h}mm</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>24h Rainfall</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">24h Rainfall Trend</h3>
              <div className="card-icon" style={{ background: '#DBEAFE', color: '#1E5BA8' }}>
                📈
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-placeholder">
                📊 Rainfall trend visualization would appear here
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
