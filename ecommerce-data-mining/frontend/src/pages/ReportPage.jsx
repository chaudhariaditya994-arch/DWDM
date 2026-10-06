import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Database,
  BarChart2,
  Users,
  BrainCircuit,
  Link2
} from "lucide-react";

export const ReportPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.getConsolidatedReport();
        setReport(res.data);
      } catch (err) {
        addToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleDownloadCSV = () => {
    if (!report) return;
    try {
      const rows = [
        ["Project Title", report.title],
        ["Course", report.academic_subject],
        ["Generated At", report.timestamp],
        [],
        ["1. DATASET SUMMARY"],
        ["Total Records", report.dataset_summary.total_records],
        ["Total Attributes", report.dataset_summary.total_columns],
        ["Total Revenue", `₹${report.dataset_summary.total_revenue}`],
        ["Total Orders", report.dataset_summary.total_orders],
        ["Distinct Customers", report.dataset_summary.total_customers],
        ["Most Purchased Item", report.dataset_summary.most_purchased_product],
        [],
        ["2. K-MEANS CLUSTERING"],
        ["Optimal K", report.clustering_summary.k],
        ["Silhouette Score", report.clustering_summary.silhouette_score],
        ["Cluster ID", "Segment Label", "Customer Count", "Percentage", "Avg Spending"],
        ...report.clustering_summary.segments.map((s) => [
          s.cluster_id + 1,
          s.label,
          s.count,
          `${s.percentage}%`,
          `₹${s.avg_spending}`,
        ]),
        [],
        ["3. SUPERVISED CLASSIFICATION BENCHMARK"],
        ["Best Model", report.classification_summary.best_model],
        ["Algorithm", "Accuracy (%)", "Precision (%)", "Recall (%)", "F1 Score (%)"],
        ...report.classification_summary.models.map((m) => [
          m.model,
          m.accuracy,
          m.precision,
          m.recall,
          m.f1_score,
        ]),
        [],
        ["4. TOP MARKET BASKET ASSOCIATION RULES"],
        ["Rule", "Support", "Confidence (%)", "Lift"],
        ...report.association_summary.top_rules.map((r) => [
          r.rule,
          r.support,
          r.confidence_pct,
          `${r.lift}x`,
        ]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "DWDM_Ecommerce_Intelligence_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Report exported to CSV successfully!", "success");
    } catch (e) {
      addToast("Failed to export CSV: " + e.message, "error");
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Consolidating complete Data Mining and Data Warehousing report..." />;
  }

  return (
    <div className="page-container report-printable-view">
      <div className="page-header flex-between no-print">
        <div>
          <h1 className="page-title">Comprehensive Academic Project Report</h1>
          <p className="page-subtitle">
            Consolidated evaluation of Data Preprocessing, Customer Clustering, Repurchase Classification, and Star Schema OLAP.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleDownloadCSV}>
            <Download size={16} /> Export as CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrintPDF}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Main Report Document Card */}
      <div className="card report-paper">
        <div className="report-header-banner">
          <div className="report-institution">
            <span>Third Year Computer Engineering Academic Project</span>
            <span className="report-date">Generated on: {report?.timestamp}</span>
          </div>
          <h1 className="report-doc-title">{report?.title}</h1>
          <p className="report-doc-sub">
            A Complete Full-Stack Solution for E-Commerce Data Mining, Customer Intelligence, and Star Schema Warehousing
          </p>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="report-section">
          <h3 className="section-title">
            <Database size={18} className="text-indigo-600 inline mr-2" />
            1. Executive Dataset & Warehouse Summary
          </h3>
          <div className="report-metrics-grid">
            <div className="r-metric-box">
              <span className="rm-k">Total Ingested Records</span>
              <span className="rm-v">{report?.dataset_summary?.total_records?.toLocaleString()}</span>
            </div>
            <div className="r-metric-box">
              <span className="rm-k">Dimensional Attributes</span>
              <span className="rm-v">{report?.dataset_summary?.total_columns} Features</span>
            </div>
            <div className="r-metric-box">
              <span className="rm-k">Total Sales Fact Volume</span>
              <span className="rm-v">₹{report?.dataset_summary?.total_revenue?.toLocaleString()}</span>
            </div>
            <div className="r-metric-box">
              <span className="rm-k">Total Orders Analyzed</span>
              <span className="rm-v">{report?.dataset_summary?.total_orders?.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Clustering */}
        <section className="report-section">
          <h3 className="section-title">
            <Users size={18} className="text-purple-600 inline mr-2" />
            2. Customer Clustering Results (K-Means)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Using K={report?.clustering_summary?.k} clusters evaluated with a Silhouette Score of{" "}
            <strong>{report?.clustering_summary?.silhouette_score}</strong>.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cluster ID</th>
                <th>Academic Segment Label</th>
                <th>Population Count</th>
                <th>Share %</th>
                <th>Average Spending</th>
              </tr>
            </thead>
            <tbody>
              {report?.clustering_summary?.segments?.map((s, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">Cluster {s.cluster_id + 1}</td>
                  <td className="font-bold text-indigo-700">{s.label}</td>
                  <td>{s.count} customers</td>
                  <td>{s.percentage}%</td>
                  <td className="font-mono">₹{s.avg_spending?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 3: Classification */}
        <section className="report-section">
          <h3 className="section-title">
            <BrainCircuit size={18} className="text-emerald-600 inline mr-2" />
            3. Supervised Classification & Model Comparison
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Target Variable: <strong>{report?.classification_summary?.target}</strong>. Recommended Algorithm:{" "}
            <span className="badge badge-emerald">{report?.classification_summary?.best_model}</span>
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Accuracy (%)</th>
                <th>Precision (%)</th>
                <th>Recall (%)</th>
                <th>F1 Score (%)</th>
              </tr>
            </thead>
            <tbody>
              {report?.classification_summary?.models?.map((m, idx) => (
                <tr key={idx}>
                  <td className="font-bold">{m.model}</td>
                  <td className="font-bold text-indigo-700">{m.accuracy}%</td>
                  <td>{m.precision}%</td>
                  <td>{m.recall}%</td>
                  <td className="font-bold text-emerald-700">{m.f1_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 4: Association Rules */}
        <section className="report-section">
          <h3 className="section-title">
            <Link2 size={18} className="text-amber-600 inline mr-2" />
            4. Top Market Basket Association Rules
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Total Valid Rules Discovered: <strong>{report?.association_summary?.total_rules}</strong> using Apriori / FP-Growth.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Association Rule</th>
                <th>Support</th>
                <th>Confidence (%)</th>
                <th>Lift Factor</th>
              </tr>
            </thead>
            <tbody>
              {report?.association_summary?.top_rules?.map((r, idx) => (
                <tr key={idx}>
                  <td className="font-mono font-bold text-gray-900">{r.rule}</td>
                  <td>{(r.support * 100).toFixed(2)}%</td>
                  <td>{r.confidence_pct}%</td>
                  <td className="font-bold text-amber-700">{r.lift}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 5: Data Warehouse Architecture */}
        <section className="report-section">
          <h3 className="section-title">
            <Database size={18} className="text-blue-600 inline mr-2" />
            5. Data Warehouse Dimensional Schema
          </h3>
          <p className="text-sm text-gray-600">
            <strong>Architecture:</strong> {report?.warehouse_summary?.schema_type} with central fact table{" "}
            <code>{report?.warehouse_summary?.fact_table}</code> and dimensional tables:{" "}
            <code>{report?.warehouse_summary?.dimensions?.join(", ")}</code>.
          </p>
        </section>

        <div className="report-footer-signatures">
          <div className="sig-block">
            <div className="sig-line"></div>
            <span>Prepared By (Student)</span>
          </div>
          <div className="sig-block">
            <div className="sig-line"></div>
            <span>Verified By (Project Guide / Faculty)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
