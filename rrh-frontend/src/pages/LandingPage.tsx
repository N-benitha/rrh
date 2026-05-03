import "../styles/landing.css";
import { FEATURES,} from "../constants";
import { Footer } from "../components/shared";
import type { PageProps } from "../types";




const STATS: [string, string, string][] = [
  ["5",      "River zones",    "#f57c00"],
  ["3",      "Active alerts",  "#1a3a6c"],
  ["91%",    "ML accuracy",    "#f57c00"],
  ["15 min", "Data refresh",   "#1a3a6c"],
];

export default function LandingPage({ setPage }: PageProps) {
  return (
    <div className="page">

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

          </div>

          {/* RIGHT — flood photo */}
          <div className="lp-img-panel">
            <img src="/image.png" className="lp-flood-img" alt="Rwanda flood" />
            <div className="lp-overlay" />
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
            Designed alongside MINEMA, RWB, and Meteo Rwanda unifying satellite data,
            sensor streams, and machine learning into one decision-support platform.
          </p>
          <div className="lp-features">
            {FEATURES.map((f, i) => (
              <div className="lp-fc" key={i}>
                <span className="lp-fc-icon"></span>
                <div className="lp-fc-num">0{i + 1}</div>
                <div className="lp-fc-name">{f.name}</div>
                <div className="lp-fc-text">{f.text}</div>
              </div>
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
