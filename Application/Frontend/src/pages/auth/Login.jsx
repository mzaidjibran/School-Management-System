import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  School,
  Loader2,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  Award,
  GraduationCap,
  Pencil,
  Ruler,
  Brain,
} from "lucide-react";
import {
  forgotPassword,
  resetPassword,
  signIn,
  verifyOtp,
  signUp,
  getPrincipals,
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
  const [showPassword, setShowPassword] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Developer Access States
  const [devAccessOpen, setDevAccessOpen] = useState(false);
  const [devVerified, setDevVerified] = useState(false);
  const [devLoginForm, setDevLoginForm] = useState({
    username: "",
    password: "",
  });
  const [principalForm, setPrincipalForm] = useState({
    Name: "",
    email: "",
    password: "",
  });
  const [principalsList, setPrincipalsList] = useState([]);
  const [devLoading, setDevLoading] = useState(false);

  function handleDevLoginChange(e) {
    setDevLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePrincipalChange(e) {
    setPrincipalForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function loadPrincipals() {
    try {
      const data = await getPrincipals();
      setPrincipalsList(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load principals list");
    }
  }

  async function handleDevLoginSubmit(e) {
    e.preventDefault();
    if (
      devLoginForm.username === "nullsatcksloutions@gmail.com" &&
      devLoginForm.password === "Nullstack@nN"
    ) {
      setDevVerified(true);
      toast.success("Developer credentials verified!");
      await loadPrincipals();
    } else {
      toast.error("Invalid developer credentials!");
    }
  }

  async function handleCreatePrincipalSubmit(e) {
    e.preventDefault();
    setDevLoading(true);
    try {
      await signUp({
        Name: principalForm.Name,
        email: principalForm.email,
        password: principalForm.password,
      });
      toast.success("Principal user account created successfully!");
      setPrincipalForm({ Name: "", email: "", password: "" });
      await loadPrincipals();
    } catch (err) {
      toast.error(err.message || "Failed to create principal account");
    } finally {
      setDevLoading(false);
    }
  }

  function openDevAccess() {
    setDevLoginForm({ username: "", password: "" });
    setPrincipalForm({ Name: "", email: "", password: "" });
    setDevVerified(false);
    setDevAccessOpen(true);
  }

  function closeDevAccess() {
    setDevAccessOpen(false);
    setDevVerified(false);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn(form.email, form.password);
      toast.success(`Welcome back, ${result.Name || ""}!`);
      if (result.role === "teacher" && result.assignedPages && result.assignedPages.length > 0) {
        navigate(`/${result.assignedPages[0]}`);
      } else {
        navigate("/");
      }
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
        forgotForm.otp.trim(),
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
    if (!forgotForm.newPassword.trim())
      return toast.error("Enter new password");
    if (forgotForm.newPassword !== forgotForm.confirmPassword)
      return toast.error("Passwords do not match!");
    try {
      const result = await resetPassword(
        resetToken,
        forgotForm.newPassword.trim(),
      );
      toast.success(result.message || "Password reset successfully!");
      closeForgotPassword();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function handleContainerMouseMove(e) {
    setSpotlight({ x: e.clientX, y: e.clientY });
  }

  return (
    <div className="signin-container" onMouseMove={handleContainerMouseMove}>
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="cursor-glow"
        style={{
          left: `${spotlight.x}px`,
          top: `${spotlight.y}px`,
        }}
      ></div>

      {/* Floating Academic Icons in Background */}
      <div className="floating-items-container">
        <div className="floating-item item-1">
          <GraduationCap size={28} />
        </div>
        <div className="floating-item item-2">
          <BookOpen size={24} />
        </div>
        <div className="floating-item item-3">
          <Pencil size={20} />
        </div>
        <div className="floating-item item-4">
          <School size={28} />
        </div>
        <div className="floating-item item-5">
          <Ruler size={22} />
        </div>
        <div className="floating-item item-6">
          <Award size={26} />
        </div>
        <div className="floating-item item-7">
          <Brain size={24} />
        </div>
        <div className="floating-item item-8">
          <BookOpen size={22} />
        </div>
        <div className="floating-item item-9">
          <GraduationCap size={22} />
        </div>
        <div className="floating-item item-10">
          <Pencil size={24} />
        </div>
      </div>

      <div className="signin-card">
        {/* TOP SECTION: Gradient header */}
        <div className="card-header-section">
          <div className="signin-logo">
            <div className="logo-ring">
              <div className="logo-orbit-dot"></div>
              <div className="logo-inner">
                <School className="logo-icon" size={24} />
              </div>
            </div>
          </div>
          <h2 className="header-title">Punjab Public High School</h2>
          <p className="header-subtitle">School Management System</p>
          <div className="badge-row">
            <span className="header-badge">Education</span>
            <span className="header-badge">Discipline</span>
            <span className="header-badge">Success</span>
          </div>
        </div>

        {/* BOTTOM SECTION: White body */}
        <div className="card-body-section">
          <h3 className="body-title">Welcome Back</h3>
          <p className="body-subtitle">Sign in to your school account</p>

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="form-group mb-3">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options mb-4">
              <label className="remember-me">
                <input type="checkbox" className="remember-checkbox" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="btn-link"
                onClick={openForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center">
                  <Loader2 className="spinner me-2" size={18} />
                  Signing in...
                </span>
              ) : (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  Sign In to Dashboard <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="secure-login-text">
            Secure login — Contact your administrator for access
          </p>

          <div className="dev-access-trigger-container">
            <button
              type="button"
              className="btn-dev-access"
              onClick={openDevAccess}
            >
              Developer Access
            </button>
          </div>

          <div className="footer-credit">
            <span>Developed by </span>
            <a
              href="https://nullstack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="developer-link"
            >
              Nullstack
            </a>
          </div>
        </div>
      </div>

      {/* Floating Brand Badge (Bottom Left) */}
      <div className="nullstack-float-badge">
        <div className="nullstack-badge-inner">N</div>
        <span className="nullstack-badge-text">nullstack</span>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="forgot-modal-backdrop">
          <div className="card forgot-modal-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="modal-title m-0">Reset Password</h5>
              <button
                type="button"
                className="btn-sm-close"
                onClick={closeForgotPassword}
              >
                <X size={16} />
              </button>
            </div>

            {forgotStep === "email" && (
              <form onSubmit={handleSendOtp} className="signin-form">
                <div className="form-group mb-4">
                  <label className="form-label">Registered Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      className="form-control modal-input"
                      value={forgotForm.email}
                      onChange={(e) =>
                        setForgotForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="Enter registered email"
                      required
                    />
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button type="submit" className="btn-primary w-100">
                    <span>Send OTP</span>
                  </button>
                  <button
                    type="button"
                    className="btn-outline-secondary w-100"
                    onClick={closeForgotPassword}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "otp" && (
              <form onSubmit={handleVerifyOtp} className="signin-form">
                <div className="form-group mb-4">
                  <label className="form-label">Enter OTP</label>
                  <div className="input-wrapper">
                    <ShieldAlert className="input-icon" size={18} />
                    <input
                      type="text"
                      className="form-control modal-input"
                      value={forgotForm.otp}
                      onChange={(e) =>
                        setForgotForm((p) => ({ ...p, otp: e.target.value }))
                      }
                      placeholder="6-digit OTP"
                      required
                    />
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button type="submit" className="btn-primary w-100">
                    <span>Verify OTP</span>
                  </button>
                  <button
                    type="button"
                    className="btn-outline-secondary w-100"
                    onClick={() => setForgotStep("email")}
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "reset" && (
              <form onSubmit={handleResetPassword} className="signin-form">
                <div className="form-group mb-4">
                  <label className="form-label">New Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="password"
                      className="form-control modal-input"
                      value={forgotForm.newPassword}
                      onChange={(e) =>
                        setForgotForm((p) => ({
                          ...p,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter new password (min 6 chars)"
                      required
                    />
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="password"
                      className="form-control modal-input"
                      value={forgotForm.confirmPassword}
                      onChange={(e) =>
                        setForgotForm((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button type="submit" className="btn-primary w-100">
                    <span>Update Password</span>
                  </button>
                  <button
                    type="button"
                    className="btn-outline-secondary w-100"
                    onClick={closeForgotPassword}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Developer Access Modal */}
      {devAccessOpen && (
        <div className="forgot-modal-backdrop">
          <div
            className={`card forgot-modal-card ${devVerified ? "dev-dashboard-modal" : ""}`}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="modal-title m-0">
                {devVerified ? "Developer Dashboard" : "Developer Verification"}
              </h5>
              <button
                type="button"
                className="btn-sm-close"
                onClick={closeDevAccess}
              >
                <X size={16} />
              </button>
            </div>

            {!devVerified ? (
              /* Verification Form */
              <form onSubmit={handleDevLoginSubmit} className="signin-form">
                <p className="body-subtitle mb-4" style={{ color: "#475569" }}>
                  Please verify your credentials to access developer utilities.
                </p>
                <div className="form-group mb-3">
                  <label className="form-label">Username</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      name="username"
                      type="text"
                      className="form-control modal-input"
                      value={devLoginForm.username}
                      onChange={handleDevLoginChange}
                      placeholder="Enter developer username"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      name="password"
                      type="password"
                      className="form-control modal-input"
                      value={devLoginForm.password}
                      onChange={handleDevLoginChange}
                      placeholder="Enter developer password"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button type="submit" className="btn-primary w-100">
                    <span>Verify Credentials</span>
                  </button>
                  <button
                    type="button"
                    className="btn-outline-secondary w-100"
                    onClick={closeDevAccess}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Unlocked Developer Dashboard: Dual-Column Layout */
              <div className="dev-panel-content">
                <div className="dev-panel-columns">
                  {/* Left Column: Create Principal */}
                  <div className="dev-panel-left">
                    <h6 className="dev-section-title">
                      Create Principal Account
                    </h6>
                    <form
                      onSubmit={handleCreatePrincipalSubmit}
                      className="signin-form"
                    >
                      <div className="form-group mb-3">
                        <label className="form-label">Principal Name</label>
                        <input
                          name="Name"
                          type="text"
                          className="form-control modal-input"
                          value={principalForm.Name}
                          onChange={handlePrincipalChange}
                          placeholder="e.g. Dr. John Doe"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="form-group mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                          name="email"
                          type="email"
                          className="form-control modal-input"
                          value={principalForm.email}
                          onChange={handlePrincipalChange}
                          placeholder="principal@school.com"
                          required
                        />
                      </div>
                      <div className="form-group mb-4">
                        <label className="form-label">Password</label>
                        <input
                          name="password"
                          type="password"
                          className="form-control modal-input"
                          value={principalForm.password}
                          onChange={handlePrincipalChange}
                          placeholder="Min 6 characters"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn-primary w-100"
                        disabled={devLoading}
                      >
                        {devLoading ? (
                          <span className="d-flex align-items-center justify-content-center">
                            <Loader2 className="spinner me-2" size={18} />
                            Creating...
                          </span>
                        ) : (
                          "Create Principal Account"
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Principals List */}
                  <div className="dev-panel-right">
                    <h6 className="dev-section-title">Registered Principals</h6>
                    <div className="principals-list-container">
                      {principalsList.length === 0 ? (
                        <div className="empty-list-text">
                          No Principal accounts registered yet.
                        </div>
                      ) : (
                        principalsList.map((p, idx) => (
                          <div className="principal-item" key={p._id || idx}>
                            <div className="principal-avatar">
                              {p.Name ? p.Name.charAt(0).toUpperCase() : "P"}
                            </div>
                            <div className="principal-info">
                              <div className="principal-name">{p.Name}</div>
                              <div className="principal-email">{p.email}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* Google Font Import */
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .signin-container { 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          background-color: #0c0a21;
          background-image: radial-gradient(circle at 50% 50%, #1e1945 0%, #0c0a21 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Mouse cursor spotlight glow */
        .cursor-glow {
          position: fixed;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(217, 70, 239, 0.03) 50%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
          mix-blend-mode: screen;
        }

        /* Floating background items */
        .floating-items-container {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .floating-item {
          position: absolute;
          bottom: -50px;
          color: rgba(99, 102, 241, 0.15);
          animation: rise 25s linear infinite;
          opacity: 0;
        }
        
        .item-1 { left: 8%; animation-delay: 0s; animation-duration: 22s; }
        .item-2 { left: 22%; animation-delay: 4s; animation-duration: 28s; }
        .item-3 { left: 35%; animation-delay: 9s; animation-duration: 20s; }
        .item-4 { left: 50%; animation-delay: 2s; animation-duration: 32s; }
        .item-5 { left: 65%; animation-delay: 12s; animation-duration: 24s; }
        .item-6 { left: 78%; animation-delay: 6s; animation-duration: 30s; }
        .item-7 { left: 90%; animation-delay: 15s; animation-duration: 26s; }
        .item-8 { left: 15%; animation-delay: 14s; animation-duration: 25s; }
        .item-9 { left: 42%; animation-delay: 18s; animation-duration: 27s; }
        .item-10 { left: 70%; animation-delay: 21s; animation-duration: 23s; }

        @keyframes rise {
          0% {
            transform: translateY(110vh) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.15;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-10vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }

        /* Dual-Section Login Card */
        .signin-card { 
          width: 100%; 
          max-width: 420px; 
          border-radius: 2rem; 
          background: #ffffff; 
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5); 
          z-index: 10;
          margin: 1.5rem;
          position: relative;
          overflow: hidden;
          animation: entrySlide 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes entrySlide {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* CARD HEADER (Gradient) */
        .card-header-section {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 2.5rem 2rem 2rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: #ffffff;
          position: relative;
        }
        .card-header-section::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Logo Ring and Icon */
        .signin-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .logo-ring {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 3px;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoGlow 4s ease-in-out infinite alternate;
          position: relative;
        }
        .logo-orbit-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 8px #ffffff, 0 0 15px #6366f1;
          top: -3px;
          left: calc(50% - 3px);
          transform-origin: 3px 36px;
          animation: orbit 4s linear infinite;
          z-index: 5;
        }
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes logoGlow {
          0% { border-color: rgba(255, 255, 255, 0.35); box-shadow: 0 0 10px rgba(255, 255, 255, 0.1); }
          100% { border-color: rgba(255, 255, 255, 0.7); box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
        }
        .logo-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-icon {
          color: #ffffff;
        }

        /* School Details */
        .header-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .header-subtitle {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.75);
          margin: 0 0 1.25rem 0;
          font-weight: 400;
        }

        /* Badge Row */
        .badge-row {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        .header-badge {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 0.25rem 0.65rem;
          border-radius: 2rem;
          font-size: 0.675rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* CARD BODY (White Form) */
        .card-body-section {
          background: #ffffff;
          padding: 2.25rem 2.25rem 2rem 2.25rem;
        }
        .body-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }
        .body-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0 0 1.75rem 0;
        }

        /* Form styling */
        .signin-form {
          display: flex;
          flex-direction: column;
        }
        .form-label {
          display: block; 
          margin-bottom: 0.4rem; 
          font-size: 0.825rem; 
          font-weight: 600; 
          color: #475569;
          letter-spacing: 0.01em;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.2s;
        }
        .form-control { 
          width: 100%;
          border-radius: 0.75rem; 
          border: 1.5px solid #e2e8f0; 
          background: #f8fafc;
          padding: 0.7rem 1rem 0.7rem 2.6rem; 
          color: #0f172a;
          font-size: 0.925rem;
          transition: all 0.25s ease; 
        }
        .form-control::placeholder {
          color: #94a3b8;
        }
        .form-control:focus { 
          border-color: #4f46e5; 
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); 
          background: #ffffff;
          outline: none; 
        }
        .form-control:focus ~ .input-icon {
          color: #4f46e5;
        }

        /* Password Toggle */
        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .password-toggle:hover {
          color: #475569;
        }

        /* Form Options (Remember Me & Forgot Link) */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
          user-select: none;
        }
        .remember-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #4f46e5;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-link { 
          color: #4f46e5; 
          font-size: 0.85rem; 
          font-weight: 600;
          background: none; 
          border: none; 
          cursor: pointer; 
          transition: color 0.2s;
          padding: 0;
        }
        .btn-link:hover { 
          color: #3730a3; 
        }

        /* Primary Sign-In Button */
        .btn-primary { 
          width: 100%;
          background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%); 
          border: none; 
          border-radius: 0.75rem; 
          padding: 0.8rem; 
          font-weight: 600; 
          color: #ffffff; 
          cursor: pointer;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
          transition: all 0.25s ease;
        }
        .btn-primary:hover:not(:disabled) { 
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Bottom Text Details */
        .secure-login-text {
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .footer-credit {
          text-align: center;
          font-size: 0.775rem;
          color: #94a3b8;
        }
        .developer-link {
          font-weight: 700;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .developer-link:hover {
          color: #4f46e5;
        }

        /* nullstack Floating Brand Badge (Bottom-Left) */
        .nullstack-float-badge {
          position: fixed;
          bottom: 1.5rem;
          left: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          z-index: 20;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .nullstack-float-badge:hover {
          background: rgba(0, 0, 0, 0.85);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.25);
        }
        .nullstack-badge-inner {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.725rem;
        }
        .nullstack-badge-text {
          letter-spacing: 0.02em;
        }

        /* Modals */
        .forgot-modal-backdrop { 
          position: fixed; 
          inset: 0; 
          background: rgba(12, 10, 33, 0.75); 
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 1050; 
          padding: 1rem;
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .forgot-modal-card { 
          width: 100%; 
          max-width: 400px; 
          padding: 2rem; 
          border-radius: 1.5rem; 
          background: #ffffff; 
          border: 1px solid #e2e8f0; 
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2); 
          color: #1e293b;
          animation: modalEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes modalEntrance {
          0% { transform: scale(0.93) translateY(15px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
        }

        .btn-sm-close {
          background: #f1f5f9;
          border: none;
          color: #64748b;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-sm-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .modal-input {
          background: #f8fafc !important;
          border: 1.5px solid #e2e8f0 !important;
          color: #0f172a !important;
        }
        .modal-input:focus {
          border-color: #4f46e5 !important;
          background: #ffffff !important;
        }

        .btn-outline-secondary {
          background: #ffffff; 
          border: 1.5px solid #cbd5e1; 
          border-radius: 0.75rem; 
          padding: 0.8rem; 
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline-secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        /* Spacing and Utilities */
        .mb-3 { margin-bottom: 0.85rem; }
        .mb-4 { margin-bottom: 1.25rem; }
        .m-0 { margin: 0; }
        .w-100 { width: 100%; }
        .d-flex { display: flex; }
        .gap-3 { gap: 0.75rem; }
        .justify-content-between { justify-content: space-between; }
        .justify-content-center { justify-content: center; }
        .align-items-center { align-items: center; }

        /* Developer Access Panel Styles */
        .dev-access-trigger-container {
          display: flex;
          justify-content: center;
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .btn-dev-access {
          background: none;
          border: none;
          color: #4f46e5;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .btn-dev-access:hover {
          color: #3730a3;
          text-shadow: 0 0 8px rgba(79, 70, 229, 0.15);
        }
        .dev-dashboard-modal {
          max-width: 720px !important;
          width: 100%;
        }
        .dev-panel-content {
          margin-top: 1rem;
        }
        .dev-panel-columns {
          display: flex;
          gap: 2rem;
          flex-direction: row;
        }
        .dev-panel-left {
          flex: 1;
        }
        .dev-panel-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #cbd5e1;
          padding-left: 2rem;
        }
        .dev-section-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1.5px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }
        
        .principals-list-container {
          max-height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-right: 0.5rem;
        }
        .principals-list-container::-webkit-scrollbar {
          width: 6px;
        }
        .principals-list-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .principals-list-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .principals-list-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .principal-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.8rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .principal-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .principal-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #4f46e5;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .principal-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .principal-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }
        .principal-email {
          font-size: 0.75rem;
          color: #64748b;
        }
        .empty-list-text {
          font-size: 0.85rem;
          color: #94a3b8;
          text-align: center;
          padding: 2rem 0;
        }
        
        @media (max-width: 680px) {
          .dev-panel-columns {
            flex-direction: column;
            gap: 1.5rem;
          }
          .dev-panel-right {
            border-left: none;
            border-top: 1px solid #cbd5e1;
            padding-left: 0;
            padding-top: 1.5rem;
          }
          .dev-dashboard-modal {
            max-width: 400px !important;
          }
        }
        @media (max-width: 480px) {
          .signin-card {
            margin: 0.75rem;
            border-radius: 1.5rem;
          }
          .card-header-section {
            padding: 2rem 1.5rem 1.5rem 1.5rem;
          }
          .card-body-section {
            padding: 1.5rem 1.25rem 1.5rem 1.25rem;
          }
          .forgot-modal-card {
            padding: 1.25rem;
            border-radius: 1rem;
          }
          .forgot-modal-backdrop {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
