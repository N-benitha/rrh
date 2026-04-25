import { useState } from "react";
import { ZONES, RISK_META } from "../../constants";
import type { Zone } from "../../types";

/*
 * Rwanda SVG map — no Leaflet, no CDN dependency.
 * Projection: x = (lng - 28.8) * 100
 *             y = -(lat + 1.0) / 1.9 * 200
 * viewBox: -15 -15 250 230
 */
function toSVG(lat: number, lng: number): [number, number] {
  return [(lng - 28.8) * 100, -(lat + 1.0) / 1.9 * 200];
}

/* Label placement: prefer opposite side from map center (cx=110) */
function labelPos(cx: number, _cy: number, id: number): [number, number, "start" | "end"] {
  // Nyabugogo (id=1) and Kigali Urban (id=4) are very close — offset vertically
  if (id === 1) return [-11, -8, "end"];   // above-left
  if (id === 4) return [ 11,  12, "start"]; // below-right
  return cx > 110 ? [-11, 3, "end"] : [11, 3, "start"];
}

const CHIP: Record<string, { bg: string; color: string; border: string }> = {
  CRITICAL: { bg: "#7f1d1d", color: "#fca5a5", border: "rgba(252,165,165,.25)" },
  HIGH:     { bg: "#7c2d12", color: "#fdba74", border: "rgba(253,186,116,.25)" },
  MODERATE: { bg: "#713f12", color: "#fde68a", border: "rgba(253,230,138,.25)" },
  LOW:      { bg: "#14532d", color: "#6ee7b7", border: "rgba(110,231,183,.25)" },
};

const CSS = `
  @keyframes dm-pulse{
    0%{transform:scale(1);opacity:.65}
    70%{transform:scale(3.4);opacity:0}
    100%{transform:scale(3.4);opacity:0}
  }
  .dm-p1{transform-box:fill-box;transform-origin:center;animation:dm-pulse 2.2s ease-out infinite}
  .dm-p2{transform-box:fill-box;transform-origin:center;animation:dm-pulse 2.2s ease-out 1.1s infinite}
`;

interface DashMapProps {
  zones?: Zone[];
}

export default function DashMap({ zones }: DashMapProps) {
  const displayZones = zones && zones.length > 0 ? zones : ZONES;
  const [sel, setSel] = useState<Zone | null>(null);

  const toggle = (z: Zone) => setSel((s) => (s?.id === z.id ? null : z));

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{CSS}</style>

      {/* ── Rwanda SVG map ── */}
      <svg
        viewBox="-15 -15 250 230"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* background */}
        <rect x="-15" y="-15" width="250" height="230" fill="#060f1a" />

        {/* subtle grid */}
        <line x1="-15" y1="100" x2="235" y2="100" stroke="rgba(255,255,255,.04)" strokeWidth="0.5" />
        <line x1="110" y1="-15" x2="110" y2="215" stroke="rgba(255,255,255,.04)" strokeWidth="0.5" />

        {/* Rwanda country outline — traced from real border coordinates */}
        <path
          d="M29,7
             Q42,2 55,5 Q68,4 80,11 Q96,6 112,6 Q127,7 142,12
             Q155,21 167,34 L177,50 L202,69
             Q205,86 204,102 Q203,119 202,135 Q200,155 198,174
             Q183,191 167,193 Q151,193 135,192 Q116,187 98,184
             Q87,180 77,174 Q58,163 41,155
             Q24,147 14,143 Q6,133 8,124 Q6,113 7,102
             Q7,90 8,77 Q9,63 10,50 Q8,39 8,28
             Q16,12 29,7 Z"
          fill="rgba(21,101,192,.22)"
          stroke="rgba(79,195,247,.75)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* neighbour labels */}
        {[
          { x: 100, y: -5,  a: "middle" as const, t: "UGANDA"   },
          { x: 221, y: 100, a: "start"  as const, t: "TANZANIA" },
          { x: 108, y: 212, a: "middle" as const, t: "BURUNDI"  },
          { x: -13, y: 100, a: "start"  as const, t: "DRC"      },
        ].map(({ x, y, a, t }) => (
          <text key={t} x={x} y={y} textAnchor={a} fontSize="7"
            fontFamily="monospace" fill="rgba(255,255,255,.22)">{t}</text>
        ))}

        {/* zone markers */}
        {displayZones.map((z) => {
          const [cx, cy] = toSVG(z.lat, z.lng);
          const r       = RISK_META[z.level];
          const isSel   = sel?.id === z.id;
          const pulse   = z.level === "CRITICAL" || z.level === "HIGH";
          const [lx, ly, anchor] = labelPos(cx, cy, z.id);
          return (
            <g key={z.id} transform={`translate(${cx},${cy})`}
              style={{ cursor: "pointer" }} onClick={() => toggle(z)}>
              {pulse && <circle r="8" fill={r.color} className="dm-p1" />}
              {pulse && <circle r="8" fill={r.color} className="dm-p2" />}
              {isSel && <circle r="11" fill="none" stroke="#fff" strokeWidth="2" opacity=".92" />}
              <circle r="6" fill={r.color} stroke="#fff" strokeWidth="1.5" />
              <text x={lx} y={ly} textAnchor={anchor}
                fontSize="7.5" fontFamily="monospace" fontWeight="600"
                fill="rgba(255,255,255,.85)">
                {z.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Selected zone popup (white card) ── */}
      {sel && (() => {
        const chip = CHIP[sel.level] ?? CHIP.LOW;
        const valColor =
          sel.level === "CRITICAL" ? "#c62828" :
          sel.level === "HIGH"     ? "#e65100" :
          sel.level === "MODERATE" ? "#f9a825" : "#2e7d32";
        return (
          <div style={{
            position: "absolute", bottom: 10, left: "8%", right: "8%",
            background: "#fff", borderRadius: 10,
            padding: "12px 14px",
            boxShadow: "0 6px 28px rgba(0,0,0,.4)",
            animation: "lp-zin .18s ease",
          }}>
            {/* top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 13.5, fontWeight: 700, color: "#0c1a2e" }}>
                {sel.name}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700,
                  padding: "2px 7px", borderRadius: 3, letterSpacing: ".06em", textTransform: "uppercase",
                  background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
                }}>
                  {sel.level}
                </span>
                <button
                  onClick={() => setSel(null)}
                  style={{
                    width: 20, height: 20, borderRadius: "50%", border: "1px solid #e0e0e0",
                    background: "#f5f5f5", color: "#546e7a", fontSize: 14, lineHeight: 1,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0,
                  }}
                >×</button>
              </div>
            </div>

            {/* metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {([
                ["Rainfall",    sel.rainfall],
                ["River Level", sel.river],
                ["ML Score",    `${sel.score}%`],
                ["Updated",     sel.updated],
              ] as [string,string][]).map(([label, val]) => (
                <div key={label} style={{
                  background: "#f0f7ff", border: "1px solid #bbdefb",
                  borderRadius: 6, padding: "7px 10px",
                }}>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 7, fontWeight: 600,
                    color: "#1565c0", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3,
                  }}>{label}</div>
                  <div style={{
                    fontFamily: "var(--serif)", fontSize: 13, fontWeight: 700,
                    color: label === "Updated" ? "#546e7a" : valColor,
                  }}>{val}</div>
                </div>
              ))}
            </div>

            {/* description */}
            <div style={{ marginTop: 8, fontSize: 10.5, color: "#546e7a", lineHeight: 1.5 }}>
              {sel.desc} · {sel.region}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
