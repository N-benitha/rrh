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
  .form-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}
  .chk-row{display:flex;align-items:center;gap:6px}
  .chk-row input{accent-color:var(--s600);width:13px;height:13px}
  .chk-row label{font-family:var(--serif);font-size:12.5px;color:var(--n600)}
  .tlink{background:none;border:none;font-family:var(--serif);color:var(--s600);font-size:12.5px;font-weight:600;padding:0;transition:color .14s;cursor:pointer}
  .tlink:hover{color:var(--s500)}
  .btn-sub{width:100%;padding:11px;border:none;border-radius:var(--r4);background:var(--a300);color:#fff;font-family:var(--serif);font-size:13.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(249,115,22,.28);cursor:pointer}
  .btn-sub:hover:not(:disabled){background:var(--a400)}
  .btn-sub:disabled{background:var(--n300);cursor:not-allowed;box-shadow:none}
  .form-div{display:flex;align-items:center;gap:9px;margin:13px 0;font-family:var(--mono);font-size:10px;color:var(--n300)}
  .form-div::before,.form-div::after{content:'';flex:1;height:1px;background:var(--n200)}
  .btn-google{width:100%;padding:9px;background:#fff;color:var(--n700);border:1px solid var(--n200);border-radius:var(--r4);font-family:var(--serif);font-size:13.5px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .17s;cursor:pointer}
  .btn-google:hover{border-color:var(--s300);background:var(--s50)}
  .form-switch{margin-top:16px;text-align:center;font-family:var(--serif);font-size:13px;color:var(--n500)}
  
  .msg{padding:10px 13px;border-radius:var(--r4);font-family:var(--serif);font-size:12.5px;display:flex;align-items:flex-start;gap:8px;margin-bottom:13px;line-height:1.55}
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
          <button className="auth-back" onClick={() => setPage("landing")}>
            ← Back to home
          </button>
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
                type="password"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
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
          <button className="btn-google">
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-3.59-13.46-8.71l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>
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
