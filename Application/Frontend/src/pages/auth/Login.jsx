import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  forgotPassword,
  resetPassword,
  signIn,
  verifyOtp,
} from "../../Api/Auth_Api.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotForm, setForgotForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn(form.email, form.password);
      toast.success(`Welcome back, ${result.Name || ""}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function openForgotPassword() {
    setForgotForm((prev) => ({ ...prev, email: form.email || prev.email }));
    setForgotStep("email");
    setResetToken("");
    setForgotOpen(true);
  }

  function closeForgotPassword() {
    setForgotOpen(false);
    setForgotStep("email");
    setResetToken("");
    setForgotForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    if (!forgotForm.email.trim()) return toast.error("Please enter Email");
    try {
      const result = await forgotPassword(forgotForm.email.trim());
      toast.success(result.message || "OTP Sent!");
      setForgotStep("otp");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    if (!forgotForm.otp.trim()) return toast.error("Please Enter OTP");
    try {
      const result = await verifyOtp(
        forgotForm.email.trim(),
        forgotForm.otp.trim()
      );
      setResetToken(result.resetToken);
      toast.success(result.message || "OTP verified!");
      setForgotStep("reset");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    if (!forgotForm.newPassword.trim()) return toast.error("Enter new password");
    if (forgotForm.newPassword !== forgotForm.confirmPassword)
      return toast.error("Passwords do not match!");
    try {
      const result = await resetPassword(resetToken, forgotForm.newPassword.trim());
      toast.success(result.message || "Password reset successfully!");
      closeForgotPassword();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="signin-container">
      <div className="card signin-card">
        <div className="signin-logo">
  <div style={{
    width:60, height:60, borderRadius:'50%', margin:'0 auto 0.5rem',
    background:'linear-gradient(135deg,#667eea,#764ba2)',
    display:'flex', alignItems:'center', justifyContent:'center'
  }}>
    <span style={{color:'white', fontSize:'1.5rem', fontWeight:'bold'}}>S</span>
  </div>
</div>
        <h4 className="mb-1 text-center signin-title">Welcome Back</h4>
        <p className="text-center signin-subtitle mb-4">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
          <div className="text-center">
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0"
              onClick={openForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="forgot-modal-backdrop">
          <div className="card forgot-modal-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Reset Password</h5>
              <button type="button" className="btn btn-sm btn-light" onClick={closeForgotPassword}>
                ×
              </button>
            </div>

            {forgotStep === "email" && (
              <form onSubmit={handleSendOtp}>
                <div className="mb-3">
                  <label className="form-label">Registered Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Enter registered email"
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100">Send OTP</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={closeForgotPassword}>Cancel</button>
                </div>
              </form>
            )}

            {forgotStep === "otp" && (
              <form onSubmit={handleVerifyOtp}>
                <div className="mb-3">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    value={forgotForm.otp}
                    onChange={(e) => setForgotForm((p) => ({ ...p, otp: e.target.value }))}
                    placeholder="6-digit OTP"
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100">Verify OTP</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setForgotStep("email")}>Back</button>
                </div>
              </form>
            )}

            {forgotStep === "reset" && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={forgotForm.newPassword}
                    onChange={(e) => setForgotForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password (min 6 chars)"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={forgotForm.confirmPassword}
                    onChange={(e) => setForgotForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100">Update Password</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={closeForgotPassword}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
  .signin-container { 
    display:flex; justify-content:center; align-items:center; 
    min-height:100vh; 
    background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%); 
  }
  .signin-card { 
    width:100%; max-width:420px; 
    padding:2.5rem; 
    border-radius:1.25rem; 
    background:rgba(255,255,255,0.97); 
    box-shadow:0 25px 50px rgba(0,0,0,0.4); 
    animation:slideUp 0.5s ease-out;
    margin: 1rem;
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .signin-title { font-weight:700; color:#1a1a2e; }
  .signin-subtitle { color:#888; font-size:0.9rem; }
  .form-control { 
    width:100%;
    border-radius:0.6rem; border:1.5px solid #e2e8f0; 
    padding:0.65rem 0.9rem; transition:border-color 0.2s; 
  }
  .form-control:focus { border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,0.15); outline:none; }
  .btn-primary { 
    width:100%;
    background:linear-gradient(90deg,#667eea,#764ba2); border:none; 
    border-radius:0.6rem; padding:0.7rem; font-weight:600; color:white; cursor:pointer;
  }
  .btn-primary:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); }
  .btn-link { color:#667eea; font-size:0.875rem; background:none; border:none; cursor:pointer; }
  .forgot-modal-backdrop { 
    position:fixed; inset:0; background:rgba(0,0,0,0.55); 
    display:flex; align-items:center; justify-content:center; z-index:1050; padding:1rem;
  }
  .forgot-modal-card { 
    width:100%; max-width:420px; padding:1.75rem; 
    border-radius:1rem; background:#fff; 
    box-shadow:0 20px 40px rgba(0,0,0,0.25); 
  }
  .mb-1{margin-bottom:0.25rem} .mb-3{margin-bottom:1rem} .mb-4{margin-bottom:1.5rem}
  .mt-3{margin-top:1rem} .me-2{margin-right:0.5rem} .p-0{padding:0}
  .text-center{text-align:center} .w-100{width:100%}
  .d-flex{display:flex} .gap-2{gap:0.5rem}
  .form-label{display:block; margin-bottom:0.4rem; font-size:0.875rem; font-weight:500; color:#374151;}
  .btn-outline-secondary{background:none; border:1.5px solid #ccc; border-radius:0.6rem; padding:0.65rem 1rem; cursor:pointer;}
  .btn-outline-secondary:hover{background:#f3f4f6;}
  .spinner-border{display:inline-block; width:1rem; height:1rem; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:spin 0.75s linear infinite;}
  .spinner-border-sm{width:0.8rem; height:0.8rem;}
  @keyframes spin{to{transform:rotate(360deg)}}
`}</style>
    </div>
  );
}