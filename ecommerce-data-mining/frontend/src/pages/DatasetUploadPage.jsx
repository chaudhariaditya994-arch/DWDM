import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  Copy,
  Sliders,
  RotateCcw,
  CheckCircle,
  Eye,
  Table,
  Hash
} from "lucide-react";

export const DatasetUploadPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const fetchStatsAndPreview = async (pageNum = 0) => {
    setLoadingStats(true);
    try {
      const [statsRes, prevRes] = await Promise.all([
        api.getDatasetStatistics(),
        api.getDatasetPreview(pageSize, pageNum * pageSize),
      ]);
      setStats(statsRes.data);
      setPreview(prevRes.data);
      setPage(pageNum);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStatsAndPreview(0);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".csv")) {
        addToast("Please choose a valid .csv file.", "error");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addToast("Please select a CSV file first.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    try {
      const res = await api.uploadDataset(formData);
      addToast(res.data.message || "Dataset uploaded successfully!", "success");
      setSelectedFile(null);
      await fetchStatsAndPreview(0);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleResetSample = async () => {
    setUploading(true);
    try {
      const res = await api.resetDataset();
      addToast(res.data.message || "Sample dataset reloaded!", "success");
      await fetchStatsAndPreview(0);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dataset Upload & Ingestion</h1>
          <p className="page-subtitle">
            Upload custom e-commerce transaction data in CSV format or explore the pre-loaded academic benchmark dataset.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleResetSample}
            disabled={uploading}
            title="Reload built-in 975-row sample dataset"
          >
            <RotateCcw size={16} /> Reset to Sample Dataset
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/preprocessing")}
          >
            <Sliders size={16} /> Preprocess Dataset
          </button>
        </div>
      </div>

      {/* Upload Box Card */}
      <div className="card upload-card">
        <div className="upload-dropzone">
          <UploadCloud size={48} className="upload-icon" />
          <h3 className="upload-zone-title">Upload E-Commerce Sales CSV</h3>
          <p className="upload-zone-desc">
            Supports multi-attribute transactions (customer_id, product_name, total_amount, order_date, etc.)
          </p>
          <div className="upload-controls">
            <input
              type="file"
              id="csv-file-input"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            <label htmlFor="csv-file-input" className="btn btn-outline">
              <FileSpreadsheet size={16} />
              {selectedFile ? selectedFile.name : "Choose CSV File"}
            </label>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Ingesting..." : "Upload & Analyze"}
            </button>
          </div>
        </div>
      </div>

      {loadingStats ? (
        <LoadingSpinner message="Inspecting dataset health and schema..." />
      ) : stats ? (
        <>
          {/* Dataset Statistics Health Cards */}
          <div className="kpi-grid">
            <div className="health-card">
              <div className="health-header">
                <Hash size={18} className="text-indigo-600" />
                <span>Total Records</span>
              </div>
              <h2 className="health-val">{stats.total_records?.toLocaleString()}</h2>
              <span className="health-sub">Raw rows in warehouse storage</span>
            </div>

            <div className="health-card">
              <div className="health-header">
                <Table size={18} className="text-purple-600" />
                <span>Total Attributes</span>
              </div>
              <h2 className="health-val">{stats.total_columns}</h2>
              <span className="health-sub">Dimensional & behavioral features</span>
            </div>

            <div className="health-card">
              <div className="health-header">
                <AlertTriangle size={18} className="text-amber-500" />
                <span>Missing Value Cells</span>
              </div>
              <h2 className="health-val text-amber-600">{stats.total_missing_cells}</h2>
              <span className="health-sub">Requires imputation during preprocessing</span>
            </div>

            <div className="health-card">
              <div className="health-header">
                <Copy size={18} className="text-pink-500" />
                <span>Duplicate Records</span>
              </div>
              <h2 className="health-val text-pink-600">{stats.total_duplicates}</h2>
              <span className="health-sub">Detected identical transaction rows</span>
            </div>
          </div>

          {/* Column Data Types & Summary Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Column Metadata & Attribute Types</h3>
              <span className="badge badge-indigo">{stats.columns_summary?.length} Features</span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Missing Count</th>
                    <th>Missing %</th>
                    <th>Unique Values</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.columns_summary?.map((col, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-gray-800">{col.column}</td>
                      <td>
                        <span className={`dtype-pill dtype-${col.dtype.includes("int") || col.dtype.includes("float") ? "num" : "str"}`}>
                          {col.dtype}
                        </span>
                      </td>
                      <td className={col.missing > 0 ? "text-amber-600 font-medium" : "text-gray-500"}>
                        {col.missing}
                      </td>
                      <td>
                        <div className="missing-bar-wrap">
                          <div className="missing-bar" style={{ width: `${Math.min(100, col.missing_pct * 5)}%` }}></div>
                          <span>{col.missing_pct}%</span>
                        </div>
                      </td>
                      <td>{col.unique} distinct</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dataset Preview Table */}
          {preview && (
            <div className="card">
              <div className="card-header flex-between">
                <div>
                  <h3 className="card-title">Dataset Records Preview</h3>
                  <p className="card-sub">
                    Showing rows {page * pageSize + 1} to {Math.min((page + 1) * pageSize, preview.total_rows)} of {preview.total_rows}
                  </p>
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => fetchStatsAndPreview(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                  <span className="page-indicator">Page {page + 1}</span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => fetchStatsAndPreview(page + 1)}
                    disabled={(page + 1) * pageSize >= preview.total_rows}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="table-responsive" style={{ maxHeight: 420 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {preview.columns?.slice(0, 10).map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows?.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {preview.columns?.slice(0, 10).map((c) => (
                          <td key={c}>
                            {row[c] !== "" && row[c] !== null && row[c] !== undefined ? (
                              String(row[c])
                            ) : (
                              <span className="text-null">NULL</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default DatasetUploadPage;
