import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthSide } from "../components/shared";

const CSS = `
  .auth-wrap{min-height:100vh;display:grid;grid-template-columns:45fr 55fr;background:var(--s900)}
  .auth-form-area{display:flex;align-items:center;justify-content:center;padding:36px;background:var(--n50)}
  .auth-box{width:100%;max-width:390px}
  .auth-back{display:inline-flex;align-items:center;gap:5px;font-family:var(--serif);font-size:12px;color:var(--n500);background:none;border:none;padding:0;margin-bottom:20px;transition:color .14s;cursor:pointer}
  .auth-back:hover{color:var(--a400)}
  .auth-title{font-family:var(--serif);font-size:21px;font-weight:700;color:var(--n900);margin-bottom:4px;letter-spacing:-.01em}
  .auth-sub{font-size:13px;color:var(--n500);margin-bottom:20px;line-height:1.55}
  
  .field{margin-bottom:15px}
  .field-lbl{display:block;font-family:var(--mono);font-size:10px;font-weight:500;color:var(--n600);margin-bottom:5px;letter-spacing:.05em;text-transform:uppercase}
  .field-wrap{position:relative}
  .field-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--n400);pointer-events:none}
  .field-in{width:100%;padding:9px 12px;background:#fff;color:var(--n900);border:1px solid var(--n200);border-radius:var(--r4);font-family:var(--serif);font-size:13.5px;outline:none;transition:all .17s}
  .field-in.ico{padding-left:35px}
  .field-in:focus{border-color:var(--a300);box-shadow:0 0 0 3px rgba(249,115,22,.12)}
  .field-in::placeholder{color:var(--n300)}
  .btn-sub{width:100%;padding:11px;border:none;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:13.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.28);cursor:pointer}
  .btn-sub:hover:not(:disabled){background:var(--a400)}
  .btn-sub:disabled{background:var(--n300);cursor:not-allowed;box-shadow:none}
  .verify-box{width:56px;height:56px;border-radius:var(--r6);background:var(--s50);border:1px solid var(--s200);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px}
  .msg{padding:10px 13px;border-radius:var(--r4);font-family:var(--serif);font-size:12.5px;display:flex;align-items:flex-start;gap:8px;margin-bottom:13px;line-height:1.55}
  .msg-ok{background:var(--ok-lt);border:1px solid var(--ok-bd);color:var(--ok)}
  .tlink{background:none;border:none;font-family:var(--serif);color:var(--s600);font-size:12.5px;font-weight:600;padding:0;transition:color .14s;cursor:pointer}
  .tlink:hover{color:var(--s500)}
  .form-switch{margin-top:16px;text-align:center;font-family:var(--serif);font-size:13px;color:var(--n500)}

  @media(max-width:1100px){.auth-wrap{grid-template-columns:1fr}}
  @media(max-width:680px){.auth-form-area{padding:24px 18px}}
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const send = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1400);
  };

  return (
    <div className="auth-wrap page">
      <style>{CSS}</style>
      <AuthSide
        heading='Password<br/><em>Recovery</em>'
        sub="Enter your email and we'll send you a secure link to reset your password."
        points={[
          ["Secure reset link", "One-time link valid for 30 minutes"],
          ["Quick delivery", "Email arrives within 60 seconds"],
          ["Activity logged", "All resets are recorded for security"],
        ]}
      />
      <div className="auth-form-area">
        <div className="auth-box">
          <button className="auth-back" onClick={() => navigate("/login")}>
            ← Back to sign in
          </button>
          {step === 1 ? (
            <>
              <h2 className="auth-title">Reset password</h2>
              <p className="auth-sub">Enter your email to receive a recovery link</p>
              <div className="field">
                <label className="field-lbl">Email address</label>
                <div className="field-wrap">
                  <span className="field-ico">✉</span>
                  <input
                    className="field-in ico"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn-sub" onClick={send} disabled={loading || !email}>
                {loading ? (
                  <>
                    <div className="spinner" />
                    Sending…
                  </>
                ) : (
                  "Send recovery link →"
                )}
              </button>
            </>
          ) : (
            <>
              <div className="verify-box">📧</div>
              <h2 className="auth-title" style={{ textAlign: "center" }}>
                Check your inbox
              </h2>
              <p className="auth-sub" style={{ textAlign: "center" }}>
                Recovery link sent to
                <br />
                <strong style={{ color: "var(--s600)" }}>{email}</strong>
              </p>
              <div className="msg msg-ok">✓ Link valid for 30 minutes. Check spam if needed.</div>
              <button className="btn-sub" onClick={() => navigate("/login")}>
                Return to sign in →
              </button>
              <div className="form-switch" style={{ marginTop: 12 }}>
                Didn't receive it?{" "}
                <button
                  className="tlink"
                  onClick={() => {
                    setStep(1);
                    setEmail("");
                  }}
                >
                  Try again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
