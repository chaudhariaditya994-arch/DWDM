import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, Database, Cpu } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setErrorMsg(res.error || "Login failed. Please check credentials.");
      addToast(res.error || "Authentication failed", "error");
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
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

          {errorMsg && <div className="login-error-banner">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@ecommerce.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
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
          </form>

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

          <div className="login-footer">
            <span>Powered by Scikit-Learn • mlxtend • Star Schema • React & Flask</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
