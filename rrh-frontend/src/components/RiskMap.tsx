import { useState, useEffect } from 'react';
import type { PageProps } from '../types';

interface MapLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
  water_level: number;
  rainfall_24h: number;
  population_at_risk: number;
  last_update: string;
}

interface Sensor {
  id: string;
  lat: number;
  lon: number;
  status: string;
  basin: string;
}

interface RiskZone {
  id: number;
  name: string;
  coordinates: number[][];
  risk_level: 'low' | 'medium' | 'high';
  population: number;
  critical_infrastructure: string[];
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
  .map-container {
    padding: 80px 40px 40px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .map-header {
    margin-bottom: 32px;
  }

  .map-title {
    font-size: 32px;
    font-weight: 700;
    color: ${COLORS.primaryDark};
    margin-bottom: 8px;
  }

  .map-subtitle {
    color: ${COLORS.textMuted};
    font-size: 16px;
  }

  .map-controls {
    background: white;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid ${COLORS.border};
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .control-label {
    font-size: 12px;
    font-weight: 600;
    color: ${COLORS.textMuted};
    text-transform: uppercase;
  }

  .filter-buttons {
    display: flex;
    gap: 8px;
  }

  .filter-button {
    padding: 8px 16px;
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    background: white;
    color: ${COLORS.text};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-button:hover {
    border-color: ${COLORS.primary};
  }

  .filter-button.active {
    background: ${COLORS.primary};
    color: white;
    border-color: ${COLORS.primary};
  }

  .map-legend {
    background: white;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid ${COLORS.border};
    margin-bottom: 24px;
  }

  .legend-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .legend-items {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }

  .legend-label {
    font-size: 14px;
    color: ${COLORS.text};
  }

  .map-main {
    background: white;
    border-radius: 16px;
    border: 1px solid ${COLORS.border};
    overflow: hidden;
    height: 600px;
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
      linear-gradient(rgba(10,92,54,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(10,92,54,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .map-content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rwanda-outline {
    width: 80%;
    height: 80%;
    max-width: 500px;
    max-height: 400px;
    border: 3px solid ${COLORS.primary};
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    position: relative;
    background: rgba(255,255,255,0.1);
  }

  .risk-zone {
    position: absolute;
    border-radius: 50%;
    opacity: 0.6;
    animation: pulse 3s infinite;
  }

  .risk-zone.high {
    background: ${COLORS.danger};
  }

  .risk-zone.medium {
    background: ${COLORS.accent};
  }

  .risk-zone.low {
    background: ${COLORS.primary};
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }

  .sensor-pin {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.2s;
  }

  .sensor-pin:hover {
    transform: scale(1.2);
  }

  .sensor-pin.online {
    background: ${COLORS.primary};
  }

  .sensor-pin.offline {
    background: ${COLORS.textMuted};
  }

  .sensor-pin.maintenance {
    background: ${COLORS.accent};
  }

  .map-tooltip {
    position: absolute;
    background: white;
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 250px;
  }

  .tooltip-title {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .tooltip-content {
    font-size: 13px;
    color: ${COLORS.textMuted};
  }

  .tooltip-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
  }

  .tooltip-stat {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
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

  @media (max-width: 768px) {
    .map-container {
      padding: 80px 20px 20px;
    }
    
    .map-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .filter-buttons {
      flex-wrap: wrap;
    }
    
    .legend-items {
      flex-direction: column;
      gap: 12px;
    }
  }
`;

function RiskMap({ setPage }: PageProps) {
  const [riskLevel, setRiskLevel] = useState<string>('all');
  const [riverBasin, setRiverBasin] = useState<string>('all');
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Use setPage to avoid unused variable warning
  const handleBackToDashboard = () => {
    setPage('dashboard');
  };

  const fetchMapData = async () => {
    try {
      const response = await fetch(`/api/v1/dashboard/map-data?risk_level=${riskLevel}&river_basin=${riverBasin}`);
      const data = await response.json();

      setLocations(data.high_risk_locations || []);
      setSensors(data.sensor_locations || []);
      setRiskZones(data.risk_zones || []);
    } catch (error) {
      console.error('Error fetching map data:', error);
      // Use mock data
      setMockMapData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskLevel, riverBasin]);

  const setMockMapData = () => {
    setLocations([
      {
        id: 1,
        name: "Kigali City - Nyabugogo",
        latitude: -1.9536,
        longitude: 30.0605,
        risk_level: "high",
        confidence: 0.92,
        water_level: 4.1,
        rainfall_24h: 95.0,
        population_at_risk: 125000,
        last_update: new Date().toISOString()
      },
      {
        id: 2,
        name: "Ruhengeri - Sebeya Basin",
        latitude: -1.5097,
        longitude: 29.6324,
        risk_level: "high",
        confidence: 0.88,
        water_level: 3.8,
        rainfall_24h: 87.0,
        population_at_risk: 45000,
        last_update: new Date().toISOString()
      },
      {
        id: 3,
        name: "Gisenyi - Lake Kivu",
        latitude: -1.6849,
        longitude: 29.2586,
        risk_level: "medium",
        confidence: 0.79,
        water_level: 3.2,
        rainfall_24h: 62.0,
        population_at_risk: 68000,
        last_update: new Date().toISOString()
      }
    ]);

    setSensors([
      { id: "NYB_001", lat: -1.9536, lon: 30.0605, status: "online", basin: "Nyabarongo" },
      { id: "SEB_001", lat: -1.5097, lon: 29.6324, status: "online", basin: "Sebeya" },
      { id: "MWG_001", lat: -2.0786, lon: 29.8325, status: "online", basin: "Mwogo" },
      { id: "KAG_001", lat: -2.3844, lon: 30.4831, status: "online", basin: "Kagera" }
    ]);

    setRiskZones([
      {
        id: 1,
        name: "Kigali High Risk Zone",
        coordinates: [[-1.95, 30.05], [-1.94, 30.07], [-1.96, 30.07], [-1.96, 30.05]],
        risk_level: "high",
        population: 125000,
        critical_infrastructure: ["hospitals", "schools", "power_stations"]
      }
    ]);
  };

  const handleLocationClick = (location: MapLocation, event: React.MouseEvent) => {
    setSelectedLocation(location);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const closeTooltip = () => {
    setSelectedLocation(null);
    setTooltipPosition(null);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return COLORS.danger;
      case 'medium': return COLORS.accent;
      case 'low': return COLORS.primary;
      default: return COLORS.textMuted;
    }
  };

  if (loading) {
    return (
      <div className="map-container">
        <style>{styles}</style>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
          <p style={{ marginTop: '16px', color: COLORS.textMuted }}>Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="map-container">
        <div className="map-header">
          <h1 className="map-title">Flood Risk Map</h1>
          <p className="map-subtitle">Interactive visualization of flood risk across Rwanda river basins</p>
          <button className="refresh-button" onClick={handleBackToDashboard} style={{ marginTop: '16px' }}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Map Controls */}
        <div className="map-controls">
          <div className="control-group">
            <div className="control-label">Risk Level</div>
            <div className="filter-buttons">
              <button 
                className={`filter-button ${riskLevel === 'all' ? 'active' : ''}`}
                onClick={() => setRiskLevel('all')}
              >
                All
              </button>
              <button 
                className={`filter-button ${riskLevel === 'high' ? 'active' : ''}`}
                onClick={() => setRiskLevel('high')}
              >
                High
              </button>
              <button 
                className={`filter-button ${riskLevel === 'medium' ? 'active' : ''}`}
                onClick={() => setRiskLevel('medium')}
              >
                Medium
              </button>
              <button 
                className={`filter-button ${riskLevel === 'low' ? 'active' : ''}`}
                onClick={() => setRiskLevel('low')}
              >
                Low
              </button>
            </div>
          </div>

          <div className="control-group">
            <div className="control-label">River Basin</div>
            <div className="filter-buttons">
              <button 
                className={`filter-button ${riverBasin === 'all' ? 'active' : ''}`}
                onClick={() => setRiverBasin('all')}
              >
                All Basins
              </button>
              <button 
                className={`filter-button ${riverBasin === 'Nyabarongo' ? 'active' : ''}`}
                onClick={() => setRiverBasin('Nyabarongo')}
              >
                Nyabarongo
              </button>
              <button 
                className={`filter-button ${riverBasin === 'Sebeya' ? 'active' : ''}`}
                onClick={() => setRiverBasin('Sebeya')}
              >
                Sebeya
              </button>
            </div>
          </div>

          <button className="refresh-button" onClick={fetchMapData}>
            Refresh Map
          </button>
        </div>

        {/* Map Legend */}
        <div className="map-legend">
          <div className="legend-title">Legend</div>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{ background: COLORS.danger }}></div>
              <span className="legend-label">High Risk</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: COLORS.accent }}></div>
              <span className="legend-label">Medium Risk</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: COLORS.primary }}></div>
              <span className="legend-label">Low Risk</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: COLORS.primary }}></div>
              <span className="legend-label">Online Sensor</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: COLORS.textMuted }}></div>
              <span className="legend-label">Offline Sensor</span>
            </div>
          </div>
        </div>

        {/* Main Map */}
        <div className="map-main">
          <div className="map-placeholder">
            <div className="map-grid"></div>
            <div className="map-content">
              <div className="rwanda-outline">
                {/* Risk Zones */}
                {riskZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`risk-zone ${zone.risk_level}`}
                    style={{
                      width: '80px',
                      height: '80px',
                      top: '30%',
                      left: '40%',
                    }}
                  />
                ))}
                
                {/* Sensor Pins */}
                {sensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className={`sensor-pin ${sensor.status}`}
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${15 + Math.random() * 70}%`,
                    }}
                    title={`${sensor.id} - ${sensor.basin}`}
                  />
                ))}

                {/* High Risk Locations */}
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="sensor-pin"
                    style={{
                      top: `${25 + Math.random() * 50}%`,
                      left: `${20 + Math.random() * 60}%`,
                      background: getRiskColor(location.risk_level),
                      width: '16px',
                      height: '16px',
                    }}
                    onClick={(e) => handleLocationClick(location, e)}
                    title={location.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {selectedLocation && tooltipPosition && (
          <div
            className="map-tooltip"
            style={{
              position: 'fixed',
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 50,
            }}
            onClick={closeTooltip}
          >
            <div className="tooltip-title">{selectedLocation.name}</div>
            <div className="tooltip-content">
              Risk Level: <span style={{ color: getRiskColor(selectedLocation.risk_level), fontWeight: 600 }}>
                {selectedLocation.risk_level.toUpperCase()}
              </span>
            </div>
            <div className="tooltip-stats">
              <div className="tooltip-stat">
                <span>Confidence:</span>
                <span>{(selectedLocation.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="tooltip-stat">
                <span>Water Level:</span>
                <span>{selectedLocation.water_level}m</span>
              </div>
              <div className="tooltip-stat">
                <span>Rainfall (24h):</span>
                <span>{selectedLocation.rainfall_24h}mm</span>
              </div>
              <div className="tooltip-stat">
                <span>Population at Risk:</span>
                <span>{selectedLocation.population_at_risk.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default RiskMap;
