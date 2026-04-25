
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
      width:32px;height:32px;border-radius:7px;
      background:var(--a300);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      box-shadow:0 2px 8px rgba(249,115,22,.35)
    }
    .nav-mark svg{width:16px;height:16px}
    .nav-name{font-family:var(--serif);font-size:14px;font-weight:700;color:#fff;line-height:1.2}
    .nav-tag{font-family:var(--mono);font-size:8.5px;color:var(--a200);letter-spacing:.09em;text-transform:uppercase;display:block}
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
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22C12 22 4 16 4 10a8 8 0 0 1 16 0c0 6-8 12-8 12z" />
                <circle cx="12" cy="10" r="2.5" />
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
