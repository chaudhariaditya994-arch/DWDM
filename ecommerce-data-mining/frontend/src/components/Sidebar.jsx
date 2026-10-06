import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  Sliders,
  Users,
  BrainCircuit,
  Link2,
  Sparkles,
  Database,
  Layers,
  FileText,
  X,
  GraduationCap
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dataset", label: "Dataset Upload", icon: UploadCloud },
    { to: "/preprocessing", label: "Data Preprocessing", icon: Sliders },
    { to: "/clustering", label: "Customer Clustering", icon: Users },
    { to: "/classification", label: "Customer Classification", icon: BrainCircuit },
    { to: "/association", label: "Association Rules", icon: Link2 },
    { to: "/recommendations", label: "Recommendations", icon: Sparkles },
    { to: "/warehouse", label: "Data Warehouse", icon: Database },
    { to: "/olap", label: "OLAP Analytics", icon: Layers },
    { to: "/reports", label: "Project Reports", icon: FileText },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`app-sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="logo-icon">
              <GraduationCap size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">DWDM Analytics</span>
              <span className="brand-sub">Computer Engineering</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-menu-title">MODULES & PIPELINE</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-item-active" : ""}`
                }
                onClick={onClose}
              >
                <div className="nav-icon-box">
                  <Icon size={18} />
                </div>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="project-badge-box">
            <span className="badge-tag">Star Schema & AI</span>
            <p className="badge-desc">Customer Intelligence & Recommender System</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
