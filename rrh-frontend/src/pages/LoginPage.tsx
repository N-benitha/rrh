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
  .auth-title{font-family:var(--serif);font-size:26px;font-weight:700;color:var(--n900);margin-bottom:6px;letter-spacing:-.01em}
  .auth-sub{font-size:15px;color:var(--n500);margin-bottom:22px;line-height:1.6}

  .field{margin-bottom:18px}
  .field-lbl{display:block;font-family:var(--mono);font-size:11px;font-weight:500;color:var(--n600);margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase}
  .field-wrap{position:relative}
  .field-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--n400);pointer-events:none}
  .field-in{width:100%;padding:11px 14px;background:#fff;color:var(--n900);border:1px solid var(--n200);border-radius:var(--r4);font-family:var(--serif);font-size:15px;outline:none;transition:all .17s}
  .field-in.ico{padding-left:38px}
  .field-in:focus{border-color:var(--a300);box-shadow:0 0 0 3px rgba(249,115,22,.12)}
  .field-in::placeholder{color:var(--n300)}
  .form-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  .chk-row{display:flex;align-items:center;gap:7px}
  .chk-row input{accent-color:var(--s600);width:14px;height:14px}
  .chk-row label{font-family:var(--serif);font-size:14px;color:var(--n600)}
  .tlink{background:none;border:none;font-family:var(--serif);color:var(--s600);font-size:14px;font-weight:600;padding:0;transition:color .14s;cursor:pointer}
  .tlink:hover{color:var(--s500)}
  .btn-sub{width:100%;padding:13px;border:none;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.28);cursor:pointer}
  .btn-sub:hover:not(:disabled){background:var(--a400)}
  .btn-sub:disabled{background:var(--n300);cursor:not-allowed;box-shadow:none}
  .form-div{display:flex;align-items:center;gap:9px;margin:15px 0;font-family:var(--mono);font-size:11px;color:var(--n300)}
  .form-div::before,.form-div::after{content:'';flex:1;height:1px;background:var(--n200)}
  .btn-google{width:100%;padding:11px;background:#fff;color:var(--n700);border:1px solid var(--n200);border-radius:var(--r4);font-family:var(--serif);font-size:15px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .17s;cursor:pointer}
  .btn-google:hover{border-color:var(--s300);background:var(--s50)}
  .form-switch{margin-top:18px;text-align:center;font-family:var(--serif);font-size:14px;color:var(--n500)}

  .msg{padding:11px 14px;border-radius:var(--r4);font-family:var(--serif);font-size:14px;display:flex;align-items:flex-start;gap:8px;margin-bottom:15px;line-height:1.55}
  .msg-err{background:var(--err-lt);border:1px solid var(--err-bd);color:var(--err)}
  .msg-ok{background:var(--ok-lt);border:1px solid var(--ok-bd);color:var(--ok)}
  .msg-info{background:var(--info-lt);border:1px solid var(--info-bd);color:var(--info)}

  @media(max-width:1100px){.auth-wrap{grid-template-columns:1fr}}
  @media(max-width:680px){.auth-form-area{padding:24px 18px}}
`;

export default function LoginPage({ setPage }: PageProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!email || !pw) {
      setErr("Please fill in all fields.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const response = await apiService.login(email, pw);
      if (response.access_token) {
        apiService.setAuthToken(response.access_token);
        setPage("dashboard");
      } else {
        setErr(response.detail || "Login failed. Please try again.");
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
        heading='Welcome<br/><em>back</em>'
        sub="Sign in to access real-time flood risk data, alerts, and prediction maps for Rwanda's river basins."
        points={[
          ["Live flood alerts", "Updated every 15 min from sensor streams"],
          ["ML risk prediction", "91%+ accuracy on flood risk classification"],
          ["Instant notifications", "Alerts for at-risk zones across Rwanda"],
        ]}
      />
      <div className="auth-form-area">
        <div className="auth-box">

          <h2 className="auth-title">Sign in</h2>
          <p className="auth-sub">Access the RRH flood monitoring platform</p>
          {err && <div className="msg msg-err">⚠ {err}</div>}
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
          <div className="field">
            <label className="field-lbl">Password</label>
            <div className="field-wrap">
              <span className="field-ico">🔒</span>
              <input
                className="field-in ico"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
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
          <div className="form-row">
            <div className="chk-row">
              <input type="checkbox" id="rem" />
              <label htmlFor="rem">Remember me</label>
            </div>
            <button className="tlink" onClick={() => setPage("forgot")}>
              Forgot password?
            </button>
          </div>
          <button className="btn-sub" onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" />
                Signing in…
              </>
            ) : (
              "Sign in →"
            )}
          </button>
          <div className="form-div">or</div>
          <div className="form-switch">
            No account?{" "}
            <button className="tlink" style={{ fontWeight: 700 }} onClick={() => setPage("register")}>
              Get access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
