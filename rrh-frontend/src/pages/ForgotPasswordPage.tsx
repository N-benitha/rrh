import { useState } from "react";
import { AuthSide } from "../components/shared";
import { apiService } from "../services/api";
import type { PageProps } from "../types";

const CSS = `
  .auth-wrap{min-height:100vh;display:grid;grid-template-columns:45fr 55fr;background:var(--s900)}
  .auth-form-area{display:flex;align-items:center;justify-content:center;padding:36px;background:var(--n50)}
  .auth-box{width:100%;max-width:390px}
  .auth-back{display:inline-flex;align-items:center;gap:5px;font-family:var(--serif);font-size:12px;color:var(--n500);background:none;border:none;padding:0;margin-bottom:20px;transition:color .14s;cursor:pointer}
  .auth-back:hover{color:var(--a400)}
  .auth-title{font-family:var(--serif);font-size:26px;font-weight:700;color:var(--n900);margin-bottom:4px;letter-spacing:-.01em}
  .auth-sub{font-size:15px;color:var(--n500);margin-bottom:20px;line-height:1.55}
  .field{margin-bottom:15px}
  .field-lbl{display:block;font-family:var(--mono);font-size:11px;font-weight:500;color:var(--n600);margin-bottom:5px;letter-spacing:.05em;text-transform:uppercase}
  .field-wrap{position:relative}
  .field-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--n400);pointer-events:none}
  .field-in{width:100%;padding:11px 14px;background:#fff;color:var(--n900);border:1px solid var(--n200);border-radius:var(--r4);font-family:var(--serif);font-size:15px;outline:none;transition:all .17s}
  .field-in.ico{padding-left:38px}
  .field-in:focus{border-color:var(--a300);box-shadow:0 0 0 3px rgba(249,115,22,.12)}
  .field-in::placeholder{color:var(--n300)}
  .btn-sub{width:100%;padding:13px;border:none;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.28);cursor:pointer}
  .btn-sub:hover:not(:disabled){background:var(--a400)}
  .btn-sub:disabled{background:var(--n300);cursor:not-allowed;box-shadow:none}
  .verify-box{width:56px;height:56px;border-radius:var(--r6);background:var(--s50);border:1px solid var(--s200);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px}
  .verify-box.ok{background:var(--ok-lt);border-color:var(--ok-bd)}
  .otp-wrap{display:flex;gap:8px;justify-content:center;margin:18px 0}
  .otp-cell{width:46px;height:52px;border-radius:var(--r4);background:#fff;border:2px solid var(--n400);text-align:center;font-family:var(--serif);font-size:20px;font-weight:700;color:var(--s700);outline:none;transition:all .17s;cursor:text;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  .otp-cell:focus{border-color:var(--s600);box-shadow:0 0 0 3px rgba(58,85,112,.15)}
  .otp-cell.filled{background:var(--s50);border-color:var(--s600)}
  .msg{padding:11px 14px;border-radius:var(--r4);font-family:var(--serif);font-size:14px;display:flex;align-items:flex-start;gap:8px;margin-bottom:13px;line-height:1.55}
  .msg-err{background:var(--err-lt);border:1px solid var(--err-bd);color:var(--err)}
  .msg-ok{background:var(--ok-lt);border:1px solid var(--ok-bd);color:var(--ok)}
  .tlink{background:none;border:none;font-family:var(--serif);color:var(--s600);font-size:14px;font-weight:600;padding:0;transition:color .14s;cursor:pointer}
  .tlink:hover{color:var(--s500)}
  .countdown{text-align:center;font-family:var(--mono);font-size:13px;color:var(--n400);margin-top:10px}
  .countdown strong{color:var(--s600)}
  .step-row{display:flex;align-items:center;gap:8px;margin-bottom:20px}
  .step-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
  .step-active{background:var(--s600);color:#fff}
  .step-done{background:var(--ok);color:#fff}
  .step-idle{background:var(--n100);color:var(--n400);border:1px solid var(--n200)}
  .step-line{flex:1;height:1px;background:var(--n200)}
  .step-line.done{background:var(--ok)}
  @media(max-width:1100px){.auth-wrap{grid-template-columns:1fr}}
  @media(max-width:680px){.auth-form-area{padding:24px 18px}}
`;

export default function ForgotPasswordPage({ setPage }: PageProps) {
  const [step, setStep]         = useState<1 | 2 | 3>(1);
  const [email, setEmail]       = useState("");
  const [code, setCode]         = useState(["", "", "", "", "", ""]);
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");
  const [secs, setSecs]         = useState(0);

  const startTimer = () => {
    setSecs(300);
    const t = setInterval(() => setSecs((s) => {
      if (s <= 1) { clearInterval(t); return 0; }
      return s - 1;
    }), 1000);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const sendCode = async () => {
    if (!email) return;
    setErr(""); setLoading(true);
    try {
      await apiService.sendVerification(email);
      startTimer();
      setStep(2);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send code. Please try again.");
    } finally { setLoading(false); }
  };

  const onDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...code]; n[i] = v.slice(-1); setCode(n);
    if (v && i < 5) document.getElementById(`fp-otp-${i + 1}`)?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) document.getElementById(`fp-otp-${i - 1}`)?.focus();
  };

  const verifyCode = async () => {
    if (code.join("").length < 6) return;
    setErr(""); setLoading(true);
    try {
      await apiService.verifyEmail(email, code.join(""));
      setStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid code. Please try again.");
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (!newPw || newPw !== confirmPw) {
      setErr("Passwords do not match."); return;
    }
    if (newPw.length < 6) {
      setErr("Password must be at least 6 characters."); return;
    }
    setErr(""); setLoading(true);
    try {
      await apiService.resetPassword(email, code.join(""), newPw);
      setPage("login");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reset failed. Please start again.");
    } finally { setLoading(false); }
  };

  const Steps = () => (
    <div className="step-row">
      <div className={`step-num ${step > 1 ? "step-done" : "step-active"}`}>{step > 1 ? "✓" : "1"}</div>
      <div className={`step-line ${step > 1 ? "done" : ""}`} />
      <div className={`step-num ${step === 2 ? "step-active" : step > 2 ? "step-done" : "step-idle"}`}>{step > 2 ? "✓" : "2"}</div>
      <div className={`step-line ${step > 2 ? "done" : ""}`} />
      <div className={`step-num ${step === 3 ? "step-active" : "step-idle"}`}>3</div>
    </div>
  );

  return (
    <div className="auth-wrap page">
      <style>{CSS}</style>
      <AuthSide
        heading='Password<br/><em>Recovery</em>'
        sub="Enter your email, confirm the code we send you, then set a new password."
        points={[
          ["Step 1 — Email", "Enter your registered email address"],
          ["Step 2 — Verify", "Enter the 6-digit code sent to your inbox"],
          ["Step 3 — Reset", "Choose a strong new password"],
        ]}
      />
      <div className="auth-form-area">
        <div className="auth-box">
          <button className="auth-back" onClick={() => setPage("login")}>← Back to sign in</button>
          <Steps />

          {err && <div className="msg msg-err">⚠ {err}</div>}

          {step === 1 && (
            <>
              <h2 className="auth-title">Forgot password</h2>
              <p className="auth-sub">Enter your email and we'll send a 6-digit code</p>
              <div className="field">
                <label className="field-lbl">Email address</label>
                <div className="field-wrap">
                  <span className="field-ico">✉</span>
                  <input className="field-in ico" type="email" placeholder="your@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendCode()} />
                </div>
              </div>
              {email && (
                <p style={{ fontSize: 13, color: "var(--n500)", marginBottom: 12, textAlign: "center" }}>
                  Code will be sent to <strong style={{ color: "var(--s600)" }}>{email}</strong>
                </p>
              )}
              <button className="btn-sub" onClick={sendCode} disabled={loading || !email}>
                {loading ? <><div className="spinner" />Sending…</> : "Send verification code →"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="verify-box">📬</div>
              <h2 className="auth-title" style={{ textAlign: "center" }}>Enter the code</h2>
              <div style={{ background: "var(--s50)", border: "1px solid var(--s200)", borderRadius: 8, padding: "10px 16px", marginBottom: 16, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--n500)" }}>Code sent to</p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "var(--s700)" }}>{email}</p>
              </div>
              <div className="otp-wrap">
                {code.map((d, i) => (
                  <input key={i} id={`fp-otp-${i}`} className={`otp-cell${d ? " filled" : ""}`}
                    maxLength={1} value={d} inputMode="numeric"
                    onChange={(e) => onDigit(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)} />
                ))}
              </div>
              <button className="btn-sub" onClick={verifyCode} disabled={loading || code.join("").length < 6}>
                {loading ? <><div className="spinner" />Verifying…</> : "Verify code →"}
              </button>
              <div className="countdown" style={{ marginTop: 12 }}>
                {secs > 0 ? <>Expires in <strong>{fmt(secs)}</strong></> : "Code expired."}
                {" · "}
                <button className="tlink" onClick={sendCode}>Resend</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="verify-box">🔐</div>
              <h2 className="auth-title" style={{ textAlign: "center" }}>New password</h2>
              <p className="auth-sub" style={{ textAlign: "center" }}>Choose a strong password for your account</p>
              <div className="field">
                <label className="field-lbl">New password</label>
                <input className="field-in" type="password" placeholder="Min. 6 characters"
                  value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-lbl">Confirm password</label>
                <input className="field-in" type="password" placeholder="Repeat new password"
                  value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && resetPassword()} />
              </div>
              <button className="btn-sub" onClick={resetPassword}
                disabled={loading || !newPw || newPw !== confirmPw}>
                {loading ? <><div className="spinner" />Resetting…</> : "Reset password →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
