import { FEATURES, PROCESS, PARTNERS } from "../constants";
import { Navbar, Footer } from "../components/shared";
import type { PageProps } from "../types";

const CSS = `
  /* ══ HERO ══ */
  .lp-hero{padding-top:82px;background:#0c1a2e;display:flex;flex-direction:column}
  .lp-grid{display:grid;grid-template-columns:42fr 58fr;border-top:1px solid rgba(255,255,255,.08)}

  /* left column */
  .lp-copy{padding:40px 38px;display:flex;flex-direction:column;gap:22px;background:#0c1a2e;border-right:1px solid rgba(255,255,255,.07);justify-content:center}

  .lp-eye{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:9px;font-weight:600;color:#f57c00;letter-spacing:.14em;text-transform:uppercase}
  .lp-edot{width:6px;height:6px;border-radius:50%;background:#4fc3f7;animation:lp-blink 2s ease-in-out infinite}
  @keyframes lp-blink{0%,100%{opacity:1}50%{opacity:.2}}

  .lp-h1{font-family:var(--serif);font-size:clamp(28px,3vw,48px);font-weight:800;line-height:1.05;color:#fff;letter-spacing:-.02em;margin:0}
  .lp-h1 em{font-style:italic;color:#f57c00}
  .lp-desc{font-size:14px;line-height:1.8;color:rgba(255,255,255,.6);max-width:420px;margin:0}

  .lp-btns{display:flex;gap:9px;flex-wrap:wrap}
  .lp-btn-o{display:inline-flex;align-items:center;gap:6px;padding:11px 24px;border-radius:6px;background:#f57c00;color:#fff;font-family:var(--serif);font-size:14px;font-weight:700;border:none;cursor:pointer;transition:background .18s,transform .18s;box-shadow:0 3px 14px rgba(245,124,0,.4)}
  .lp-btn-o:hover{background:#e65100;transform:translateY(-1px)}
  .lp-btn-g{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:6px;background:transparent;color:rgba(255,255,255,.78);font-family:var(--serif);font-size:14px;font-weight:500;border:1px solid rgba(255,255,255,.22);cursor:pointer;transition:all .18s}
  .lp-btn-g:hover{border-color:rgba(255,255,255,.5);color:#fff}

  /* live pills */
  .lp-pills{display:flex;flex-wrap:wrap;gap:7px}
  .lp-pill{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:9px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:.06em;text-transform:uppercase}
  .lp-pill-r{background:rgba(239,68,68,.15);color:#fca5a5;border:1px solid rgba(239,68,68,.3)}
  .lp-pill-o{background:rgba(249,115,22,.15);color:#fdba74;border:1px solid rgba(249,115,22,.3)}
  .lp-pill-y{background:rgba(234,179,8,.15);color:#fde68a;border:1px solid rgba(234,179,8,.3)}
  .lp-pill-g{background:rgba(34,197,94,.15);color:#6ee7b7;border:1px solid rgba(34,197,94,.3)}
  .lp-pill-b{background:rgba(79,195,247,.12);color:#4fc3f7;border:1px solid rgba(79,195,247,.25)}
  .lp-pulseD{width:5px;height:5px;border-radius:50%;background:currentColor;animation:lp-blink 1.4s infinite}

  /* ── map panel (right) ── */
  .lp-map{position:relative;overflow:hidden;background:#050d18}
  .lp-mbar{position:absolute;top:0;left:0;right:0;z-index:50;padding:8px 14px;background:rgba(4,12,20,.9);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between}
  .lp-mbar-t{font-family:var(--mono);font-size:9px;font-weight:600;color:rgba(255,255,255,.45);letter-spacing:.08em}
  .lp-mbar-time{font-family:var(--mono);font-size:9px;color:#f57c00;font-weight:700}
  .lp-svg{position:absolute;inset:0;width:100%;height:100%}

  /* river flow animation */
  @keyframes lp-flow{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
  .lp-river{stroke-dasharray:8 6;animation:lp-flow 3s linear infinite}
  .lp-river2{stroke-dasharray:6 5;animation:lp-flow 4s linear infinite}
  .lp-river3{stroke-dasharray:5 4;animation:lp-flow 3.5s linear infinite}

  /* flood pulse */
  @keyframes lp-fpulse{0%{opacity:.45;r:14}50%{opacity:.18;r:22}100%{opacity:.45;r:14}}
  .lp-fz{animation:lp-fpulse 3s ease-in-out infinite}
  .lp-fz2{animation:lp-fpulse 3s ease-in-out 1.5s infinite}

  /* map legend */
  .lp-mleg{position:absolute;bottom:14px;right:14px;z-index:60;background:rgba(6,15,26,.88);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 13px;backdrop-filter:blur(6px)}
  .lp-mleg-h{font-family:var(--mono);font-size:7px;font-weight:700;color:rgba(255,255,255,.35);letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px}
  .lp-mleg-r{display:flex;align-items:center;gap:7px;font-family:var(--mono);font-size:8.5px;color:rgba(255,255,255,.7);margin-bottom:5px}
  .lp-mleg-r:last-child{margin-bottom:0}
  .lp-mleg-d{width:28px;height:3px;border-radius:2px;flex-shrink:0}

  /* ══ STATS STRIP ══ */
  .lp-stats{display:flex;align-items:stretch;background:#fff;border-top:3px solid #f57c00}
  .lp-stat{flex:1;padding:16px 20px;border-right:1px solid #e3f2fd;display:flex;flex-direction:column;gap:3px}
  .lp-stat:last-child{border-right:none}
  .lp-sv{font-family:var(--serif);font-size:22px;font-weight:800;color:#f57c00;line-height:1}
  .lp-sv.b{color:#1565c0}
  .lp-sl{font-family:var(--mono);font-size:8px;font-weight:600;color:#78909c;letter-spacing:.08em;text-transform:uppercase;margin-top:2px}

  /* ══ SECTIONS ══ */
  .lp-sec{padding:64px 44px}
  .lp-sec-w{background:#fff}
  .lp-sec-p{background:#e3f2fd}
  .lp-sec-n{background:#0c1a2e}
  .lp-sec-or{background:#f57c00}
  .lp-in{max-width:1280px;margin:0 auto}

  .lp-kk{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .lp-kk::before{content:'';display:block;width:18px;height:2px;border-radius:2px}
  .lp-kk-b{color:#1565c0}.lp-kk-b::before{background:#1565c0}
  .lp-kk-w{color:rgba(255,255,255,.4)}.lp-kk-w::before{background:rgba(255,255,255,.3)}

  .lp-h2{font-family:var(--serif);font-size:clamp(24px,3vw,34px);font-weight:800;line-height:1.1;margin-bottom:10px;letter-spacing:-.02em;color:#0c1a2e}
  .lp-h2-w{color:#fff}
  .lp-p{font-size:14px;line-height:1.78;max-width:500px;margin-bottom:38px;color:#546e7a}
  .lp-p-w{color:rgba(255,255,255,.58)}

  /* features */
  .lp-fg{display:grid;grid-template-columns:repeat(3,1fr);border:1.5px solid #bbdefb;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(21,101,192,.07)}
  .lp-fc{padding:26px;background:#fff;border-right:1.5px solid #bbdefb;border-bottom:1.5px solid #bbdefb;transition:background .18s;position:relative}
  .lp-fc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:transparent;transition:background .2s}
  .lp-fc:hover{background:#e8f4fd}
  .lp-fc:hover::before{background:#1565c0}
  .lp-fc:nth-child(3n){border-right:none}
  .lp-fc:nth-child(n+4){border-bottom:none}
  .lp-fn{font-family:var(--mono);font-size:10px;font-weight:700;color:#f57c00;letter-spacing:.1em;margin-bottom:11px}
  .lp-fc-emoji{font-size:30px;margin-bottom:10px;display:block;line-height:1}
  .lp-fname{font-family:var(--serif);font-size:15px;font-weight:700;color:#0c1a2e;margin-bottom:5px}
  .lp-ft{font-size:13px;color:#546e7a;line-height:1.7}

  /* architecture */
  .lp-pg{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid rgba(255,255,255,.1);border-radius:8px;overflow:hidden}
  .lp-pc{padding:20px 16px;border-right:1px solid rgba(255,255,255,.07);transition:background .18s}
  .lp-pc:last-child{border-right:none}
  .lp-pc:hover{background:rgba(21,101,192,.2)}
  .lp-pc:hover .lp-pn{color:#4fc3f7}
  .lp-pn{font-family:var(--mono);font-size:22px;font-weight:700;color:rgba(255,255,255,.1);margin-bottom:10px;transition:color .18s}
  .lp-pt{font-family:var(--serif);font-size:13px;font-weight:700;color:#fff;margin-bottom:5px;line-height:1.3}
  .lp-pd{font-size:11px;color:rgba(255,255,255,.42);line-height:1.68}

  /* partners */
  .lp-partg{display:grid;grid-template-columns:repeat(4,1fr);border:1.5px solid #90caf9;border-radius:8px;overflow:hidden}
  .lp-part{padding:14px 18px;border-right:1.5px solid #90caf9;font-family:var(--mono);font-size:10px;font-weight:500;color:#0c1a2e;letter-spacing:.02em;transition:all .14s;cursor:default}
  .lp-part:hover{background:#1565c0;color:#fff}
  .lp-part:nth-child(4n){border-right:none}

  /* CTA */
  .lp-cta-in{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
  .lp-cta-h{font-family:var(--serif);font-size:clamp(20px,3vw,30px);font-weight:800;color:#fff;letter-spacing:-.02em;margin-bottom:5px}
  .lp-cta-sub{font-size:13.5px;color:rgba(255,255,255,.85)}
  .lp-cta-btns{display:flex;gap:10px;flex-wrap:wrap}
  .lp-btn-w{padding:11px 24px;border-radius:6px;background:#fff;color:#f57c00;border:none;font-family:var(--serif);font-size:14px;font-weight:700;cursor:pointer;transition:all .18s}
  .lp-btn-w:hover{background:#fff3e0}
  .lp-btn-ol{padding:10px 24px;border-radius:6px;background:transparent;color:#fff;border:2px solid rgba(255,255,255,.45);font-family:var(--serif);font-size:14px;font-weight:600;cursor:pointer;transition:all .18s}
  .lp-btn-ol:hover{border-color:#fff;background:rgba(255,255,255,.1)}

  /* responsive */
  @media(max-width:1100px){
    .lp-grid{grid-template-columns:1fr;height:auto!important}
    .lp-map{min-height:420px}
    .lp-fg,.lp-pg{grid-template-columns:1fr 1fr}
    .lp-partg{grid-template-columns:1fr 1fr}
    .lp-stats{flex-wrap:wrap}
    .lp-stat{min-width:33%}
  }
  @media(max-width:680px){
    .lp-copy{padding:24px 18px;gap:18px}
    .lp-map{min-height:340px}
    .lp-fg,.lp-pg{grid-template-columns:1fr}
    .lp-sec{padding:48px 20px}
  }

  /* ══ HERO ENHANCEMENTS ══ */

  /* radar eyebrow */
  .lp-eye3{display:inline-flex;align-items:center;gap:11px;background:rgba(79,195,247,.07);border:1px solid rgba(79,195,247,.24);border-radius:24px;padding:7px 16px 7px 10px;width:fit-content}
  .lp-radar{position:relative;width:20px;height:20px;flex-shrink:0}
  .lp-rring{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(79,195,247,.65);animation:lp-rexp 2.2s ease-out infinite}
  .lp-rring2{animation-delay:.7s;border-color:rgba(79,195,247,.35)}
  @keyframes lp-rexp{0%{transform:scale(.45);opacity:.9}100%{transform:scale(1.7);opacity:0}}
  .lp-rdot{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:50%;background:#4fc3f7;box-shadow:0 0 8px rgba(79,195,247,.9)}
  .lp-eye3-t{font-family:var(--mono);font-size:9px;font-weight:700;color:#4fc3f7;letter-spacing:.14em;text-transform:uppercase}

  /* headline first-line gradient */
  .lp-h1-blue{background:linear-gradient(128deg,#ffffff 20%,#b3e5fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

  /* live ticker strip */
  .lp-ticker{display:flex;align-items:center;gap:10px;padding:8px 13px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:6px}
  .lp-live-b{background:#ef4444;border-radius:3px;padding:2px 8px;font-family:var(--mono);font-size:7.5px;font-weight:800;color:#fff;letter-spacing:.16em;flex-shrink:0;box-shadow:0 0 8px rgba(239,68,68,.5)}
  .lp-ticker-t{font-family:var(--mono);font-size:8.5px;color:rgba(255,255,255,.35);letter-spacing:.04em;line-height:1.5}

  /* accent left border on copy panel */
  .lp-copy{position:relative}
  .lp-copy-accent{position:absolute;top:0;left:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent 0%,#4fc3f7 25%,#f57c00 75%,transparent 100%);border-radius:2px}

  /* map grid overlay */
  .lp-gridov{position:absolute;inset:0;background-image:linear-gradient(rgba(79,195,247,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,195,247,.04) 1px,transparent 1px);background-size:22px 22px;z-index:4;pointer-events:none}

  /* map scan line */
  @keyframes lp-scan2{0%{top:28px;opacity:.5}100%{top:calc(100% - 24px);opacity:.9}}
  .lp-scanline{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(79,195,247,.25) 15%,rgba(79,195,247,.75) 50%,rgba(79,195,247,.25) 85%,transparent 100%);animation:lp-scan2 7s ease-in-out infinite alternate;z-index:20;pointer-events:none;box-shadow:0 0 10px rgba(79,195,247,.45)}

  /* map corner data readouts */
  .lp-cdata{position:absolute;background:rgba(4,12,24,.9);border:1px solid rgba(79,195,247,.2);border-radius:6px;padding:8px 12px;backdrop-filter:blur(8px);z-index:60}
  .lp-cdata-v{font-family:var(--mono);font-size:16px;font-weight:700;color:#4fc3f7;line-height:1;display:flex;align-items:baseline;gap:3px}
  .lp-cdata-u{font-size:9px;color:rgba(79,195,247,.6);font-weight:500}
  .lp-cdata-l{font-family:var(--mono);font-size:7px;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;margin-top:4px}
`;


const FEATURE_EMOJIS = ["📡", "🤖", "🗺️", "🔌", "🚨", "📊"];

export default function LandingPage({ setPage }: PageProps) {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="page">
      <style>{CSS}</style>
      <Navbar setPage={setPage} cur="landing" />

      {/* ══ HERO ══ */}
      <section className="lp-hero">
        <div className="lp-grid" style={{ height: 520 }}>

          {/* LEFT — headline + description + buttons */}
          <div className="lp-copy">
            {/* accent border */}
            <div className="lp-copy-accent" />

            {/* radar eyebrow */}
            <div className="lp-eye3">
              <div className="lp-radar">
                <div className="lp-rring" />
                <div className="lp-rring lp-rring2" />
                <div className="lp-rdot" />
              </div>
              <span className="lp-eye3-t">Live Flood Monitoring · Rwanda</span>
            </div>

            <h1 className="lp-h1">
              <span className="lp-h1-blue">Predict Floods.</span>
              <br /><em>Protect Lives.</em>
            </h1>

            <p className="lp-desc">
              Combining satellite rainfall data, IoT river sensors, and machine learning
              to deliver real-time flood risk intelligence across Rwanda's most vulnerable
              river basins — before disaster strikes.
            </p>

            {/* live update ticker */}
            <div className="lp-ticker">
              <span className="lp-live-b">LIVE</span>
              <span className="lp-ticker-t">Satellite synced · Sensor update in 13 min · 5 zones active · 3 alerts</span>
            </div>

            <div className="lp-btns">
              <button className="lp-btn-o" onClick={() => setPage("register")}>Get Access →</button>
              <button className="lp-btn-g" onClick={() => setPage("help")}>How It Works</button>
            </div>

            {/* live risk pills */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 16 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>
                Current risk levels
              </div>
              <div className="lp-pills">
                <span className="lp-pill lp-pill-r"><span className="lp-pulseD" />Nyabugogo · Critical</span>
                <span className="lp-pill lp-pill-o"><span className="lp-pulseD" />Sebeya · High</span>
                <span className="lp-pill lp-pill-o"><span className="lp-pulseD" />Kigali Urban · High</span>
                <span className="lp-pill lp-pill-y">Nyabarongo · Moderate</span>
                <span className="lp-pill lp-pill-g">Akagera · Low</span>
              </div>
            </div>

            <div className="lp-pills">
              <span className="lp-pill lp-pill-b"><span className="lp-pulseD" />5 zones monitored</span>
              <span className="lp-pill lp-pill-b">91 % ML accuracy</span>
              <span className="lp-pill lp-pill-b">15 min updates</span>
            </div>
          </div>

          {/* RIGHT — Rwanda map with rivers */}
          <div className="lp-map">
            <div className="lp-mbar">
              <span className="lp-mbar-t">RRH · RIVER BASIN MAP · RWANDA</span>
              <span className="lp-mbar-time">{now} CAT</span>
            </div>

            {/* grid overlay */}
            <div className="lp-gridov" />
            {/* scanning sweep line */}
            <div className="lp-scanline" />
            {/* corner data — rainfall */}
            <div className="lp-cdata" style={{ top: 50, left: 12 }}>
              <div className="lp-cdata-v">24.7<span className="lp-cdata-u">mm</span></div>
              <div className="lp-cdata-l">24h Rainfall · Kigali</div>
            </div>
            {/* corner data — water level */}
            <div className="lp-cdata" style={{ top: 50, right: 120 }}>
              <div className="lp-cdata-v">+1.8<span className="lp-cdata-u">m</span></div>
              <div className="lp-cdata-l">Nyabugogo Level</div>
            </div>

            <svg
              className="lp-svg"
              viewBox="-15 -15 250 235"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* glow filter for rivers */}
                <filter id="lp-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                {/* flood zone gradient */}
                <radialGradient id="lp-fgrad-r" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="lp-fgrad-o" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.28"/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="lp-fgrad-y" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0"/>
                </radialGradient>
              </defs>

              {/* ── background ── */}
              <rect x="-15" y="-15" width="250" height="250" fill="#050d18"/>

              {/* ── country outline ── */}
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
                fill="rgba(21,101,192,.14)"
                stroke="rgba(79,195,247,.55)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />

              {/* ── Lake Kivu (western border) ── */}
              <ellipse cx="7" cy="86" rx="5" ry="20"
                fill="rgba(79,195,247,.25)" stroke="rgba(79,195,247,.5)" strokeWidth="0.8"/>
              <text x="-6" y="91" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                fill="rgba(79,195,247,.65)" transform="rotate(-90,-6,91)">L.Kivu</text>

              {/* ── FLOOD ZONES (glowing overlays) ── */}
              {/* CRITICAL — Nyabugogo/Kigali (cx≈128, cy≈100) */}
              <ellipse cx="128" cy="100" rx="26" ry="19" fill="url(#lp-fgrad-r)" className="lp-fz"/>
              <ellipse cx="128" cy="100" rx="18" ry="13" fill="rgba(239,68,68,.2)" stroke="rgba(239,68,68,.45)" strokeWidth="0.9"/>

              {/* HIGH — Sebeya (cx≈55, cy≈68) */}
              <ellipse cx="55" cy="68" rx="20" ry="16" fill="url(#lp-fgrad-o)" className="lp-fz2"/>
              <ellipse cx="55" cy="68" rx="13" ry="10" fill="rgba(249,115,22,.18)" stroke="rgba(249,115,22,.4)" strokeWidth="0.8"/>

              {/* MODERATE — Nyabarongo (cx≈112, cy≈122) */}
              <ellipse cx="112" cy="122" rx="22" ry="14" fill="url(#lp-fgrad-y)"/>
              <ellipse cx="112" cy="122" rx="14" ry="9" fill="rgba(234,179,8,.15)" stroke="rgba(234,179,8,.35)" strokeWidth="0.7"/>

              {/* ── RIVERS ── */}

              {/* Nyabarongo River — Rwanda's longest, central */}
              <path
                d="M41,156 Q52,142 60,128 Q68,112 76,100 Q84,91 94,86 Q104,82 114,85 Q124,89 132,95 Q140,99 150,95 Q158,89 162,80 Q166,70 168,60"
                fill="none" stroke="#29b6f6" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"
                filter="url(#lp-glow)" className="lp-river" opacity="0.9"
              />
              {/* Nyabarongo label */}
              <text fontSize="6" fontFamily="monospace" fontWeight="600" fill="#4fc3f7" opacity="0.85">
                <textPath href="#lp-nyabarongo-path" startOffset="12%">Nyabarongo R.</textPath>
              </text>
              <path id="lp-nyabarongo-path"
                d="M41,156 Q52,142 60,128 Q68,112 76,100 Q84,91 94,86 Q104,82 114,85 Q124,89 132,95 Q140,99 150,95 Q158,89 162,80 Q166,70 168,60"
                fill="none" stroke="none"/>

              {/* Sebeya River — western, flows into Lake Kivu */}
              <path
                d="M58,55 Q54,60 48,66 Q38,72 22,76 Q14,77 7,78"
                fill="none" stroke="#29b6f6" strokeWidth="2"
                strokeLinecap="round" filter="url(#lp-glow)" className="lp-river2" opacity="0.8"
              />
              <text x="24" y="70" fontFamily="monospace" fontSize="5.5" fontWeight="600"
                fill="#4fc3f7" opacity="0.8" transform="rotate(-14,24,70)">Sebeya R.</text>

              {/* Akagera River — eastern, along Tanzania border */}
              <path
                d="M172,175 Q178,158 182,140 Q185,120 185,100 Q185,82 186,65 Q188,52 194,40 Q198,30 200,20"
                fill="none" stroke="#29b6f6" strokeWidth="2.2"
                strokeLinecap="round" filter="url(#lp-glow)" className="lp-river3" opacity="0.8"
              />
              <text x="191" y="128" fontFamily="monospace" fontSize="5.5" fontWeight="600"
                fill="#4fc3f7" opacity="0.8" transform="rotate(90,191,128)">Akagera R.</text>

              {/* Mukungwa River — NW tributary feeds Nyabarongo */}
              <path
                d="M80,18 Q80,30 81,44 Q82,56 84,68 Q85,76 88,84"
                fill="none" stroke="#29b6f6" strokeWidth="1.4"
                strokeLinecap="round" className="lp-river2" opacity="0.6"
              />
              <text x="88" y="38" fontFamily="monospace" fontSize="4.5"
                fill="#4fc3f7" opacity="0.6" transform="rotate(88,88,38)">Mukungwa</text>

              {/* ── zone dots (minimal) ── */}
              {/* CRITICAL - Nyabugogo */}
              <circle cx="126" cy="97" r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1"/>
              {/* HIGH - Sebeya */}
              <circle cx="55" cy="68" r="3" fill="#f97316" stroke="#fff" strokeWidth="1"/>
              {/* HIGH - Kigali */}
              <circle cx="131" cy="104" r="3" fill="#f97316" stroke="#fff" strokeWidth="1"/>
              {/* MODERATE - Nyabarongo */}
              <circle cx="112" cy="122" r="2.8" fill="#eab308" stroke="#fff" strokeWidth="1"/>
              {/* LOW - Akagera */}
              <circle cx="185" cy="92" r="2.8" fill="#22c55e" stroke="#fff" strokeWidth="1"/>

              {/* ── neighbour labels ── */}
              <text x="100" y="-5"  textAnchor="middle" fontSize="7" fontFamily="monospace" fill="rgba(255,255,255,.2)">UGANDA</text>
              <text x="222" y="100" textAnchor="start"  fontSize="7" fontFamily="monospace" fill="rgba(255,255,255,.2)">TANZANIA</text>
              <text x="108" y="213" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="rgba(255,255,255,.2)">BURUNDI</text>
              <text x="-14" y="100" textAnchor="start"  fontSize="7" fontFamily="monospace" fill="rgba(255,255,255,.2)">DRC</text>
            </svg>

            {/* river legend */}
            <div className="lp-mleg">
              <div className="lp-mleg-h">Map Legend</div>
              <div className="lp-mleg-r">
                <div className="lp-mleg-d" style={{ background: "#29b6f6" }}/>
                River basin
              </div>
              <div className="lp-mleg-r">
                <div className="lp-mleg-d" style={{ background: "rgba(239,68,68,.6)" }}/>
                Critical flood zone
              </div>
              <div className="lp-mleg-r">
                <div className="lp-mleg-d" style={{ background: "rgba(249,115,22,.55)" }}/>
                High flood zone
              </div>
              <div className="lp-mleg-r">
                <div className="lp-mleg-d" style={{ background: "rgba(234,179,8,.55)" }}/>
                Moderate zone
              </div>
            </div>
          </div>
        </div>

        {/* ── stats strip ── */}
        <div className="lp-stats">
          {([
            ["5",       "Zones monitored",  "b"],
            ["3",       "Active alerts",    ""],
            ["91%",     "ML accuracy",      "b"],
            ["~15 min", "Update interval",  ""],
            ["2025",    "Capstone project", "b"],
          ] as [string,string,string][]).map(([v,l,c],i) => (
            <div className="lp-stat" key={i}>
              <div className={`lp-sv${c ? " b" : ""}`}>{v}</div>
              <div className="lp-sl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Features ══ */}
      <section className="lp-sec lp-sec-w">
        <div className="lp-in">
          <div className="lp-kk lp-kk-b">Platform Capabilities</div>
          <h2 className="lp-h2">Built for Rwanda's flood reality</h2>
          <p className="lp-p">
            Designed to complement MINEMA, RWB, and Meteo Rwanda — unifying fragmented
            data sources into one decision-support platform.
          </p>
          <div className="lp-fg">
            {FEATURES.map((f, i) => (
              <div className="lp-fc" key={i}>
                <span className="lp-fc-emoji">{FEATURE_EMOJIS[i]}</span>
                <div className="lp-fn">0{i + 1}</div>
                <div className="lp-fname">{f.name}</div>
                <div className="lp-ft">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Architecture ══ */}
      <section className="lp-sec lp-sec-n">
        <div className="lp-in">
          <div className="lp-kk lp-kk-w">System Architecture</div>
          <h2 className="lp-h2 lp-h2-w">From raw data to risk alert</h2>
          <p className="lp-p lp-p-w" style={{ marginBottom: 26 }}>
            A five-layer pipeline processes environmental data end-to-end in near real time.
          </p>
          <div className="lp-pg">
            {PROCESS.map((p, i) => (
              <div className="lp-pc" key={i}>
                <div className="lp-pn">0{i + 1}</div>
                <div className="lp-pt">{p.title}</div>
                <div className="lp-pd">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Partners ══ */}
      <section className="lp-sec lp-sec-p" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="lp-in">
          <div className="lp-kk lp-kk-b" style={{ marginBottom: 16 }}>Institutional Partners</div>
          <div className="lp-partg">
            {PARTNERS.map((p) => (
              <div className="lp-part" key={p}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="lp-sec lp-sec-or" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="lp-cta-in">
          <div>
            <h2 className="lp-cta-h">Ready to protect communities from floods?</h2>
            <p className="lp-cta-sub">Get access to real-time flood risk intelligence for Rwanda.</p>
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