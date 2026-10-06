import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Database,
  Cpu,
  LogIn,
  UserPlus,
  Briefcase
} from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"

  // Sign In states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState("analyst");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      addToast(`Welcome back, ${res.user.name}!`, "success");
      navigate("/dashboard");
    } else {
      setErrorMsg(res.error || "Login failed. Please verify credentials.");
      addToast(res.error || "Authentication failed", "error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMsg("Password must contain at least 4 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your password.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    const res = await register(regName, regEmail, regPassword, regRole);
    setSubmitting(false);

    if (res.success) {
      addToast(`Account created successfully! Welcome, ${res.user.name}!`, "success");
      navigate("/dashboard");
    } else {
      setErrorMsg(res.error || "Registration failed. Please try again.");
      addToast(res.error || "Registration failed", "error");
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setMode("signin");
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
  };

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon-badge">
              <GraduationCap size={28} />
            </div>
            <h1 className="login-title">E-Commerce Customer Intelligence</h1>
            <p className="login-subtitle">
              & Product Recommendation System Using Data Mining & Data Warehousing
            </p>
            <div className="academic-tag">Third Year Computer Engineering Project</div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${mode === "signin" ? "active" : ""}`}
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
              }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </button>
          </div>

          {errorMsg && <div className="login-error-banner">{errorMsg}</div>}

          {mode === "signin" ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="admin@ecommerce.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  "Authenticating..."
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="auth-toggle-text">
                Don't have an account yet?
                <button
                  type="button"
                  className="auth-toggle-link"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                  }}
                >
                  Create one here
                </button>
              </div>

              {/* Quick Demo Credentials */}
              <div className="demo-credentials-box">
                <span className="demo-title">Quick Demo Credentials (Click to fill):</span>
                <div className="demo-buttons-grid">
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => fillCredentials("admin@ecommerce.com", "admin123")}
                  >
                    <ShieldCheck size={14} /> Admin
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => fillCredentials("analyst@ecommerce.com", "analyst123")}
                  >
                    <Cpu size={14} /> Analyst
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => fillCredentials("student@ecommerce.com", "student123")}
                  >
                    <Database size={14} /> Student
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Sign Up / Registration Form */
            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="e.g. Aditya Chaudhari"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="e.g. aditya@ecommerce.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-role">Role / Project Designation</label>
                <div className="input-with-icon">
                  <Briefcase size={18} className="input-icon" />
                  <select
                    id="reg-role"
                    className="auth-select-role"
                    style={{ paddingLeft: "2.5rem" }}
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="analyst">Data Analyst (Recommended)</option>
                    <option value="user">Student / Researcher</option>
                    <option value="admin">System Administrator</option>
                    <option value="manager">Store Operations Manager</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-pass">Create Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-pass"
                    type="password"
                    placeholder="At least 4 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm-pass">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-confirm-pass"
                    type="password"
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  "Creating Account..."
                ) : (
                  <>
                    <span>Create Account & Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="auth-toggle-text">
                Already registered?
                <button
                  type="button"
                  className="auth-toggle-link"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg("");
                  }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          <div className="login-footer">
            <span>Powered by Scikit-Learn • mlxtend • Star Schema • React & Flask</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
