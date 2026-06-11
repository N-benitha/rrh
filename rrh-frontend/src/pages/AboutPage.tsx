import { Footer } from "../components/shared";
import type { PageProps } from "../types";

const CSS = `
  .inner-top{padding:96px 40px 44px;background:var(--s900);border-bottom:1px solid var(--s700)}
  .inner-top-in{max-width:1320px;margin:0 auto}
  .inner-h1{font-family:var(--serif);font-size:clamp(26px,4vw,40px);font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-.01em}
  .inner-h1 em{font-style:italic;color:var(--a200)}
  .inner-sub{font-size:15px;color:var(--s300);max-width:560px;line-height:1.65}
  .sec{padding:64px 40px;background:#fff}
  .sec-alt{background:var(--n50)}
  .sec-in{max-width:1320px;margin:0 auto}
  .sec-kicker{font-family:var(--mono);font-size:11px;font-weight:500;color:var(--a300);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .sec-kicker::before{content:'';display:block;width:16px;height:2px;background:var(--a300);border-radius:1px}
  .sec-h2{font-family:var(--serif);font-size:clamp(20px,3vw,26px);font-weight:700;color:var(--n900);line-height:1.12;margin-bottom:10px;letter-spacing:-.01em}
  .sec-p{font-family:var(--serif);font-size:15px;color:var(--n600);line-height:1.78;margin-bottom:14px}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px}
  .feat-card{background:#fff;border:1px solid var(--n200);border-radius:10px;padding:22px;transition:box-shadow .18s}
  .feat-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}
  .feat-icon{font-size:26px;margin-bottom:10px}
  .feat-title{font-family:var(--serif);font-size:15px;font-weight:700;color:var(--n900);margin-bottom:6px}
  .feat-desc{font-family:var(--serif);font-size:14px;color:var(--n500);line-height:1.65}
  .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
  .meta-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--n100)}
  .meta-k{font-family:var(--mono);font-size:11px;color:var(--n400);letter-spacing:.07em;text-transform:uppercase;flex-shrink:0;padding-right:12px}
  .meta-v{font-family:var(--serif);font-size:14px;color:var(--n700);text-align:right}
  .flow-steps{display:flex;flex-direction:column;gap:0}
  .flow-step{display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-bottom:1px solid var(--n100)}
  .flow-num{width:32px;height:32px;border-radius:50%;background:var(--a300);color:#fff;font-family:var(--mono);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
  .flow-title{font-family:var(--serif);font-size:15px;font-weight:700;color:var(--n900);margin-bottom:3px}
  .flow-desc{font-family:var(--serif);font-size:14px;color:var(--n500);line-height:1.6}
  .stat-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid var(--n200);border-radius:10px;overflow:hidden;margin-top:32px}
  .stat-strip-item{padding:22px;text-align:center;border-right:1px solid var(--n200)}
  .stat-strip-item:last-child{border-right:none}
  .stat-strip-val{font-family:var(--mono);font-size:26px;font-weight:700;color:var(--s600);margin-bottom:4px}
  .stat-strip-lbl{font-family:var(--serif);font-size:13px;color:var(--n500)}
  .btn-hero{display:inline-flex;align-items:center;gap:7px;padding:11px 24px;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:15px;font-weight:600;border:none;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.3);cursor:pointer;margin-top:22px}
  .btn-hero:hover{background:var(--a400);transform:translateY(-1px)}
  @media(max-width:1100px){.about-grid{grid-template-columns:1fr}.feat-grid{grid-template-columns:1fr 1fr}.stat-strip{grid-template-columns:1fr 1fr}}
  @media(max-width:680px){.inner-top{padding:72px 18px 32px}.sec{padding:48px 18px}.feat-grid{grid-template-columns:1fr}.stat-strip{grid-template-columns:1fr 1fr}}
`;

export default function AboutPage({ setPage }: PageProps) {
  return (
    <div className="page">
      <style>{CSS}</style>

      <div className="inner-top">
        <div className="inner-top-in">
          <div className="sec-kicker" style={{ color: "rgba(255,255,255,.3)" }}>About the system</div>
          <h1 className="inner-h1">Rwanda <em>Resilience Hub</em></h1>
          <p className="inner-sub">
            A real-time flood risk intelligence and early-warning platform for the Sebeya River Basin,
            Rubavu District — powered by machine learning, live sensor data, and geospatial analytics.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="sec-in">
          <div className="about-grid">
            <div>
              <div className="sec-kicker">What is RRH</div>
              <h2 className="sec-h2">An intelligent flood monitoring platform</h2>
              <p className="sec-p">
                The Rwanda Resilience Hub (RRH) is a web-based decision-support system that monitors
                flood risk across Rwanda in real time. It ingests rainfall, river level, and
                meteorological data from multiple sources, runs a machine learning classification
                pipeline, and surfaces actionable risk scores, alerts, and reports to authorised users.
              </p>
              <p className="sec-p">
                The platform is designed for government agencies, disaster-risk professionals, and
                researchers who need accurate, up-to-date situational awareness without relying solely
                on manual field reports.
              </p>
              <div className="stat-strip">
                {[["3","Sensor Stations"],["91%","ML Accuracy"],["15m","Update Interval"],["2","Data Sources"]].map(([v,l]) => (
                  <div className="stat-strip-item" key={l}>
                    <div className="stat-strip-val">{v}</div>
                    <div className="stat-strip-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="sec-kicker">How it works</div>
              <div className="flow-steps">
                {[
                  ["Data Ingestion","Rainfall, river levels, and weather data are fetched every 15 minutes from NASA POWER, OpenWeatherMap, and IoT sensor streams."],
                  ["ML Risk Classification","A trained Random Forest model scores each zone on a 0–100% flood-risk scale and assigns a risk level (Low → Critical)."],
                  ["Alert Generation","When thresholds are exceeded, the system automatically generates alerts and notifies the right users by role and zone."],
                  ["Dashboard & Reports","Analysts and managers access live maps, trend charts, zone details, and scheduled PDF/Excel reports from the web dashboard."],
                ].map(([title, desc], i) => (
                  <div className="flow-step" key={title}>
                    <div className="flow-num">{i + 1}</div>
                    <div>
                      <div className="flow-title">{title}</div>
                      <div className="flow-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec-alt">
        <div className="sec-in">
          <div className="sec-kicker">Platform features</div>
          <h2 className="sec-h2">Everything needed for flood risk management</h2>
          <div className="feat-grid">
            {[
              ["Live Sensor Monitoring","Real-time rainfall, river level, and risk score tracking across 3 Sebeya Basin stations — Downstream, Midstream, and Upstream."],
              ["ML Risk Prediction","Random Forest classifier trained on historical flood data delivers 91%+ accuracy risk scores, updated every 15 minutes."],
              ["Interactive Risk Map","Leaflet-based map showing all zones colour-coded by risk level, with clickable pins for zone detail."],
              ["Automated Alert System","Configurable alert rules trigger notifications for rainfall, river level, and risk-score thresholds across any zone."],
              ["Reports & Analytics","Generate daily, weekly, and monthly PDF or Excel reports; view trend charts for rainfall, river level, and ML accuracy."],
              ["Role-Based Access Control","Admin, Analyst, Zone Manager, and Observer roles with fine-grained permission controls per dashboard module."],
            ].map(([title, desc]) => (
              <div className="feat-card" key={title}>
                <div className="feat-title">{title}</div>
                <div className="feat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="sec-in">
          <div className="about-grid">
            <div>
              <div className="sec-kicker">Sensor stations</div>
              <h2 className="sec-h2">Sebeya River Basin · Rubavu District</h2>
              {[
                ["SEBY-DS-03","Kanama / Rubavu — Downstream · Critical threshold 2.5 m"],
                ["SEBY-MS-02","Nyundo — Midstream · Critical threshold 70 mm/h rainfall"],
                ["SEBY-US-01","Rutsiro — Upstream · Early-warning headwater station"],
              ].map(([name, region]) => (
                <div className="meta-row" key={name}>
                  <span className="meta-k" style={{ textTransform: "none", letterSpacing: 0 }}>{name}</span>
                  <span className="meta-v" style={{ color: "var(--n500)" }}>{region}</span>
                </div>
              ))}
              <button className="btn-hero" onClick={() => setPage("register")}>
                Get platform access →
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

