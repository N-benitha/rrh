

interface AuthSideProps {
  heading: string;
  sub: string;
  points: [string, string][];
}

export function AuthSide({ heading, sub, points }: AuthSideProps) {
  const authCSS = `
    .auth-side{
      background:var(--s800);border-right:1px solid var(--s700);
      padding:40px 44px;display:flex;flex-direction:column
    }
    .auth-side-logo{display:flex;align-items:center;gap:9px;margin-bottom:40px}
    .auth-side-mark{width:30px;height:30px;border-radius:var(--r4);background:var(--a300);display:flex;align-items:center;justify-content:center}
    .auth-side-mark svg{width:14px;height:14px}
    .auth-side-name{font-family:var(--serif);font-size:13px;font-weight:700;color:#fff;line-height:1.2}
    .auth-side-sub{font-family:var(--mono);font-size:8px;color:var(--a200);letter-spacing:.09em;text-transform:uppercase;display:block}
    .auth-side-h{font-family:var(--serif);font-size:clamp(26px,3vw,36px);font-weight:700;color:#fff;line-height:1.1;letter-spacing:-.01em;margin-bottom:9px}
    .auth-side-h em{font-style:italic;color:var(--a200)}
    .auth-side-p{font-size:13.5px;color:var(--s300);line-height:1.7;margin-bottom:30px;max-width:360px}
    .auth-side-feats{display:flex;flex-direction:column;gap:12px;flex:1}
    .asf{display:flex;align-items:flex-start;gap:9px}
    .asf-dot{width:4px;height:4px;border-radius:50%;background:var(--a300);flex-shrink:0;margin-top:7px}
    .asf-body{font-size:12px;line-height:1.55}
    .asf-body strong{color:rgba(255,255,255,.9);display:block;font-weight:600;margin-bottom:1px}
    .asf-body span{color:rgba(255,255,255,.35)}
    .auth-side-foot{font-family:var(--mono);font-size:8.5px;color:rgba(255,255,255,.18);margin-top:auto;padding-top:20px;border-top:1px solid var(--s700);letter-spacing:.03em}
  `;

  return (
    <div>
      <style>{authCSS}</style>
      <div className="auth-side">
        <div className="auth-side-logo">
          <div className="auth-side-mark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--s900)"
              strokeWidth="2"
              strokeLinecap="round"
              width="15"
              height="15"
            >
              <path d="M12 22C12 22 4 16 4 10a8 8 0 0 1 16 0c0 6-8 12-8 12z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </div>
          <div>
            <div className="auth-side-name">Rwanda Resilience Hub</div>
            <span className="auth-side-sub">Flood Intelligence</span>
          </div>
        </div>
        <h2 className="auth-side-h" dangerouslySetInnerHTML={{ __html: heading }} />
        <p className="auth-side-p">{sub}</p>
        <div className="auth-side-feats">
          {points.map(([title, desc], i) => (
            <div className="asf" key={i}>
              <div className="asf-dot" />
              <div className="asf-body">
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="auth-side-foot">
          Benitha NGUNGA &amp; Yvette Tuyizere · 2025
        </div>
      </div>
    </div>
  );
}
