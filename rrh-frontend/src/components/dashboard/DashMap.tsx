import { useRef, useEffect, useState, useCallback } from "react";
import { ZONES, RISK_META } from "../../constants";
import type { Zone } from "../../types";

interface LeafletLayer {
  addTo: (map: LeafletMap) => this;
  on: (event: string, cb: () => void) => this;
}
interface LeafletMap {
  remove: () => void;
  removeLayer: (layer: LeafletLayer) => void;
}
interface LeafletStatic {
  map: (el: HTMLDivElement, opts: object) => LeafletMap;
  tileLayer: (url: string, opts: object) => LeafletLayer;
  control: { zoom: (opts: object) => LeafletLayer };
  circle: (latlng: [number, number], opts: object) => LeafletLayer;
  divIcon: (opts: object) => LeafletLayer;
  marker: (latlng: [number, number], opts: object) => LeafletLayer;
  polyline: (latlngs: [number, number][], opts: object) => LeafletLayer;
}

// Approximate Sebeya River path: Rutsiro (upstream) → Nyundo → Kanama → Lake Kivu
const SEBEYA_RIVER: [number, number][] = [
  [-1.3954, 29.4849],
  [-1.4400, 29.4600],
  [-1.4900, 29.4400],
  [-1.5554, 29.5375],
  [-1.6000, 29.4800],
  [-1.6400, 29.4200],
  [-1.6849, 29.3892],
];
type WindowWithLeaflet = Window & typeof globalThis & { L?: LeafletStatic };

const TREND_ICON: Record<string, string> = { up: "▲", dn: "▼", st: "●" };
const TREND_COLOR: Record<string, string> = { up: "#ef4444", dn: "#22c55e", st: "#f59e0b" };

const CHIP: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: "#7f1d1d", color: "#fca5a5" },
  HIGH:     { bg: "#7c2d12", color: "#fdba74" },
  MODERATE: { bg: "#713f12", color: "#fde68a" },
  LOW:      { bg: "#14532d", color: "#6ee7b7" },
};

const CSS = `
  .dm-wrap { position:relative; width:100%; height:100%; font-family:var(--serif, sans-serif); }

  .dm-filter {
    position:absolute; top:12px; left:12px; z-index:800;
    display:flex; gap:5px; flex-wrap:wrap;
  }
  .dm-fbtn {
    padding:4px 11px; border-radius:20px; border:1px solid rgba(255,255,255,.18);
    background:rgba(6,15,26,.75); color:rgba(255,255,255,.7);
    font-size:10px; font-weight:600; letter-spacing:.04em;
    cursor:pointer; backdrop-filter:blur(4px); transition:all .15s;
    text-transform:uppercase;
  }
  .dm-fbtn:hover, .dm-fbtn.active {
    background:var(--a300,#f57c00); border-color:var(--a300,#f57c00); color:#fff;
  }

  .dm-legend {
    position:absolute; bottom:12px; left:12px; z-index:800;
    background:rgba(6,15,26,.82); border:1px solid rgba(255,255,255,.1);
    border-radius:8px; padding:8px 12px;
    backdrop-filter:blur(4px);
  }
  .dm-legend-row { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
  .dm-legend-row:last-child { margin-bottom:0; }
  .dm-legend-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .dm-legend-lbl { font-size:9px; color:rgba(255,255,255,.65); letter-spacing:.05em; text-transform:uppercase; }

  .dm-panel {
    position:absolute; top:0; right:0; bottom:0; width:260px; z-index:900;
    background:#0c1a2e; border-left:1px solid rgba(255,255,255,.08);
    display:flex; flex-direction:column; overflow:hidden;
  }
  .dm-panel-head {
    padding:14px 16px 10px;
    border-bottom:1px solid rgba(255,255,255,.07);
    display:flex; justify-content:space-between; align-items:flex-start;
  }
  .dm-panel-name { font-size:13px; font-weight:700; color:#fff; margin:0 0 4px; }
  .dm-panel-region { font-size:10px; color:rgba(255,255,255,.45); }
  .dm-close {
    width:22px; height:22px; border-radius:50%;
    border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.06);
    color:rgba(255,255,255,.6); font-size:14px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .dm-close:hover { background:rgba(255,255,255,.12); color:#fff; }

  .dm-metrics { padding:12px 16px; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .dm-metric {
    background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07);
    border-radius:7px; padding:8px 10px;
  }
  .dm-metric-lbl { font-size:8px; font-weight:600; color:rgba(255,255,255,.4); letter-spacing:.08em; text-transform:uppercase; margin-bottom:5px; }
  .dm-metric-val { font-size:15px; font-weight:700; color:#fff; display:flex; align-items:center; gap:5px; }
  .dm-trend { font-size:10px; font-weight:700; }

  .dm-desc { padding:0 16px 14px; font-size:11px; color:rgba(255,255,255,.5); line-height:1.6; }

  .dm-river-bar { padding:0 16px 14px; }
  .dm-river-lbl { font-size:9px; font-weight:600; color:rgba(255,255,255,.4); letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px; }
  .dm-river-track { height:6px; background:rgba(255,255,255,.08); border-radius:3px; overflow:hidden; }
  .dm-river-fill { height:100%; border-radius:3px; transition:width .6s ease; }

  .dm-score { padding:0 16px 14px; }
  .dm-score-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .dm-score-lbl { font-size:9px; font-weight:600; color:rgba(255,255,255,.4); letter-spacing:.08em; text-transform:uppercase; }
  .dm-score-val { font-size:12px; font-weight:700; color:#fff; }
  .dm-score-track { height:4px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
  .dm-score-fill { height:100%; border-radius:2px; }

  .dm-updated { padding:0 16px 14px; font-size:9px; color:rgba(255,255,255,.3); text-align:right; }

  @keyframes mapPing {
    0%   { transform:scale(1); opacity:.7 }
    70%  { transform:scale(3); opacity:0 }
    100% { transform:scale(3); opacity:0 }
  }
`;

interface DashMapProps {
  zones?: Zone[];
  selectedZone?: Zone | null;
  onZoneSelect?: (zone: Zone | null) => void;
}

export default function DashMap({ zones, selectedZone, onZoneSelect }: DashMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletLayer[]>([]);
  const [internalSel, setInternalSel] = useState<Zone | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const displayZones = zones && zones.length > 0 ? zones : ZONES;

  const sel = selectedZone !== undefined ? selectedZone : internalSel;

  const selRef = useRef(sel);
  const onZoneSelectRef = useRef(onZoneSelect);
  useEffect(() => {
    selRef.current = sel;
    onZoneSelectRef.current = onZoneSelect;
  });

  const filtered = filter === "ALL"
    ? displayZones
    : displayZones.filter((z) => z.level === filter);

  const renderMarkers = useCallback((L: LeafletStatic, map: LeafletMap, zonesToShow: Zone[]) => {
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    zonesToShow.forEach((z) => {
      const r = RISK_META[z.level];
      const pulse = z.level === "CRITICAL" || z.level === "HIGH";

      const html = `
        <div style="position:relative;width:32px;height:32px;transform:translate(-50%,-50%)">
          ${pulse ? `
            <div style="position:absolute;inset:0;border-radius:50%;background:${r.color};animation:mapPing 2.2s ease-out infinite;opacity:.6"></div>
            <div style="position:absolute;inset:0;border-radius:50%;background:${r.color};animation:mapPing 2.2s ease-out .9s infinite;opacity:.4"></div>
          ` : ""}
          <div style="position:absolute;top:50%;left:50%;width:14px;height:14px;transform:translate(-50%,-50%);
            border-radius:50%;background:${r.color};border:2.5px solid #fff;
            box-shadow:0 0 12px ${r.glow},0 2px 6px rgba(0,0,0,.5)"></div>
          <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);
            background:rgba(6,15,26,.85);color:${r.color};border:1px solid ${r.color}44;
            border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700;white-space:nowrap;
            letter-spacing:.04em;font-family:monospace">
            ${z.name.split("—")[1]?.trim().split("/")[0]?.trim().toUpperCase() ?? z.name}
          </div>
        </div>`;

      const icon = L.divIcon({ className: "", html, iconSize: [0, 0], iconAnchor: [0, 0] });
      const marker = L.marker([z.lat, z.lng], { icon }).addTo(map);

      marker.on("click", () => {
        const next = selRef.current?.id === z.id ? null : z;
        setInternalSel(next);
        onZoneSelectRef.current?.(next);
      });
      markersRef.current.push(marker);

      const circle = L.circle([z.lat, z.lng], {
        radius: r.radius,
        color: r.color,
        fillColor: r.color,
        fillOpacity: 0.06,
        weight: 1,
        opacity: 0.25,
      }).addTo(map);
      markersRef.current.push(circle);
    });
  }, []); // refs are stable; no reactive deps needed

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    if (!document.querySelector("#lfcss-db")) {
      const l = document.createElement("link");
      l.id = "lfcss-db";
      l.rel = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }

    const init = () => {
      const L = (window as WindowWithLeaflet).L;
      if (!L || !ref.current) return;

      const map = L.map(ref.current, {
        center: [-1.54, 29.44],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Draw Sebeya River
      L.polyline(SEBEYA_RIVER, { color: "#60a5fa", weight: 4, opacity: 0.9 }).addTo(map);
      // River label marker
      const riverIcon = L.divIcon({
        className: "",
        html: `<div style="background:rgba(6,15,26,.82);color:#60a5fa;border:1px solid #3b82f6;
          border-radius:4px;padding:2px 7px;font-size:9px;font-weight:700;white-space:nowrap;
          letter-spacing:.05em;font-family:monospace">SEBEYA RIVER</div>`,
        iconSize: [0, 0], iconAnchor: [0, 0],
      });
      L.marker([-1.53, 29.42], { icon: riverIcon }).addTo(map);

      mapRef.current = map;
      renderMarkers(L, map, displayZones);
    };

    if ((window as WindowWithLeaflet).L) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      s.onload = init;
      document.head.appendChild(s);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [renderMarkers, displayZones]);

  useEffect(() => {
    const L = (window as WindowWithLeaflet).L;
    if (!L || !mapRef.current) return;
    renderMarkers(L, mapRef.current, filtered);
  }, [filter, renderMarkers, filtered]);

  const riverPct = (river: string) => {
    const m = parseFloat(river);
    return Math.min(100, (m / 3.5) * 100);
  };

  const riverColor = (level: string) =>
    level === "CRITICAL" ? "#ef4444" :
    level === "HIGH"     ? "#f97316" :
    level === "MODERATE" ? "#eab308" : "#22c55e";

  return (
    <div className="dm-wrap">
      <style>{CSS}</style>

      {/* map container — shrinks when panel is open */}
      <div
        ref={ref}
        style={{
          position: "absolute",
          top: 0, left: 0, bottom: 0,
          right: sel ? 260 : 0,
          transition: "right .25s ease",
        }}
      />

      {/* filter buttons */}
      <div className="dm-filter">
        {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((f) => (
          <button
            key={f}
            className={`dm-fbtn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* legend */}
      <div className="dm-legend">
        <div className="dm-legend-row">
          <div style={{ width: 16, height: 3, background: "#3b82f6", borderRadius: 2, flexShrink: 0 }} />
          <span className="dm-legend-lbl">Sebeya River</span>
        </div>
        {(["CRITICAL", "HIGH", "MODERATE", "LOW"] as const).map((lvl) => (
          <div key={lvl} className="dm-legend-row">
            <div className="dm-legend-dot" style={{ background: RISK_META[lvl].color }} />
            <span className="dm-legend-lbl">{lvl}</span>
          </div>
        ))}
      </div>

      {/* detail panel */}
      {sel && (() => {
        const chip = CHIP[sel.level] ?? CHIP.LOW;
        const pct  = riverPct(sel.river);
        const rCol = riverColor(sel.level);
        return (
          <div className="dm-panel">
            <div className="dm-panel-head">
              <div>
                <p className="dm-panel-name">{sel.name}</p>
                <p className="dm-panel-region">{sel.region}</p>
                <span style={{
                  display: "inline-block", marginTop: 6,
                  padding: "2px 8px", borderRadius: 4,
                  fontSize: 9, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
                  background: chip.bg, color: chip.color,
                }}>
                  {sel.level}
                </span>
              </div>
              <button
                className="dm-close"
                onClick={() => {
                  setInternalSel(null);
                  onZoneSelectRef.current?.(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="dm-metrics">
              <div className="dm-metric">
                <div className="dm-metric-lbl">Rainfall</div>
                <div className="dm-metric-val">
                  {sel.rainfall}
                  <span className="dm-trend" style={{ color: TREND_COLOR[sel.trend] }}>
                    {TREND_ICON[sel.trend]}
                  </span>
                </div>
              </div>
              <div className="dm-metric">
                <div className="dm-metric-lbl">River Level</div>
                <div className="dm-metric-val">
                  {sel.river}
                  <span className="dm-trend" style={{ color: TREND_COLOR[sel.trend] }}>
                    {TREND_ICON[sel.trend]}
                  </span>
                </div>
              </div>
            </div>

            {/* river level bar */}
            <div className="dm-river-bar">
              <div className="dm-river-lbl">River level — capacity</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ flex: 1 }}>
                  <div className="dm-river-track">
                    <div className="dm-river-fill" style={{ width: `${pct}%`, background: rCol }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: rCol, width: 32, textAlign: "right" }}>
                  {Math.round(pct)}%
                </span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)" }}>
                {sel.trend === "up" ? "▲ Rising" : sel.trend === "dn" ? "▼ Falling" : "● Stable"} · critical threshold 2.5m
              </div>
            </div>

            {/* ML score */}
            <div className="dm-score">
              <div className="dm-score-row">
                <span className="dm-score-lbl">ML Flood Risk Score</span>
                <span className="dm-score-val">{sel.score}%</span>
              </div>
              <div className="dm-score-track">
                <div className="dm-score-fill"
                  style={{ width: `${sel.score}%`, background: rCol }} />
              </div>
            </div>

            <div className="dm-desc">{sel.desc}</div>

            <div className="dm-updated">Last updated: {sel.updated}</div>
          </div>
        );
      })()}
    </div>
  );
}
