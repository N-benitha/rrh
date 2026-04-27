import { Navbar, Footer } from "../components/shared";
import type { PageProps } from "../types";

const CSS = `
  .inner-top{padding:96px 40px 44px;background:var(--s900);border-bottom:1px solid var(--s700)}
  .inner-top-in{max-width:1320px;margin:0 auto}
  .inner-h1{font-family:var(--serif);font-size:clamp(26px,4vw,40px);font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-.01em}
  .inner-h1 em{font-style:italic;color:var(--a200)}
  .inner-sub{font-size:13.5px;color:var(--s300);max-width:460px;line-height:1.65}
  
  .sec{padding:64px 40px;background:#fff}
  .sec-in{max-width:1320px;margin:0 auto}
  .sec-kicker{font-family:var(--mono);font-size:9px;font-weight:500;color:var(--a300);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .sec-kicker::before{content:'';display:block;width:16px;height:2px;background:var(--a300);border-radius:1px}
  .sec-h2{font-family:var(--serif);font-size:clamp(20px,3vw,26px);font-weight:700;color:var(--n900);line-height:1.12;margin-bottom:10px;letter-spacing:-.01em}
  
  .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
  
  .team-row{display:flex;gap:13px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--n200)}
  .team-init{width:40px;height:40px;border-radius:var(--r4);background:var(--s50);border:1px solid var(--s200);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:14px;font-weight:700;color:var(--s600);flex-shrink:0}
  .team-name{font-family:var(--serif);font-size:14px;font-weight:700;color:var(--s900);margin-bottom:2px}
  .team-role{font-size:12px;color:var(--n500);line-height:1.55}
  .team-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
  .t-tag{font-family:var(--mono);font-size:9.5px;padding:2px 7px;border-radius:2px;background:var(--s50);color:var(--s500);border:1px solid var(--s200)}
  
  .meta-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--n100)}
  .meta-k{font-family:var(--mono);font-size:9px;color:var(--n400);letter-spacing:.07em;text-transform:uppercase;flex-shrink:0;padding-right:12px}
  .meta-v{font-family:var(--serif);font-size:12.5px;color:var(--n700);text-align:right}
  
  .btn-hero{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:13.5px;font-weight:600;border:none;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.3);cursor:pointer;margin-top:22px}
  .btn-hero:hover{background:var(--a400);transform:translateY(-1px)}

  @media(max-width:1100px){.about-grid{grid-template-columns:1fr}}
  @media(max-width:680px){.inner-top{padding:72px 18px 32px}.sec{padding:48px 18px}}
`;

export default function AboutPage({ setPage }: PageProps) {
  return (
    <div className="page">
      <style>{CSS}</style>
      <Navbar setPage={setPage} cur="about" />
      <div className="inner-top">
        <div className="inner-top-in">
          <div className="sec-kicker" style={{ color: "rgba(255,255,255,.3)" }}>
            About the project
          </div>
          <h1 className="inner-h1">
            Built by us, for <em>Rwanda</em>
          </h1>
          <p className="inner-sub">
            A flood risk intelligence platform built by Benitha NGUNGA and Yvette Tuyizere as a capstone project at
            the University of Rwanda, School of ICT.
          </p>
        </div>
      </div>
      <section className="sec">
        <div className="sec-in">
          <div className="about-grid">
            <div>
              <div className="sec-kicker">Our mission</div>
              <h2 className="sec-h2" style={{ fontSize: 26, marginBottom: 12 }}>
                Flood intelligence for Rwanda's communities
              </h2>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 14.5,
                  color: "var(--n600)",
                  lineHeight: 1.78,
                  marginBottom: 12,
                }}
              >
                To deliver real-time flood risk intelligence to communities across Rwanda — helping people protect
                themselves through early warnings and clear, actionable information.
              </p>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 14.5,
                  color: "var(--n600)",
                  lineHeight: 1.78,
                  marginBottom: 28,
                }}
              >
                We built RRH to bridge the gap between Rwanda's national flood monitoring institutions and the
                communities they serve.
              </p>
              <div className="sec-kicker">Technology stack</div>
              {[
                ["Backend", "FastAPI · PostgreSQL · SQLAlchemy · Alembic"],
                ["ML Pipeline", "scikit-learn · Random Forest · Logistic Regression"],
                ["Data Sources", "NASA POWER · OpenWeather · IoT Simulation"],
                ["Frontend", "React 19 · TypeScript · Leaflet · Vite"],
                ["Deployment", "Render (API + DB) · Vercel (Frontend)"],
              ].map(([k, v]) => (
                <div className="meta-row" key={k}>
                  <span className="meta-k">{k}</span>
                  <span className="meta-v">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="sec-kicker">The team</div>
              {[
                {
                  init: "BN",
                  name: "Benitha NGUNGA",
                  role: "Backend Engineer · ML & Data Pipeline",
                  tags: ["FastAPI", "PostgreSQL", "scikit-learn", "Data Ingestion"],
                },
                {
                  init: "YT",
                  name: "Yvette Tuyizere",
                  role: "Frontend Engineer · UI/UX · Dashboard",
                  tags: ["React 19", "TypeScript", "Leaflet", "Auth Pages"],
                },
              ].map((m) => (
                <div className="team-row" key={m.init}>
                  <div className="team-init">{m.init}</div>
                  <div>
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                    <div className="team-tags">
                      {m.tags.map((t) => (
                        <span className="t-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 22 }}>
                {[
                  ["Supervisors", "Mr. Dieudonne Ukurikiyeyesu & Mr. Omar Sinayobye"],
                  ["Institution", "University of Rwanda · School of ICT"],
                  ["Programme", "Computer & Software Engineering"],
                  ["Year", "Capstone Project · 2025"],
                ].map(([k, v]) => (
                  <div className="meta-row" key={k}>
                    <span className="meta-k">{k}</span>
                    <span className="meta-v">{v}</span>
                  </div>
                ))}
              </div>
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
