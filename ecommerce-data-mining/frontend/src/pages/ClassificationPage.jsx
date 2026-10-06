import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BrainCircuit,
  Award,
  CheckCircle,
  XCircle,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Sliders,
  Check
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export const ClassificationPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [modelsData, setModelsData] = useState(null);
  const [selectedModel, setSelectedModel] = useState("Random Forest");

  // Form states for prediction
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState("Female");
  const [location, setLocation] = useState("Mumbai");
  const [prevPurchases, setPrevPurchases] = useState(14);
  const [spending, setSpending] = useState(8500);
  const [frequency, setFrequency] = useState(1.8);
  const [recency, setRecency] = useState(12);

  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await api.getClassificationResults();
      setModelsData(res.data);
      if (res.data.best_model) {
        setSelectedModel(res.data.best_model);
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleRetrain = async () => {
    setLoading(true);
    try {
      const res = await api.trainClassification();
      setModelsData(res.data);
      addToast("Classification models trained and evaluated successfully!", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const payload = {
        age: Number(age),
        gender,
        location,
        previous_purchases: Number(prevPurchases),
        total_spending: Number(spending),
        purchase_frequency: Number(frequency),
        days_since_last_purchase: Number(recency),
        model: selectedModel,
      };
      const res = await api.predictCustomer(payload);
      setPredictionResult(res.data);
      addToast("Prediction computed successfully!", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setPredicting(false);
    }
  };

  if (loading && !modelsData) {
    return <LoadingSpinner message="Training Decision Tree, Naive Bayes, KNN, and Random Forest..." />;
  }

  const comparison = modelsData?.models_comparison || [];
  const activeModelDetails = comparison.find((m) => m.model === selectedModel) || comparison[0];
  const cm = activeModelDetails?.confusion_matrix;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supervised Classification: Repeat Purchase Propensity</h1>
          <p className="page-subtitle">
            Train and contrast 4 core algorithms (Decision Tree, Naive Bayes, KNN, Random Forest) to predict whether a customer will purchase again.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleRetrain} disabled={loading}>
          <RotateCcw size={16} /> Re-Train Models
        </button>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="card-title">Model Performance Benchmark Comparison</h3>
            <p className="card-sub">
              Evaluated on 80/20 train-test split ({modelsData?.test_size} unseen test instances)
            </p>
          </div>
          <span className="badge badge-emerald">
            Top Model: {modelsData?.best_model}
          </span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>Confusion Matrix (TN / FP / FN / TP)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((m, idx) => (
                <tr key={idx} className={m.model === selectedModel ? "row-highlight" : ""}>
                  <td className="font-bold text-gray-900">
                    {m.model}
                    {m.model === modelsData?.best_model && (
                      <span className="badge badge-amber ml-2">Recommended</span>
                    )}
                  </td>
                  <td className="font-bold text-indigo-700">{m.accuracy}%</td>
                  <td>{m.precision}%</td>
                  <td>{m.recall}%</td>
                  <td className="font-bold text-emerald-700">{m.f1_score}%</td>
                  <td className="font-mono text-xs">
                    TN:{m.confusion_matrix.tn} | FP:{m.confusion_matrix.fp} | FN:{m.confusion_matrix.fn} | TP:{m.confusion_matrix.tp}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${m.model === selectedModel ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setSelectedModel(m.model)}
                    >
                      {m.model === selectedModel ? "Active" : "Use"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix & Metric Comparison Chart */}
      <div className="charts-grid-two">
        {/* Model Metrics Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Side-by-Side Model Metrics Comparison</h3>
              <p className="chart-sub">Accuracy, Precision, Recall, and F1 across models</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="model" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip
                  formatter={(val) => [`${val}%`, ""]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                <Legend />
                <Bar dataKey="accuracy" name="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1_score" name="F1 Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Heatmap Card */}
        <div className="chart-card">
          <div className="chart-card-header flex-between">
            <div>
              <h3 className="chart-title">Confusion Matrix: {selectedModel}</h3>
              <p className="chart-sub">Evaluation of Type I (FP) and Type II (FN) errors</p>
            </div>
            <span className="badge badge-indigo">{selectedModel}</span>
          </div>
          {cm && (
            <div className="confusion-matrix-box">
              <div className="cm-grid">
                <div className="cm-corner">Actual \ Predicted</div>
                <div className="cm-header-col">Predicted: Unlikely (0)</div>
                <div className="cm-header-col">Predicted: Likely (1)</div>

                <div className="cm-header-row">Actual: Unlikely (0)</div>
                <div className="cm-cell cm-cell-tn">
                  <span className="cm-val">{cm.tn}</span>
                  <span className="cm-desc">True Negative (TN)</span>
                </div>
                <div className="cm-cell cm-cell-fp">
                  <span className="cm-val">{cm.fp}</span>
                  <span className="cm-desc">False Positive (FP)</span>
                </div>

                <div className="cm-header-row">Actual: Likely (1)</div>
                <div className="cm-cell cm-cell-fn">
                  <span className="cm-val">{cm.fn}</span>
                  <span className="cm-desc">False Negative (FN)</span>
                </div>
                <div className="cm-cell cm-cell-tp">
                  <span className="cm-val">{cm.tp}</span>
                  <span className="cm-desc">True Positive (TP)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Customer Prediction Form */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Real-Time Customer Repurchase Inference</h3>
            <p className="card-sub">
              Input new customer demographics and shopping traits to test the model's live decision
            </p>
          </div>
        </div>

        <div className="prediction-grid">
          <form onSubmit={handlePredict} className="prediction-form">
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-select"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-select"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Previous Purchases</label>
                <input
                  type="number"
                  min="0"
                  value={prevPurchases}
                  onChange={(e) => setPrevPurchases(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Spending (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={spending}
                  onChange={(e) => setSpending(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Purchase Frequency (orders/mo)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Days Since Last Purchase</label>
                <input
                  type="number"
                  min="1"
                  value={recency}
                  onChange={(e) => setRecency(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={predicting}>
              <BrainCircuit size={16} />
              {predicting ? "Running Classifier..." : `Predict with ${selectedModel}`}
            </button>
          </form>

          {/* Prediction Result Display Card */}
          <div className="prediction-result-panel">
            {predictionResult ? (
              <div className={`result-box ${predictionResult.is_likely ? "result-positive" : "result-negative"}`}>
                <div className="result-header">
                  {predictionResult.is_likely ? (
                    <CheckCircle size={36} className="text-emerald-500" />
                  ) : (
                    <XCircle size={36} className="text-pink-500" />
                  )}
                  <div>
                    <span className="result-sub">Model Prediction ({predictionResult.model_used}):</span>
                    <h2 className="result-title">{predictionResult.prediction}</h2>
                  </div>
                </div>

                <div className="result-confidence-bar">
                  <div className="flex-between text-xs mb-1 font-semibold">
                    <span>Confidence Score</span>
                    <span>{predictionResult.confidence}%</span>
                  </div>
                  <div className="meter-track">
                    <div
                      className={`meter-fill ${predictionResult.is_likely ? "bg-emerald" : "bg-pink"}`}
                      style={{ width: `${predictionResult.confidence}%` }}
                    ></div>
                  </div>
                </div>

                <div className="model-consensus-box">
                  <span className="consensus-title">Ensemble Model Consensus:</span>
                  <div className="consensus-list">
                    {Object.entries(predictionResult.all_models_consensus || {}).map(([mName, mRes]) => (
                      <div key={mName} className="consensus-item">
                        <span className="c-model-name">{mName}:</span>
                        <span className={`c-model-val ${mRes.prediction.includes("Likely") && !mRes.prediction.includes("Unlikely") ? "text-emerald-600" : "text-pink-600"}`}>
                          {mRes.prediction} ({mRes.confidence}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="result-empty-state">
                <Sparkles size={36} className="text-gray-400 mb-2" />
                <h4>Awaiting Customer Parameters</h4>
                <p>Adjust inputs on the left and click "Predict" to see real-time inference.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationPage;
