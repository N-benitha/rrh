
import { RAINFALL_DATA, RIVER_DATA, ML_HISTORY } from "../../constants";

/** Bar chart component */
export function BarChart() {
  const max = Math.max(...RAINFALL_DATA.map((d) => d.mm));

  return (
    <div className="chart-area">
      <style>{`
        .chart-area{padding:16px}
        .chart-bars{display:flex;align-items:flex-end;gap:6px;height:120px}
        .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
        .bar-fill{width:100%;border-radius:3px 3px 0 0;transition:all .3s;cursor:pointer;min-height:4px}
        .bar-lbl{font-family:var(--mono);font-size:8px;color:var(--n400);text-align:center}
        .chart-yaxis{display:flex;flex-direction:column;justify-content:space-between;height:120px;padding:0 8px 20px 0;flex-shrink:0}
        .y-lbl{font-family:var(--mono);font-size:8px;color:var(--n400);text-align:right}
        .chart-row{display:flex;align-items:flex-end}
        .chart-legend{display:flex;gap:14px;margin-top:12px}
        .cl-item{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:9px;color:var(--n500)}
        .cl-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0}
      `}</style>
      <div className="chart-row">
        <div className="chart-yaxis">
          {[150, 100, 50, 0].map((v) => (
            <div key={v} className="y-lbl">
              {v}
            </div>
          ))}
        </div>
        <div className="chart-bars" style={{ flex: 1 }}>
          {RAINFALL_DATA.map((d, i) => (
            <div key={i} className="bar-col">
              <div
                className="bar-fill"
                style={{
                  height: `${(d.mm / max) * 100}%`,
                  background:
                    d.mm > 100
                      ? "#EF4444"
                      : d.mm > 70
                        ? "#F97316"
                        : d.mm > 50
                          ? "#EAB308"
                          : "#34D399",
                  opacity: 0.85,
                }}
                title={`${d.day}: ${d.mm}mm`}
              />
              <div className="bar-lbl">{d.day}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        <div className="cl-item">
          <div className="cl-dot" style={{ background: "#EF4444" }} />&gt;100mm critical
        </div>
        <div className="cl-item">
          <div className="cl-dot" style={{ background: "#F97316" }} />
          70–100mm high
        </div>
        <div className="cl-item">
          <div className="cl-dot" style={{ background: "#EAB308" }} />
          50–70mm moderate
        </div>
        <div className="cl-item">
          <div className="cl-dot" style={{ background: "#34D399" }} />
          Normal
        </div>
      </div>
    </div>
  );
}

/** Line chart component */
interface LineChartProps {
  data: { t: string; v: number }[];
  color: string;
  unit: string;
}

export function LineChart({ data, color }: LineChartProps) {
  const W = 320,
    H = 80,
    pad = 8;
  const vals = data.map((d) => d.v);
  const mn = Math.min(...vals),
    mx = Math.max(...vals);
  const range = mx - mn || 1;
  const pts = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (W - 2 * pad),
    y: H - pad - ((d.v - mn) / range) * (H - 2 * pad),
  }));
  const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <div className="linechart">
      <style>{`
        .linechart{padding:0 16px 12px}
      `}</style>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H }}>
        <defs>
          <linearGradient id={`lg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".3" />
            <stop offset="100%" stopColor={color} stopOpacity=".02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#lg-${color.replace("#", "")})`} />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--n400)" }}>
            {d.t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Preset charts */
export function RainfallChart() {
  return <BarChart />;
}

export function RiverLevelChart() {
  return <LineChart data={RIVER_DATA} color="#EF4444" unit="m" />;
}

export function MLAccuracyChart() {
  const formattedData = ML_HISTORY.map(d => ({ t: d.date, v: d.acc }));
  return <LineChart data={formattedData} color="#34D399" unit="%" />;
}
