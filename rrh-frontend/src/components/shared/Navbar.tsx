
import type { Page, PageProps } from "../../types";

/**
 * Navigation bar component for landing pages
 */
export function Navbar({ setPage, cur }: PageProps & { cur: Page }) {
  const navCSS = `
    .nav{
      position:fixed;top:0;left:0;right:0;z-index:800;
      height:56px;
      background:var(--s900);
      border-bottom:1px solid var(--s700);
      box-shadow:0 2px 12px rgba(0,0,0,.2);
    }
    .nav-inner{
      max-width:1320px;margin:0 auto;height:100%;
      display:flex;align-items:center;padding:0 28px;gap:0
    }
    .nav-logo{display:flex;align-items:center;gap:9px;cursor:pointer;flex-shrink:0}
    .nav-mark{
      width:34px;height:34px;border-radius:9px;
      background:linear-gradient(145deg,#0d2240 0%,#091929 100%);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      box-shadow:0 0 0 1px rgba(79,195,247,.22),0 2px 14px rgba(0,0,0,.45)
    }
    .nav-mark svg{width:18px;height:18px}
    .nav-name{font-family:var(--serif);font-size:14px;font-weight:700;color:#fff;line-height:1.2;letter-spacing:-.01em}
    .nav-tag{font-family:var(--mono);font-size:8px;color:#4fc3f7;letter-spacing:.1em;text-transform:uppercase;display:block;opacity:.8}
    .nav-sep{width:1px;height:20px;background:var(--s600);margin:0 22px;flex-shrink:0}
    .nav-links{display:flex;align-items:center;gap:2px;margin-right:auto}
    .nav-lnk{
      padding:5px 12px;border-radius:var(--r4);
      font-family:var(--serif);font-size:13px;font-weight:400;color:var(--s200);
      background:none;border:none;transition:all .15s
    }
    .nav-lnk:hover{color:#fff;background:var(--s700)}
    .nav-lnk.cur{color:var(--a200);background:rgba(249,115,22,.15);font-weight:600}
    .nav-right{display:flex;align-items:center;gap:7px}
    .btn-out{
      padding:6px 14px;border-radius:var(--r4);
      font-family:var(--serif);font-size:13px;font-weight:500;
      color:var(--s200);border:1px solid var(--s600);background:transparent;transition:all .15s
    }
    .btn-out:hover{border-color:var(--s400);color:#fff;background:var(--s700)}
    .btn-fill{
      padding:6px 16px;border-radius:var(--r4);
      font-family:var(--serif);font-size:13px;font-weight:600;
      color:#fff;border:none;background:var(--a300);transition:all .15s;
      box-shadow:0 2px 8px rgba(249,115,22,.3)
    }
    .btn-fill:hover{background:var(--a400)}
  `;

  return (
    <div>
      <style>{navCSS}</style>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => setPage("landing")}>
            <div className="nav-mark">
              {/* RRH Shield-Wave logo mark */}
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield outline — resilience */}
                <path d="M12 2.5L4 6v7.5C4 18.5 7.6 22 12 23c4.4-1 8-4.5 8-9.5V6L12 2.5z"
                  fill="rgba(79,195,247,.12)" stroke="rgba(79,195,247,.88)" strokeWidth="1.4" strokeLinejoin="round"/>
                {/* River wave — flood monitoring */}
                <path d="M6.5 15.5Q9 12.5 12 15.5Q15 18.5 17.5 15.5"
                  stroke="rgba(255,255,255,.92)" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
                {/* Live alert dot — orange signal */}
                <circle cx="12" cy="9.5" r="2.8" fill="#f57c00"/>
                <circle cx="12" cy="9.5" r="1.3" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="nav-name">Rwanda Resilience Hub</div>
              <span className="nav-tag">Flood Intelligence</span>
            </div>
          </div>
          <div className="nav-sep" />
          <div className="nav-links">
            {([["landing","Home"],["about","About"],["help","Help"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} className={`nav-lnk${cur === p ? " cur" : ""}`} onClick={() => setPage(p)}>
                {label}
              </button>
            ))}
          </div>
          <div className="nav-right">
            <button className="btn-out" onClick={() => setPage("login")}>
              Sign in
            </button>
            <button className="btn-fill" onClick={() => setPage("register")}>
              Get access
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
