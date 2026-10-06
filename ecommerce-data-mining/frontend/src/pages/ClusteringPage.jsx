import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Users,
  Layers,
  Sparkles,
  TrendingUp,
  Activity,
  Award,
  HelpCircle,
  Play
} from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

const CLUSTER_COLORS = ["#6366f1", "#10b981", "#ec4899", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];

export const ClusteringPage = () => {
  const { addToast } = useToast();
  const [k, setK] = useState(4);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const fetchClustering = async (clusterK = k) => {
    setLoading(true);
    try {
      const res = await api.runClustering(clusterK);
      setResults(res.data);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClustering(4);
  }, []);

  const handleRunClustering = async () => {
    setRunning(true);
    try {
      const res = await api.runClustering(k);
      setResults(res.data);
      addToast(`K-Means clustered successfully into K=${k} segments!`, "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setRunning(false);
    }
  };

  if (loading && !results) {
    return <LoadingSpinner message="Executing K-Means and calculating Silhouette Score..." />;
  }

  const silhouette = results?.silhouette_score || 0;
  const profiles = results?.cluster_profiles || [];
  const scatterPoints = results?.scatter_points || [];
  const elbowCurve = results?.elbow_curve || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Segmentation via K-Means Clustering</h1>
          <p className="page-subtitle">
            Unsupervised clustering on customer dimensions (Age, Spending, Frequency, Recency) to discover high-value buyer cohorts.
          </p>
        </div>
      </div>

      {/* Control Panel: K Slider & Execution Button */}
      <div className="card clustering-controls-card">
        <div className="flex-between flex-wrap gap-4">
          <div className="k-slider-box">
            <label className="k-label">
              <span>Select Number of Clusters (K):</span>
              <span className="k-badge">K = {k}</span>
            </label>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={k}
              onChange={(e) => setK(parseInt(e.target.value))}
              className="k-range-slider"
            />
            <div className="k-slider-ticks">
              {[2, 3, 4, 5, 6, 7, 8].map((val) => (
                <span key={val} className={val === k ? "tick-active" : ""}>
                  {val}
                </span>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRunClustering}
            disabled={running}
          >
            <Play size={16} />
            {running ? "Re-clustering..." : "Run K-Means Algorithm"}
          </button>
        </div>
      </div>

      {/* Cluster Health & Silhouette Score Card */}
      <div className="kpi-grid">
        <div className="health-card">
          <div className="health-header">
            <Activity size={18} className="text-indigo-600" />
            <span>Silhouette Coefficient</span>
          </div>
          <h2 className="health-val text-indigo-700">{silhouette}</h2>
          <span className="health-sub">
            {silhouette > 0.5 ? "Strong cluster cohesion" : silhouette > 0.3 ? "Reasonable separation" : "Weak separation"}
          </span>
        </div>

        <div className="health-card">
          <div className="health-header">
            <Layers size={18} className="text-purple-600" />
            <span>Active Clusters</span>
          </div>
          <h2 className="health-val">{results?.k} Segments</h2>
          <span className="health-sub">Dynamic partition of customer population</span>
        </div>

        <div className="health-card">
          <div className="health-header">
            <Award size={18} className="text-emerald-600" />
            <span>Top Segment</span>
          </div>
          <h2 className="health-val text-emerald-700 text-lg">
            {profiles[0]?.label || "VIP Cohort"}
          </h2>
          <span className="health-sub">{profiles[0]?.count} customers ({profiles[0]?.percentage}%)</span>
        </div>

        <div className="health-card">
          <div className="health-header">
            <HelpCircle size={18} className="text-amber-600" />
            <span>Clustering Features</span>
          </div>
          <h2 className="health-val text-base">5 Core Metrics</h2>
          <span className="health-sub">Age, Purchases, Spending, Frequency, Recency</span>
        </div>
      </div>

      {/* Charts Row: PCA 2D Scatter Visualization & Elbow Curve */}
      <div className="charts-grid-two">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">2D PCA Cluster Scatter Plot</h3>
              <p className="chart-sub">
                Dimensional reduction to 2 Principal Components (Variance: {((results?.pca_variance_ratio?.[0] || 0.4) * 100).toFixed(0)}% + {((results?.pca_variance_ratio?.[1] || 0.3) * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" name="PCA Component 1" stroke="#64748b" />
                <YAxis type="number" dataKey="y" name="PCA Component 2" stroke="#64748b" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="custom-tooltip">
                          <p className="font-bold text-gray-900">{data.customer_name}</p>
                          <p className="text-xs text-indigo-600 font-semibold">{data.cluster_label}</p>
                          <p className="text-xs text-gray-600">Spending: ₹{data.spending?.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Recency: {data.recency} days ago</p>
                          <p className="text-xs text-gray-600">Age: {data.age} yrs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Customers" data={scatterPoints}>
                  {scatterPoints.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Elbow Curve Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Elbow Method Analysis (Inertia vs K)</h3>
              <p className="chart-sub">Optimal K selection by identifying the curve inflection point</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elbowCurve} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="k" stroke="#64748b" label={{ value: "Number of Clusters (K)", position: "insideBottom", offset: -5 }} />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(val) => [val, "Inertia (SSE)"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                <Line type="monotone" dataKey="inertia" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cluster Characteristics & Profiles Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Cluster Characteristics & Meaningful Segment Labels</h3>
            <p className="card-sub">
              Centroid analysis showing average behavioral metrics for targeted marketing strategies
            </p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Segment ID</th>
                <th>Academic Business Label</th>
                <th>Customer Count</th>
                <th>Share %</th>
                <th>Avg Spending</th>
                <th>Avg Purchases</th>
                <th>Avg Frequency</th>
                <th>Avg Recency</th>
                <th>Strategic Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p, idx) => (
                <tr key={idx}>
                  <td>
                    <span
                      className="cluster-badge"
                      style={{ backgroundColor: `${CLUSTER_COLORS[p.cluster_id % CLUSTER_COLORS.length]}20`, color: CLUSTER_COLORS[p.cluster_id % CLUSTER_COLORS.length] }}
                    >
                      Cluster {p.cluster_id + 1}
                    </span>
                  </td>
                  <td className="font-bold text-gray-900">{p.label}</td>
                  <td>{p.count} buyers</td>
                  <td>{p.percentage}%</td>
                  <td className="font-bold text-indigo-700">₹{p.avg_spending?.toLocaleString()}</td>
                  <td>{p.avg_purchases} orders</td>
                  <td>{p.avg_frequency} / mo</td>
                  <td>{p.avg_recency} days</td>
                  <td>
                    {p.avg_spending > 10000 ? (
                      <span className="badge badge-emerald">VIP Loyalty Rewards</span>
                    ) : p.avg_recency > 45 ? (
                      <span className="badge badge-pink">Win-back Campaigns</span>
                    ) : (
                      <span className="badge badge-indigo">Upsell & Cross-sell</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClusteringPage;
