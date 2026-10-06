import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Scissors,
  Box,
  Filter,
  BarChart2,
  Table as TableIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const OlapPage = () => {
  const { addToast } = useToast();
  const [operation, setOperation] = useState("rollup");
  const [level, setLevel] = useState("month");
  const [sliceDim, setSliceDim] = useState("category");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [olapResult, setOlapResult] = useState(null);

  const fetchOlapData = async () => {
    setLoading(true);
    try {
      const params = {
        operation,
        level,
        slice_dim: sliceDim,
      };
      if (filterRegion) params.region = filterRegion;
      if (filterCategory) params.category = filterCategory;

      const res = await api.getOlapAnalysis(params);
      setOlapResult(res.data);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOlapData();
  }, [operation, level, sliceDim, filterRegion, filterCategory]);

  const renderOlapTable = () => {
    if (!olapResult || !olapResult.data) return null;

    if (operation === "dice") {
      const columns = olapResult.columns || [];
      return (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {olapResult.data.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-gray-900">{row.region || row.category}</td>
                  {columns.slice(1).map((c) => (
                    <td key={c} className="font-mono text-indigo-700">
                      ₹{Number(row[c] || 0).toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Default for rollup, drilldown, slice
    const sampleItem = olapResult.data[0] || {};
    const keys = Object.keys(sampleItem);

    return (
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k}>{k.replace("_", " ").toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {olapResult.data.map((row, idx) => (
              <tr key={idx}>
                {keys.map((k) => (
                  <td key={k} className={k.includes("revenue") || k.includes("total") ? "font-bold text-indigo-700" : ""}>
                    {k.includes("revenue") || k.includes("value") || k.includes("amount")
                      ? `₹${Number(row[k]).toLocaleString()}`
                      : String(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">OLAP Multidimensional Analytics</h1>
          <p className="page-subtitle">
            Perform Online Analytical Processing operations (Roll-up, Drill-down, Slice, and Dice) on the Star Schema sales facts.
          </p>
        </div>
      </div>

      {/* OLAP Operations Selector Buttons */}
      <div className="card olap-selector-card">
        <h3 className="card-title text-indigo-700 mb-3">Select OLAP Operation</h3>
        <div className="olap-buttons-grid">
          <button
            className={`olap-op-btn ${operation === "rollup" ? "op-active" : ""}`}
            onClick={() => setOperation("rollup")}
          >
            <div className="op-icon-box">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <span className="op-name">Roll-up</span>
              <span className="op-desc">Climb time hierarchy (Day → Month → Year)</span>
            </div>
          </button>

          <button
            className={`olap-op-btn ${operation === "drilldown" ? "op-active" : ""}`}
            onClick={() => setOperation("drilldown")}
          >
            <div className="op-icon-box">
              <ArrowDownRight size={20} />
            </div>
            <div>
              <span className="op-name">Drill-down</span>
              <span className="op-desc">Descend to granular transaction dates</span>
            </div>
          </button>

          <button
            className={`olap-op-btn ${operation === "slice" ? "op-active" : ""}`}
            onClick={() => setOperation("slice")}
          >
            <div className="op-icon-box">
              <Scissors size={20} />
            </div>
            <div>
              <span className="op-name">Slice</span>
              <span className="op-desc">Filter 1 dimension (e.g. Category or Region)</span>
            </div>
          </button>

          <button
            className={`olap-op-btn ${operation === "dice" ? "op-active" : ""}`}
            onClick={() => setOperation("dice")}
          >
            <div className="op-icon-box">
              <Box size={20} />
            </div>
            <div>
              <span className="op-name">Dice</span>
              <span className="op-desc">Sub-cube matrix (Region × Category)</span>
            </div>
          </button>
        </div>

        {/* Dynamic Controls depending on selected operation */}
        <div className="olap-dynamic-controls">
          {operation === "rollup" && (
            <div className="form-group-inline">
              <label>Roll-up Time Aggregation Level:</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="form-select-sm"
              >
                <option value="month">Month Level</option>
                <option value="quarter">Quarter Level</option>
                <option value="year">Year Level</option>
              </select>
            </div>
          )}

          {operation === "drilldown" && (
            <div className="form-group-inline">
              <label>Drill-down Granularity:</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="form-select-sm"
              >
                <option value="day">Specific Date / Day</option>
                <option value="month">Month Granularity</option>
              </select>
            </div>
          )}

          {operation === "slice" && (
            <div className="form-group-inline">
              <label>Slice by Dimension:</label>
              <select
                value={sliceDim}
                onChange={(e) => setSliceDim(e.target.value)}
                className="form-select-sm"
              >
                <option value="category">Product Category</option>
                <option value="region">Store Region</option>
                <option value="gender">Customer Gender</option>
              </select>
            </div>
          )}

          {/* Optional Dimension Filters */}
          <div className="form-group-inline">
            <label>Filter Region:</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="form-select-sm"
            >
              <option value="">All Regions</option>
              <option value="West">West</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {olapResult?.summary && (
        <div className="kpi-grid">
          <div className="health-card">
            <span className="health-header">Filtered Aggregate Revenue</span>
            <h2 className="health-val text-indigo-700">
              ₹{olapResult.summary.total_revenue?.toLocaleString()}
            </h2>
          </div>
          <div className="health-card">
            <span className="health-header">Total Units Sold</span>
            <h2 className="health-val text-purple-700">
              {olapResult.summary.total_quantity?.toLocaleString()}
            </h2>
          </div>
          <div className="health-card">
            <span className="health-header">Fact Sales Records Involved</span>
            <h2 className="health-val">
              {olapResult.summary.filtered_records}
            </h2>
          </div>
        </div>
      )}

      {/* OLAP Chart & Data Matrix View */}
      {loading ? (
        <LoadingSpinner message="Aggregating multidimensional sales cube..." />
      ) : (
        <div className="card">
          <div className="card-header flex-between">
            <h3 className="card-title">
              {operation.toUpperCase()} Results: {olapResult?.hierarchy || olapResult?.dimensions?.join(" × ") || "Sales Cube"}
            </h3>
            <span className="badge badge-indigo">{olapResult?.data?.length || 0} Aggregates</span>
          </div>

          {/* Render Recharts Bar for single dimension views */}
          {operation !== "dice" && olapResult?.data?.length > 0 && (
            <div className="chart-body mb-6" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={olapResult.data}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey={Object.keys(olapResult.data[0])[0]}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                  <Bar dataKey="total_revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {renderOlapTable()}
        </div>
      )}
    </div>
  );
};

export default OlapPage;
