import React from "react";

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "indigo" }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-icon-wrapper icon-${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        {(subtitle || trend) && (
          <div className="stat-card-footer">
            {trend && <span className={`stat-trend ${trend.positive ? "trend-up" : "trend-down"}`}>{trend.label}</span>}
            {subtitle && <span className="stat-card-sub">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
