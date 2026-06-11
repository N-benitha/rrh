

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
    .auth-side-mark{width:38px;height:38px;border-radius:6px;background:#fff;padding:2px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.25)}
    .auth-side-mark img{width:100%;height:100%;object-fit:contain;display:block;border-radius:4px}
    .auth-side-name{font-family:var(--serif);font-size:13px;font-weight:700;color:#fff;line-height:1.2}
    .auth-side-sub{font-family:var(--mono);font-size:8px;color:var(--a200);letter-spacing:.09em;text-transform:uppercase;display:block}
    .auth-side-h{font-family:var(--serif);font-size:clamp(30px,3vw,42px);font-weight:700;color:#fff;line-height:1.1;letter-spacing:-.01em;margin-bottom:12px}
    .auth-side-h em{font-style:italic;color:var(--a200)}
    .auth-side-p{font-size:16px;color:var(--s300);line-height:1.7;margin-bottom:30px;max-width:360px}
    .auth-side-feats{display:flex;flex-direction:column;gap:14px;flex:1}
    .asf{display:flex;align-items:flex-start;gap:10px}
    .asf-dot{width:5px;height:5px;border-radius:50%;background:var(--a300);flex-shrink:0;margin-top:8px}
    .asf-body{font-size:14px;line-height:1.55}
    .asf-body strong{color:rgba(255,255,255,.9);display:block;font-weight:600;margin-bottom:2px}
    .asf-body span{color:rgba(255,255,255,.5)}
    .auth-side-foot{font-family:var(--mono);font-size:10px;color:rgba(255,255,255,.25);margin-top:auto;padding-top:20px;border-top:1px solid var(--s700);letter-spacing:.03em}
  `;

  return (
    <div>
      <style>{authCSS}</style>
      <div className="auth-side">
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
