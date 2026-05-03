

export function Footer() {
  const footerCSS = `
    .footer{background:var(--s900);border-top:1px solid var(--s700);padding:18px 40px}
    .footer-in{max-width:1320px;margin:0 auto;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px}
    .footer-brand{font-family:var(--serif);font-size:14px;font-weight:700;color:rgba(255,255,255,.6)}
    .footer-note{font-family:var(--mono);font-size:11px;color:rgba(255,255,255,.25);text-align:center;letter-spacing:.02em}
    .footer-note em{color:var(--a200);font-style:normal}
  `;

  return (
    <div>
      <style>{footerCSS}</style>
      <footer className="footer">
        <div className="footer-in">
          <div className="footer-brand">Rwanda Resilience Hub</div>
        </div>
      </footer>
    </div>
  );
}
