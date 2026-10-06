import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Sliders,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  RefreshCw,
  BarChart2,
  ShieldAlert
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

export const PreprocessingPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [results, setResults] = useState(null);

  // Configuration options
  const [imputation, setImputation] = useState("median_mode");
  const [handleOutliers, setHandleOutliers] = useState(true);
  const [scaling, setScaling] = useState("standard");
  const [discretizeAge, setDiscretizeAge] = useState(true);
  const [selectedFeatureChart, setSelectedFeatureChart] = useState("total_spending");

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.getPreprocessingResults();
      setResults(res.data);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    try {
      const config = {
        imputation_strategy: imputation,
        handle_outliers: handleOutliers,
        scaling: scaling,
        discretize_age: discretizeAge,
        discretize_spending: true,
      };
      const res = await api.runPreprocessing(config);
      setResults(res.data);
      addToast("Preprocessing pipeline executed successfully!", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setRunningPipeline(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading preprocessing baseline stats..." />;
  }

  const beforeStats = results?.before?.stats;
  const afterStats = results?.after?.stats;
  const activeChartData = results?.after?.charts?.[selectedFeatureChart]?.histogram || [];
  const activeBoxplot = results?.after?.charts?.[selectedFeatureChart]?.boxplot;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Preprocessing & Transformation Pipeline</h1>
          <p className="page-subtitle">
            Cleanse raw transactions, impute missing values, eradicate duplicates, cap outliers, scale features, and discretize attributes.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleRunPipeline}
          disabled={runningPipeline}
        >
          {runningPipeline ? <RefreshCw className="animate-spin" size={16} /> : <Sliders size={16} />}
          {runningPipeline ? "Running Pipeline..." : "Execute Preprocessing"}
        </button>
      </div>

      {/* Interactive Pipeline Parameters Panel */}
      <div className="card pipeline-config-card">
        <h3 className="card-title text-indigo-700">Pipeline Configuration Parameters</h3>
        <div className="config-grid">
          <div className="form-group">
            <label>Missing Value Imputation</label>
            <select
              value={imputation}
              onChange={(e) => setImputation(e.target.value)}
              className="form-select"
            >
              <option value="median_mode">Median (Numeric) & Mode (Categorical)</option>
              <option value="mean">Mean (Numeric) & Mode (Categorical)</option>
              <option value="drop">Listwise Deletion (Drop Incomplete Rows)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Feature Scaling Strategy</label>
            <select
              value={scaling}
              onChange={(e) => setScaling(e.target.value)}
              className="form-select"
            >
              <option value="standard">StandardScaler (Z-Score: mean=0, std=1)</option>
              <option value="minmax">MinMaxScaler (Normalization: [0, 1])</option>
              <option value="none">None (Raw Scales)</option>
            </select>
          </div>

          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={handleOutliers}
                onChange={(e) => setHandleOutliers(e.target.checked)}
              />
              <span>Outlier Treatment (Tukey's IQR 1.5× Winsorizing)</span>
            </label>
          </div>

          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={discretizeAge}
                onChange={(e) => setDiscretizeAge(e.target.checked)}
              />
              <span>Discretization (Age Bins: Youth / Middle / Senior)</span>
            </label>
          </div>
        </div>
      </div>

      {/* BEFORE vs AFTER Comparison Grid */}
      <div className="comparison-banner">
        <div className="comparison-col before-col">
          <div className="comparison-badge badge-before">BEFORE PREPROCESSING</div>
          <div className="comparison-metrics">
            <div className="c-metric">
              <span className="c-label">Total Records</span>
              <span className="c-val text-gray-700">{beforeStats?.total_records}</span>
            </div>
            <div className="c-metric">
              <span className="c-label">Missing Cells</span>
              <span className="c-val text-amber-600 font-bold">{beforeStats?.total_missing_cells}</span>
            </div>
            <div className="c-metric">
              <span className="c-label">Duplicate Rows</span>
              <span className="c-val text-pink-600 font-bold">{beforeStats?.total_duplicates}</span>
            </div>
          </div>
        </div>

        <div className="comparison-arrow">
          <ArrowRight size={28} className="text-indigo-500" />
        </div>

        <div className="comparison-col after-col">
          <div className="comparison-badge badge-after">AFTER PREPROCESSING</div>
          <div className="comparison-metrics">
            <div className="c-metric">
              <span className="c-label">Clean Records</span>
              <span className="c-val text-emerald-600 font-bold">{afterStats?.total_records}</span>
            </div>
            <div className="c-metric">
              <span className="c-label">Missing Cells</span>
              <span className="c-val text-emerald-600 font-bold">{afterStats?.total_missing_cells} (0%)</span>
            </div>
            <div className="c-metric">
              <span className="c-label">Duplicate Rows</span>
              <span className="c-val text-emerald-600 font-bold">{afterStats?.total_duplicates} (Clean)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Distribution Histogram & Boxplot */}
      <div className="charts-grid-two">
        <div className="chart-card">
          <div className="chart-card-header flex-between">
            <div>
              <h3 className="chart-title">Post-Cleaning Distribution Histogram</h3>
              <p className="chart-sub">Binned frequency of cleaned attributes</p>
            </div>
            <select
              value={selectedFeatureChart}
              onChange={(e) => setSelectedFeatureChart(e.target.value)}
              className="form-select-sm"
            >
              <option value="total_spending">Total Spending</option>
              <option value="age">Age</option>
              <option value="days_since_last_purchase">Recency (Days)</option>
              <option value="previous_purchases">Previous Purchases</option>
            </select>
          </div>
          <div className="chart-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="bin" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(val) => [val, "Count"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Boxplot 5-Number Summary Card */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Five-Number Summary (Box Plot Stats)</h3>
              <p className="chart-sub">Quartiles and dispersion metrics for {selectedFeatureChart}</p>
            </div>
          </div>
          {activeBoxplot ? (
            <div className="boxplot-visual-wrap">
              <div className="stat-bars-grid">
                <div className="box-stat-item">
                  <span className="box-stat-label">Minimum</span>
                  <span className="box-stat-val">₹{activeBoxplot.min}</span>
                </div>
                <div className="box-stat-item">
                  <span className="box-stat-label">Q1 (25th %)</span>
                  <span className="box-stat-val">₹{activeBoxplot.q1}</span>
                </div>
                <div className="box-stat-item highlight-box">
                  <span className="box-stat-label">Median (Q2)</span>
                  <span className="box-stat-val text-indigo-700">₹{activeBoxplot.median}</span>
                </div>
                <div className="box-stat-item">
                  <span className="box-stat-label">Q3 (75th %)</span>
                  <span className="box-stat-val">₹{activeBoxplot.q3}</span>
                </div>
                <div className="box-stat-item">
                  <span className="box-stat-label">Maximum (Capped)</span>
                  <span className="box-stat-val">₹{activeBoxplot.max}</span>
                </div>
                <div className="box-stat-item">
                  <span className="box-stat-label">Mean ± Std</span>
                  <span className="box-stat-val">
                    ₹{activeBoxplot.mean} ± {activeBoxplot.std}
                  </span>
                </div>
              </div>

              <div className="box-visual-bar">
                <div className="whisker-left"></div>
                <div className="box-body-pill">
                  <span className="box-inner-iqr">IQR Zone (Middle 50%)</span>
                </div>
                <div className="whisker-right"></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Boxplot data not available</p>
          )}
        </div>
      </div>

      {/* Feature Selection Correlation Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Feature Selection: Correlation with Purchase Target</h3>
            <p className="card-sub">
              Pearson correlation coefficient with 'likely_to_purchase_again' (Dimensional Reduction criterion)
            </p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature / Attribute</th>
                <th>Correlation (r)</th>
                <th>Predictive Relationship</th>
                <th>Feature Selection Status</th>
              </tr>
            </thead>
            <tbody>
              {results?.details?.feature_correlations?.map((item, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-gray-800">{item.feature}</td>
                  <td className="font-mono font-bold">
                    <span className={item.correlation >= 0 ? "text-emerald-600" : "text-pink-600"}>
                      {item.correlation > 0 ? `+${item.correlation}` : item.correlation}
                    </span>
                  </td>
                  <td>
                    <span className={`impact-badge impact-${item.impact.toLowerCase().replace(" ", "-")}`}>
                      {item.impact}
                    </span>
                  </td>
                  <td>
                    {Math.abs(item.correlation) > 0.05 ? (
                      <span className="badge badge-emerald">Selected for ML</span>
                    ) : (
                      <span className="badge badge-gray">Low Variance / Noise</span>
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

export default PreprocessingPage;
