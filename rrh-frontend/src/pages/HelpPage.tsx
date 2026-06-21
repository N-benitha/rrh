import { useState } from "react";
import { useNavigate } from "react-router";
import { FAQS } from "../constants";
import { Footer } from "../components/shared";

const CSS = `
  .inner-top{padding:96px 40px 44px;background:var(--s900);border-bottom:1px solid var(--s700)}
  .inner-top-in{max-width:1320px;margin:0 auto}
  .inner-h1{font-family:var(--serif);font-size:clamp(26px,4vw,40px);font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-.01em}
  .inner-h1 em{font-style:italic;color:var(--a200)}
  .inner-sub{font-size:13.5px;color:var(--s300);max-width:460px;line-height:1.65}
  
  .search-wrap{position:relative;max-width:480px;margin-top:20px}
  .search-in{width:100%;padding:10px 14px 10px 38px;background:rgba(255,255,255,.07);border:1px solid var(--s600);border-radius:var(--r4);font-family:var(--serif);font-size:14px;outline:none;color:#fff;transition:all .17s;cursor:text}
  .search-in::placeholder{color:var(--s400)}
  .search-in:focus{border-color:var(--s300);background:rgba(255,255,255,.1)}
  .search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--s400);font-size:14px}
  
  .sec{padding:64px 40px;background:#fff}
  .sec-alt{background:var(--n50)}
  .sec-in{max-width:1320px;margin:0 auto}
  .sec-kicker{font-family:var(--mono);font-size:9px;font-weight:500;color:var(--a300);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .sec-kicker::before{content:'';display:block;width:16px;height:2px;background:var(--a300);border-radius:1px}
  
  .cat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;border:1px solid var(--n200);border-radius:var(--r6);overflow:hidden}
  .cat-card{padding:20px;background:#fff;cursor:pointer;transition:background .17s;border-right:1px solid var(--n200);border-bottom:1px solid var(--n200)}
  .cat-card:nth-child(3n){border-right:none}
  .cat-card:nth-child(n+4){border-bottom:none}
  .cat-card:hover{background:var(--s50)}
  .cat-n{font-family:var(--mono);font-size:9px;color:var(--n400);letter-spacing:.1em;margin-bottom:9px}
  .cat-name{font-family:var(--serif);font-size:14px;font-weight:700;color:var(--s900);margin-bottom:4px}
  .cat-desc{font-size:12px;color:var(--n500);line-height:1.55}
  
  .faq-list{max-width:680px;margin:0 auto}
  .faq-item{border-bottom:1px solid var(--n200)}
  .faq-q{padding:14px 0;display:flex;align-items:center;justify-content:space-between;cursor:pointer;gap:12px}
  .faq-q-text{font-family:var(--serif);font-size:14px;font-weight:600;color:var(--s900)}
  .faq-chev{font-family:var(--mono);font-size:11px;color:var(--s400);flex-shrink:0;transition:transform .2s}
  .faq-chev.op{transform:rotate(180deg)}
  .faq-body{overflow:hidden;max-height:0;transition:max-height .3s ease}
  .faq-body.op{max-height:200px}
  .faq-body-in{padding:0 0 14px;font-family:var(--serif);font-size:13.5px;color:var(--n600);line-height:1.75}
  
  .msg{padding:10px 13px;border-radius:var(--r4);font-family:var(--serif);font-size:12.5px;display:flex;align-items:flex-start;gap:8px;margin-bottom:13px;line-height:1.55}
  .msg-info{background:var(--info-lt);border:1px solid var(--info-bd);color:var(--info)}
  
  .btn-hero{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:13.5px;font-weight:600;border:none;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.3);cursor:pointer}
  .btn-hero:hover{background:var(--a400);transform:translateY(-1px)}

  @media(max-width:1100px){.cat-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:680px){.inner-top{padding:72px 18px 32px}.sec{padding:48px 18px}}
`;

export default function HelpPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  const cats = [
    ["Getting Started", "Account setup, login, and access"],
    [ "Flood Data", "Risk levels, data sources, and maps"],
    ["Alerts", "Set up and manage flood alerts"],
    [ "ML Predictions", "How the model works and reading output"],
    [ "Account & Security", "Password reset and account settings"],
    ["Contact Team", "How to reach out for support or inquiries"],
  ];

  return (
    <div className="page">
      <style>{CSS}</style>
      <div className="inner-top">
        <div className="inner-top-in">
          <div className="sec-kicker" style={{ color: "rgba(255,255,255,.3)" }}>
            Help Centre
          </div>
          <h1 className="inner-h1">
            How can we <em>help</em> you?
          </h1>
          <p className="inner-sub">Find answers about RRH, your account, flood data, and alerts.</p>
          <div className="search-wrap">
            <span className="search-ico">🔍</span>
            <input
              className="search-in"
              placeholder="Search questions and topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <section className="sec sec-alt">
        <div className="sec-in">
          <div className="sec-kicker">Browse by topic</div>
          <div className="cat-grid" style={{ marginBottom: 52 }}>
            {cats.map(([n, name, desc]) => (
              <div className="cat-card" key={n}>
                <div className="cat-n">{n}</div>
                <div className="cat-name">{name}</div>
                <div className="cat-desc">{desc}</div>
              </div>
            ))}
          </div>
          <div className="sec-kicker">Frequently asked questions</div>
          <div className="faq-list">
            {filtered.length === 0 && <div className="msg msg-info">No results for "{search}".</div>}
            {filtered.map((item, i) => (
              <div className="faq-item" key={i}>
                <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                  <span className="faq-q-text">{item.q}</span>
                  <span className={`faq-chev${open === i ? " op" : ""}`}>▾</span>
                </div>
                <div className={`faq-body${open === i ? " op" : ""}`}>
                  <div className="faq-body-in">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 44,
              background: "var(--s50)",
              border: "1px solid var(--s200)",
              borderRadius: "var(--r8)",
              padding: "26px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--s900)",
                  marginBottom: 4,
                }}
              >
                Still need help?
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 13, color: "var(--n500)" }}>
                Contact the RRH development team directly.
              </div>
            </div>
            <button className="btn-hero" onClick={() => navigate("/login")}>
              Sign in for support
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
