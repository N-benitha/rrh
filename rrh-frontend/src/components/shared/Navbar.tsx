
import type { Page, PageProps } from "../../types";

export function Navbar({ setPage, cur }: PageProps & { cur: Page }) {
  const navCSS = `
    .nav{
      position:fixed;top:0;left:0;right:0;z-index:800;
      height:58px;
      background:#0a1628;
      border-bottom:1px solid rgba(255,255,255,.07);
      box-shadow:0 1px 20px rgba(0,0,0,.35);
    }
    .nav-inner{
      max-width:1400px;margin:0 auto;height:100%;
      display:flex;align-items:center;padding:0 32px;
    }
    .nav-logo{display:flex;align-items:center;gap:10px;cursor:pointer;flex-shrink:0}
    .nav-logo-img{height:42px;width:42px;object-fit:contain;display:block;border-radius:6px;background:#fff;padding:2px;box-shadow:0 2px 10px rgba(0,0,0,.3)}
    .nav-name{font-family:var(--serif);font-size:15px;font-weight:700;color:#fff;line-height:1.2;letter-spacing:-.01em}
    .nav-sub{font-family:var(--mono);font-size:10px;color:rgba(249,115,22,.8);letter-spacing:.12em;text-transform:uppercase;display:block;margin-top:1px}
    .nav-space{flex:1}
    .nav-right{display:flex;align-items:center;gap:2px}
    .nav-lnk{
      padding:6px 14px;border-radius:6px;
      font-family:var(--serif);font-size:14px;font-weight:400;color:rgba(255,255,255,.5);
      background:none;border:none;cursor:pointer;transition:color .14s,background .14s
    }
    .nav-lnk:hover{color:#fff;background:rgba(255,255,255,.07)}
    .nav-lnk.cur{color:#f57c00;font-weight:600}
    .nav-div{width:1px;height:18px;background:rgba(255,255,255,.1);margin:0 10px;flex-shrink:0}
    .btn-out{
      padding:8px 17px;border-radius:6px;
      font-family:var(--serif);font-size:14px;font-weight:500;
      color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.14);background:transparent;
      cursor:pointer;transition:all .14s
    }
    .btn-out:hover{border-color:rgba(255,255,255,.32);color:#fff;background:rgba(255,255,255,.06)}
    .btn-fill{
      padding:8px 19px;border-radius:6px;margin-left:6px;
      font-family:var(--serif);font-size:14px;font-weight:700;
      color:#fff;border:none;background:#f57c00;cursor:pointer;
      box-shadow:0 2px 10px rgba(245,124,0,.35);transition:background .14s,transform .14s
    }
    .btn-fill:hover{background:#e65100;transform:translateY(-1px)}
  `;

  return (
    <div>
      <style>{navCSS}</style>
      <nav className="nav">
        <div className="nav-inner">

          {/* Logo — far left */}
          <div className="nav-logo" onClick={() => setPage("landing")}>
            <img src="/logo.png" alt="RRH" className="nav-logo-img" />
            <div>
              <div className="nav-name">Rwanda Resilience Hub</div>
              <span className="nav-sub">Flood Intelligence</span>
            </div>
          </div>

          <div className="nav-space" />

          {/* All navigation + auth on the right */}
          <div className="nav-right">
            {([["landing","Home"],["about","About"],["help","Help"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} className={`nav-lnk${cur === p ? " cur" : ""}`} onClick={() => setPage(p)}>
                {label}
              </button>
            ))}
            <div className="nav-div" />
            <button className="btn-out" onClick={() => setPage("login")}>Sign in</button>
            <button className="btn-fill" onClick={() => setPage("register")}>Get access</button>
          </div>

        </div>
      </nav>
    </div>
  );
}
