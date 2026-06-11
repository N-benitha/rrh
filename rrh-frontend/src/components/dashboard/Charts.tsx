

interface ChartData {
  t: string;
  v: number;
}

interface BarChartProps {
  data: Array<{ day: string; mm: number }>;
}

interface LineChartProps {
  data: ChartData[];
  color: string;
  unit: string;
  title?: string;
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.mm));

  const getColor = (mm: number) => {
    if (mm > 100) return "#EF4444";
    if (mm > 70) return "#F97316";
    if (mm > 50) return "#EAB308";
    return "#34D399";
  };

  return (
    <div className="db-chart-area">
      <div className="db-chart-row">
        <div className="db-chart-yaxis">
          {[150, 100, 50, 0].map((v) => (
            <div key={v} className="db-y-label">
              {v}
            </div>
          ))}
        </div>
        <div className="db-chart-bars" style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div key={i} className="db-bar-col">
              <div
                className="db-bar-fill"
                style={{
                  height: `${(d.mm / max) * 100}%`,
                  background: getColor(d.mm),
                  opacity: 0.85,
                }}
                title={`${d.day}: ${d.mm}mm`}
              />
              <div className="db-bar-label">{d.day}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="db-chart-legend">
        <div className="db-cl-item">
          <div className="db-cl-dot" style={{ background: "#EF4444" }} />
          &gt;100mm critical
        </div>
        <div className="db-cl-item">
          <div className="db-cl-dot" style={{ background: "#F97316" }} />
          70–100mm high
        </div>
        <div className="db-cl-item">
          <div className="db-cl-dot" style={{ background: "#EAB308" }} />
          50–70mm moderate
        </div>
        <div className="db-cl-item">
          <div className="db-cl-dot" style={{ background: "#34D399" }} />
          Normal
        </div>
      </div>
    </div>
  );
}

export function LineChart({ data, color, title }: LineChartProps) {
  const W = 320;
  const H = 80;
  const pad = 8;

  const vals = data.map((d) => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (W - 2 * pad),
    y: H - pad - ((d.v - min) / range) * (H - 2 * pad),
  }));

  const path = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const area = `${path} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;
  const gradId = `lg-${color.replace("#", "")}`;

  return (
    <div className="db-linechart">
      {title && <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "8px", color: "#999" }}>
        {data.map((d, i) => (
          <span key={i}>{d.t}</span>
        ))}
      </div>
    </div>
  );
}
