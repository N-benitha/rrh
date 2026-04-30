import "../styles/landing.css";
import { FEATURES, PROCESS, PARTNERS } from "../constants";
import { Navbar, Footer } from "../components/shared";
import type { PageProps } from "../types";

const ICONS = ["📡", "🤖", "🗺️", "🔌", "🚨", "📊"];

const ZONES = [
  { name: "Nyabugogo",  pct: 95, level: "Critical", color: "#e53935" },
  { name: "Sebeya",     pct: 72, level: "High",     color: "#f57c00" },
  { name: "Kigali Urb", pct: 68, level: "High",     color: "#f57c00" },
  { name: "Nyabarongo", pct: 44, level: "Moderate", color: "#fb8c00" },
];

const ALERT_COLORS: Record<string, string> = {
  Critical: "#e53935",
  High:     "#f57c00",
  Moderate: "#fb8c00",
};

const STATS: [string, string, string][] = [
  ["5",      "River zones",    "#f57c00"],
  ["3",      "Active alerts",  "#1a3a6c"],
  ["91%",    "ML accuracy",    "#f57c00"],
  ["15 min", "Data refresh",   "#1a3a6c"],
];

export default function LandingPage({ setPage }: PageProps) {
  return (
    <div className="page">
      <Navbar setPage={setPage} cur="landing" />

      {/* ══ HERO ══ */}
      <section className="lp-hero">
        <div className="lp-grid">

          {/* LEFT */}
          <div className="lp-copy">
            <div className="lp-eye">
              <span className="lp-edot" />
              Live · Rwanda Flood Intelligence
            </div>

            <h1 className="lp-h1">
              Predict Floods.
              <em>Protect Lives.</em>
            </h1>

            <p className="lp-desc">
              Satellite rainfall, IoT river sensors, and machine learning
              delivering real-time flood risk intelligence across Rwanda's
              most vulnerable river basins.
            </p>

            <div className="lp-btns">
              <button className="lp-btn-o" onClick={() => setPage("register")}>Get Access →</button>
              <button className="lp-btn-g" onClick={() => setPage("help")}>How It Works</button>
            </div>

            <div className="lp-zone-sec">
              <div className="lp-zone-lbl">Current risk levels</div>
              <div className="lp-zones">
                {ZONES.map(({ name, pct, level, color }) => (
                  <div className="lp-zrow" key={name}>
                    <div className="lp-zdot" style={{ background: color }} />
                    <div className="lp-zname">{name}</div>
                    <div className="lp-zbar">
                      <div className="lp-zfill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="lp-zlvl">{level}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — flood photo */}
          <div className="lp-img-panel">
            <img src="/image.png" className="lp-flood-img" alt="Rwanda flood" />
            <div className="lp-overlay" />

            <div className="lp-acard">
              <div className="lp-acard-h">
                <span className="lp-acard-dot" />
                Live · {ZONES.length} Active Alerts
              </div>
              {ZONES.map(({ name, level, color }) => (
                <div className="lp-acard-row" key={name}>
                  <span className="lp-acard-zone">{name}</span>
                  <span className="lp-acard-lvl" style={{ color: ALERT_COLORS[level] ?? color }}>{level}</span>
                </div>
              ))}
            </div>

            <div className="lp-legend">
              <div className="lp-legend-h">Risk Level</div>
              {[
                { label: "Critical", color: "#e53935" },
                { label: "High",     color: "#f57c00" },
                { label: "Moderate", color: "#fb8c00" },
                { label: "Low",      color: "rgba(255,255,255,.28)" },
              ].map(({ label, color }) => (
                <div className="lp-legend-row" key={label}>
                  <div className="lp-legend-dot" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="lp-stats">
          {STATS.map(([v, l, c], i) => (
            <div className="lp-stat" key={i}>
              <div className="lp-sv" style={{ color: c }}>{v}</div>
              <div className="lp-sl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="lp-sec lp-w">
        <div className="lp-in">
          <div className="lp-eyebrow lp-ey-or">Platform Capabilities</div>
          <h2 className="lp-h2 lp-h2-dk">Built for Rwanda's flood reality</h2>
          <p className="lp-lead lp-lead-dk">
            Designed alongside MINEMA, RWB, and Meteo Rwanda — unifying satellite data,
            sensor streams, and machine learning into one decision-support platform.
          </p>
          <div className="lp-features">
            {FEATURES.map((f, i) => (
              <div className="lp-fc" key={i}>
                <span className="lp-fc-icon">{ICONS[i]}</span>
                <div className="lp-fc-num">0{i + 1}</div>
                <div className="lp-fc-name">{f.name}</div>
                <div className="lp-fc-text">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══ */}
      <section className="lp-sec lp-dk">
        <div className="lp-in">
          <div className="lp-eyebrow lp-ey-w">System Architecture</div>
          <h2 className="lp-h2 lp-h2-w">From raw data to risk alert</h2>
          <p className="lp-lead lp-lead-w" style={{ marginBottom: 40 }}>
            A five-layer pipeline ingests, normalises, classifies, and visualises
            environmental data end-to-end in near real time.
          </p>
          <div className="lp-steps">
            {PROCESS.map((p, i) => (
              <div className="lp-step" key={i}>
                <div className="lp-step-n">0{i + 1}</div>
                <div>
                  <div className="lp-step-t">{p.title}</div>
                  <div className="lp-step-d">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTNERS ══ */}
      <section className="lp-sec lp-lt" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="lp-in">
          <div className="lp-eyebrow lp-ey-b">Institutional Partners</div>
          <h2 className="lp-h2 lp-h2-dk" style={{ marginBottom: 36 }}>
            Supported by Rwanda's leading agencies
          </h2>
          <div className="lp-partners">
            {PARTNERS.map((p) => (
              <div className="lp-partner" key={p}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="lp-sec lp-or" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="lp-cta-in">
          <div>
            <h2 className="lp-cta-h">Ready to protect communities from floods?</h2>
            <p className="lp-cta-sub">
              Real-time flood risk intelligence for Rwanda — free for disaster management agencies.
            </p>
          </div>
          <div className="lp-cta-btns">
            <button className="lp-btn-w"  onClick={() => setPage("register")}>Get Access →</button>
            <button className="lp-btn-ol" onClick={() => setPage("help")}>Learn More</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
