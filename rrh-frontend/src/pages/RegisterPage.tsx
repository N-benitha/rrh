import { useState } from "react";
import { AuthSide } from "../components/shared";
import { apiService } from "../services/api";
import type { PageProps } from "../types";

const CSS = `
  .auth-wrap{min-height:100vh;padding-top:58px;display:grid;grid-template-columns:45fr 55fr;background:var(--s900)}
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
  .field-in.ico{padding-left:35px}
  .field-in:focus{border-color:var(--a300);box-shadow:0 0 0 3px rgba(249,115,22,.12)}
  .field-in::placeholder{color:var(--n300)}
  select.field-in{cursor:pointer}
  .chk-row{display:flex;align-items:center;gap:6px}
  .chk-row input{accent-color:var(--s600);width:14px;height:14px}
  .chk-row label{font-family:var(--serif);font-size:14px;color:var(--n600)}
  .tlink{background:none;border:none;font-family:var(--serif);color:var(--s600);font-size:14px;font-weight:600;padding:0;transition:color .14s;cursor:pointer}
  .tlink:hover{color:var(--s500)}
  .btn-sub{width:100%;padding:13px;border:none;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.28);cursor:pointer}
  .btn-sub:hover:not(:disabled){background:var(--a400)}
  .btn-sub:disabled{background:var(--n300);cursor:not-allowed;box-shadow:none}
  .form-switch{margin-top:16px;text-align:center;font-family:var(--serif);font-size:14px;color:var(--n500)}

  .msg{padding:11px 14px;border-radius:var(--r4);font-family:var(--serif);font-size:14px;display:flex;align-items:flex-start;gap:8px;margin-bottom:13px;line-height:1.55}
  .msg-err{background:var(--err-lt);border:1px solid var(--err-bd);color:var(--err)}
  .msg-ok{background:var(--ok-lt);border:1px solid var(--ok-bd);color:var(--ok)}
  .msg-info{background:var(--info-lt);border:1px solid var(--info-bd);color:var(--info)}

  @media(max-width:1100px){.auth-wrap{grid-template-columns:1fr}}
  @media(max-width:680px){.auth-form-area{padding:24px 18px}}
`;

export default function RegisterPage({ setPage }: PageProps) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!email || !password || !acceptTerms) {
      setErr("Please fill in all required fields and accept the terms.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const full_name = `${firstName} ${lastName}`.trim() || email.split("@")[0];
      const response = await apiService.register(email, password, full_name, institution || "");
      if (response.access_token) {
        apiService.setAuthToken(response.access_token);
        // Store email for verify page, then send OTP
        localStorage.setItem("rrh_pending_email", email);
        await apiService.sendVerification(email).catch(() => {});
        setPage("verify");
      } else {
        setErr(response.detail || "Registration failed. Please try again.");
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap page">
      <style>{CSS}</style>
      <AuthSide
        heading='Join the<br/><em>Platform</em>'
        sub="Create an account to receive real-time flood alerts and risk information for your area across Rwanda."
        points={[
          ["Real-time alerts", "Live flood notifications from 3 IoT sensor stations"],
          ["ML risk scores", "Random Forest predictions at 91.4% accuracy"],
          ["Early warnings", "Be notified before flooding reaches Rubavu District"],
          ["Sebeya focus", "SEBY-DS-03 · SEBY-MS-02 · SEBY-US-01 stations"],
        ]}
      />
      <div className="auth-form-area">
        <div className="auth-box">

          <h2 className="auth-title">Create account</h2>
          <p className="auth-sub">Sign up to receive flood alerts for your area</p>
          {err && <div className="msg msg-err">⚠ {err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field">
              <label className="field-lbl">First name</label>
              <input className="field-in" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-lbl">Last name</label>
              <input className="field-in" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label className="field-lbl">Email address</label>
            <div className="field-wrap">
              <span className="field-ico">✉</span>
              <input className="field-in ico" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label className="field-lbl">Institution / Organization <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11, color: "var(--n400)" }}>(optional)</span></label>
            <input className="field-in" type="text" placeholder="e.g. University of Rwanda" value={institution} onChange={(e) => setInstitution(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-lbl">Password</label>
            <div className="field-wrap">
              <span className="field-ico">🔒</span>
              <input
                className="field-in ico"
                type={showPw ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--n400)", lineHeight:1, padding:"2px" }}
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="chk-row" style={{ marginBottom: 14 }}>
            <input type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <label htmlFor="terms" style={{ fontFamily: "var(--serif)", fontSize: 12.5, color: "var(--n600)" }}>
              I agree to the <button className="tlink">Terms of Use</button> and{" "}
              <button className="tlink">Privacy Policy</button>
            </label>
          </div>
          <button className="btn-sub" onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" />
                Creating account…
              </>
            ) : (
              "Create account & verify email →"
            )}
          </button>
          <div className="form-switch">
            Already registered?{" "}
            <button className="tlink" style={{ fontWeight: 700 }} onClick={() => setPage("login")}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
