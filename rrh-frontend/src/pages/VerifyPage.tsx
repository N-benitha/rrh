import React, { useState, useEffect } from "react";
import { AuthSide } from "../components/shared";
import type { PageProps } from "../types";

const CSS = `
  .auth-wrap{min-height:100vh;display:grid;grid-template-columns:45fr 55fr;background:var(--s900)}
  .auth-form-area{display:flex;align-items:center;justify-content:center;padding:36px;background:var(--n50)}
  .auth-box{width:100%;max-width:390px}
  .auth-title{font-family:var(--serif);font-size:21px;font-weight:700;color:var(--n900);margin-bottom:4px;letter-spacing:-.01em}
  .auth-sub{font-size:13px;color:var(--n500);margin-bottom:20px;line-height:1.55}
  
  .verify-box{width:56px;height:56px;border-radius:var(--r6);background:var(--s50);border:1px solid var(--s200);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px}
  .verify-box.ok{background:var(--ok-lt);border-color:var(--ok-bd)}
  
  .step-dots{display:flex;align-items:center;margin-bottom:5px}
  .sdot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;font-weight:500;transition:all .2s}
  .sdot.done{background:var(--ok);color:#fff}
  .sdot.active{background:var(--s600);color:#fff;box-shadow:0 0 0 4px rgba(37,58,82,.14)}
  .sdot.idle{background:var(--n100);color:var(--n400);border:1px solid var(--n200)}
  .sline{flex:1;height:1px;background:var(--n200)}
  .sline.done{background:var(--ok)}
  .slbls{display:flex;justify-content:space-between;font-family:var(--mono);font-size:9px;color:var(--n400);letter-spacing:.07em;text-transform:uppercase;margin-bottom:18px}
  
  .otp-wrap{display:flex;gap:8px;justify-content:center;margin:18px 0}
  .otp-cell{width:46px;height:52px;border-radius:var(--r4);background:#fff;border:1px solid var(--n200);text-align:center;font-family:var(--serif);font-size:20px;font-weight:700;color:var(--s700);outline:none;transition:all .17s;cursor:text}
  .otp-cell:focus{border-color:var(--s400);box-shadow:0 0 0 3px rgba(58,85,112,.1)}
  .otp-cell.filled{background:var(--s50);border-color:var(--s200);color:var(--s700)}
  
  .btn-sub{width:100%;padding:11px;border:none;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:13.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.28);cursor:pointer}
  .btn-sub:hover:not(:disabled){background:var(--a400)}
  .btn-sub:disabled{background:var(--n300);cursor:not-allowed;box-shadow:none}
  
  .countdown{text-align:center;font-family:var(--mono);font-size:11px;color:var(--n400);margin-top:10px}
  .countdown strong{color:var(--s600)}
  
  .msg{padding:10px 13px;border-radius:var(--r4);font-family:var(--serif);font-size:12.5px;display:flex;align-items:flex-start;gap:8px;margin-bottom:13px;line-height:1.55}
  .msg-ok{background:var(--ok-lt);border:1px solid var(--ok-bd);color:var(--ok)}
  
  .tlink{background:none;border:none;font-family:var(--serif);color:var(--s600);font-size:12.5px;font-weight:600;padding:0;transition:color .14s;cursor:pointer}
  .tlink:hover{color:var(--s500)}

  @media(max-width:1100px){.auth-wrap{grid-template-columns:1fr}}
  @media(max-width:680px){.auth-form-area{padding:24px 18px}}
`;

export default function VerifyPage({ setPage }: PageProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [secs, setSecs] = useState(300);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const onDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...code];
    n[i] = v.slice(-1);
    setCode(n);
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const verify = () => {
    if (code.join("").length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  };

  return (
    <div className="auth-wrap page">
      <style>{CSS}</style>
      <AuthSide
        heading='Verify your<br/><em>Email</em>'
        sub="A 6-digit code has been sent to your email. Enter it below to activate your account."
        points={[
          ["Check your inbox", "6-digit code sent to your email"],
          ["Valid 5 minutes", "Request a new code if it expires"],
          ["Secure access", "Verified users only access the platform"],
        ]}
      />
      <div className="auth-form-area">
        <div className="auth-box">
          {!done ? (
            <>
              <div className="verify-box">📬</div>
              <h2 className="auth-title" style={{ textAlign: "center" }}>
                Verification code
              </h2>
              <p className="auth-sub" style={{ textAlign: "center" }}>
                Enter the 6-digit code sent to your email
              </p>
              <div className="step-dots">
                <div className="sdot done">✓</div>
                <div className="sline done" />
                <div className="sdot active">2</div>
                <div className="sline" />
                <div className="sdot idle">3</div>
              </div>
              <div className="slbls">
                <span style={{ color: "var(--ok)" }}>Account</span>
                <span style={{ color: "var(--s600)" }}>Verify</span>
                <span>Access</span>
              </div>
              <div className="otp-wrap">
                {code.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    className={`otp-cell${d ? " filled" : ""}`}
                    maxLength={1}
                    value={d}
                    onChange={(e) => onDigit(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)}
                    inputMode="numeric"
                  />
                ))}
              </div>
              <button className="btn-sub" onClick={verify} disabled={loading || code.join("").length < 6}>
                {loading ? (
                  <>
                    <div className="spinner" />
                    Verifying…
                  </>
                ) : (
                  "Verify & access platform →"
                )}
              </button>
              <div className="countdown">
                {secs > 0 ? (
                  <>
                    Expires in <strong>{fmt(secs)}</strong>
                  </>
                ) : (
                  <>
                    Code expired.{" "}
                    <button className="tlink" onClick={() => setSecs(300)}>
                      Resend
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="verify-box ok">✅</div>
              <h2 className="auth-title" style={{ textAlign: "center" }}>
                Email verified
              </h2>
              <p className="auth-sub" style={{ textAlign: "center" }}>
                Your account is active. Welcome to the Rwanda Resilience Hub.
              </p>
              <div className="msg msg-ok">
                ✓ You now have access to live flood risk data and alerts.
              </div>
              <button className="btn-sub" onClick={() => setPage("dashboard")}>
                Go to dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
