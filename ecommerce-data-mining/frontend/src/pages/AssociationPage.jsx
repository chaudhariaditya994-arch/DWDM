import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Link2,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle,
  Sparkles
} from "lucide-react";

export const AssociationPage = () => {
  const { addToast } = useToast();
  const [algorithm, setAlgorithm] = useState("apriori");
  const [minSupport, setMinSupport] = useState(0.03);
  const [minConfidence, setMinConfidence] = useState(0.3);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  const fetchRules = async (algo = algorithm, sup = minSupport, conf = minConfidence) => {
    setLoading(true);
    try {
      const res =
        algo === "fpgrowth"
          ? await api.runFpGrowth({ min_support: sup, min_confidence: conf })
          : await api.runApriori({ min_support: sup, min_confidence: conf });
      setResults(res.data);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules("apriori", 0.03, 0.3);
  }, []);

  const handleRunMining = async (chosenAlgo = algorithm) => {
    setRunning(true);
    try {
      const res =
        chosenAlgo === "fpgrowth"
          ? await api.runFpGrowth({ min_support: minSupport, min_confidence: minConfidence })
          : await api.runApriori({ min_support: minSupport, min_confidence: minConfidence });
      setResults(res.data);
      addToast(
        `${chosenAlgo.toUpperCase()} completed in ${res.data.execution_time_ms} ms with ${res.data.total_rules} rules!`,
        "success"
      );
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setRunning(false);
    }
  };

  if (loading && !results) {
    return <LoadingSpinner message="Mining frequent itemsets and association rules with mlxtend..." />;
  }

  const rules = results?.association_rules || [];
  const itemsets = results?.frequent_itemsets || [];

  const filteredRules = rules.filter(
    (r) =>
      r.rule.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.antecedents.some((a) => a.toLowerCase().includes(filterQuery.toLowerCase())) ||
      r.consequents.some((c) => c.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Market Basket Association Rule Mining</h1>
          <p className="page-subtitle">
            Uncover co-purchase relationships and cross-selling patterns across baskets using Apriori and FP-Growth algorithms.
          </p>
        </div>
      </div>

      {/* Algorithm and Threshold Controls */}
      <div className="card mining-controls-card">
        <div className="controls-grid">
          {/* Algorithm Toggle */}
          <div className="form-group">
            <label className="font-semibold text-gray-700">Mining Algorithm</label>
            <div className="toggle-button-group">
              <button
                type="button"
                className={`toggle-btn ${algorithm === "apriori" ? "toggle-btn-active" : ""}`}
                onClick={() => {
                  setAlgorithm("apriori");
                  handleRunMining("apriori");
                }}
              >
                Apriori (Level-wise)
              </button>
              <button
                type="button"
                className={`toggle-btn ${algorithm === "fpgrowth" ? "toggle-btn-active" : ""}`}
                onClick={() => {
                  setAlgorithm("fpgrowth");
                  handleRunMining("fpgrowth");
                }}
              >
                <Zap size={14} /> FP-Growth (Tree-based)
              </button>
            </div>
          </div>

          {/* Min Support Slider */}
          <div className="form-group">
            <div className="flex-between">
              <label>Minimum Support (s)</label>
              <span className="badge badge-indigo font-mono">{(minSupport * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.005"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="k-range-slider"
            />
            <span className="slider-hint">Itemset frequency threshold in transactions</span>
          </div>

          {/* Min Confidence Slider */}
          <div className="form-group">
            <div className="flex-between">
              <label>Minimum Confidence (c)</label>
              <span className="badge badge-purple font-mono">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="k-range-slider"
            />
            <span className="slider-hint">Conditional probability P(Consequent | Antecedent)</span>
          </div>

          <div className="form-group flex-end">
            <button
              className="btn btn-primary w-full"
              onClick={() => handleRunMining(algorithm)}
              disabled={running}
            >
              {running ? "Mining Patterns..." : `Run ${algorithm.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Execution Time Benchmark */}
      <div className="kpi-grid">
        <div className="health-card">
          <div className="health-header">
            <Clock size={18} className="text-indigo-600" />
            <span>Execution Runtime</span>
          </div>
          <h2 className="health-val text-indigo-700">{results?.execution_time_ms} ms</h2>
          <span className="health-sub">
            {algorithm === "fpgrowth" ? "FP-Tree (No candidate generation)" : "Candidate generation & prune"}
          </span>
        </div>

        <div className="health-card">
          <div className="health-header">
            <Layers size={18} className="text-purple-600" />
            <span>Frequent Itemsets</span>
          </div>
          <h2 className="health-val">{results?.total_frequent_itemsets} Itemsets</h2>
          <span className="health-sub">Meeting support ≥ {(minSupport * 100).toFixed(1)}%</span>
        </div>

        <div className="health-card">
          <div className="health-header">
            <Link2 size={18} className="text-emerald-600" />
            <span>Discovered Rules</span>
          </div>
          <h2 className="health-val text-emerald-700">{results?.total_rules} Rules</h2>
          <span className="health-sub">Confidence ≥ {(minConfidence * 100).toFixed(0)}%</span>
        </div>

        <div className="health-card">
          <div className="health-header">
            <TrendingUp size={18} className="text-amber-600" />
            <span>Highest Lift Factor</span>
          </div>
          <h2 className="health-val text-amber-700">
            {rules.length > 0 ? `${rules[0].lift}x` : "1.0x"}
          </h2>
          <span className="health-sub">Lift &gt; 1 indicates strong positive association</span>
        </div>
      </div>

      {/* Association Rules Table */}
      <div className="card">
        <div className="card-header flex-between flex-wrap gap-3">
          <div>
            <h3 className="card-title">Discovered Association Rules (Antecedents → Consequents)</h3>
            <p className="card-sub">Ranked by Lift (multiplicative dependency over random chance)</p>
          </div>
          <div className="search-input-box">
            <Filter size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Filter by product (e.g. Bread, Tea)..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="table-filter-input"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Association Rule</th>
                <th>Antecedent [X]</th>
                <th>Consequent [Y]</th>
                <th>Support</th>
                <th>Confidence</th>
                <th>Lift</th>
                <th>Actionable Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.length > 0 ? (
                filteredRules.map((r, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-gray-900 font-mono text-sm">
                      {r.rule}
                    </td>
                    <td>
                      <span className="pill-ant">{r.antecedents.join(" + ")}</span>
                    </td>
                    <td>
                      <span className="pill-con">{r.consequents.join(" + ")}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{(r.support * 100).toFixed(2)}%</span>
                    </td>
                    <td>
                      <div className="confidence-meter">
                        <div
                          className="conf-bar"
                          style={{ width: `${r.confidence_pct}%` }}
                        ></div>
                        <span>{r.confidence_pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="lift-pill">
                        {r.lift}x
                      </span>
                    </td>
                    <td className="text-xs text-gray-600">
                      When buying {r.antecedents.join(", ")}, customers are {r.lift}x more likely to also add {r.consequents.join(", ")}.
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No association rules found matching criteria. Try lowering the Minimum Support or Confidence slider.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequent Itemsets Summary */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Top Frequent Itemsets</h3>
            <p className="card-sub">Co-occurring product combinations exceeding support threshold</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Frequent Itemset</th>
                <th>Items Count (k-itemset)</th>
                <th>Support Ratio</th>
                <th>Transaction Frequency</th>
              </tr>
            </thead>
            <tbody>
              {itemsets.slice(0, 12).map((item, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-gray-800">
                    {item.items.map((i, iIdx) => (
                      <span key={iIdx} className="item-token">
                        {i}
                      </span>
                    ))}
                  </td>
                  <td>{item.item_count}-itemset</td>
                  <td className="font-mono font-bold text-indigo-600">
                    {(item.support * 100).toFixed(2)}%
                  </td>
                  <td>High co-purchase</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssociationPage;
