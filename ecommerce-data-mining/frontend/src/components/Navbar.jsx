import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Database, LogOut, Menu, User, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dbStatus, setDbStatus] = useState({ db_type: "connecting...", status: "checking" });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.checkHealth();
        setDbStatus(res.data.database);
      } catch {
        setDbStatus({ db_type: "offline", status: "error" });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button
          className="navbar-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-heading">
          <span className="navbar-badge">
            <Sparkles size={13} className="text-purple-600" /> Third Year DWDM Project
          </span>
          <h2 className="navbar-title">E-Commerce Intelligence Platform</h2>
        </div>
      </div>

      <div className="navbar-right">
        {/* Database Status Badge */}
        <div className={`db-status-pill ${dbStatus.db_type === "mysql" ? "db-mysql" : "db-sqlite"}`} title={`Active Warehouse Database: ${dbStatus.db_type?.toUpperCase()}`}>
          <Database size={14} />
          <span className="db-pill-text">
            {dbStatus.db_type === "mysql" ? "MySQL Connected" : "SQLite DW Active"}
          </span>
          <span className="status-dot"></span>
        </div>

        {/* User Profile */}
        <div className="navbar-user-card">
          <div className="user-avatar">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || "Academic User"}</span>
            <span className="user-role">
              <ShieldCheck size={11} /> {user?.role || "analyst"}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button className="navbar-logout-btn" onClick={logout} title="Sign Out">
          <LogOut size={16} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
