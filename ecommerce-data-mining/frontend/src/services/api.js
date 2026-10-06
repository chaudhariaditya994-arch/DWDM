import axios from "axios";
import mockEngine from "./mockDataEngine";

// Detect API base URL.
// When running locally in Vite (DEV), connect to Flask at port 5000.
// If VITE_API_BASE_URL is explicitly set, use that.
// Otherwise, try relative path, with automatic in-browser fallback.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.DEV
    ? "http://127.0.0.1:5000"
    : "";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

// Helper that executes remote call first, and gracefully falls back to mockEngine
// when backend is offline, unreachable, or returns static HTML (e.g. Firebase Hosting rewrite)
const withFallback = (remoteFn, fallbackFn) => async (...args) => {
  try {
    const res = await remoteFn(...args);
    // If the response is HTML string (which Firebase Hosting sends for unhandled /api calls)
    if (typeof res.data === "string" && (res.data.includes("<!doctype html") || res.data.includes("<html"))) {
      const fallbackData = await fallbackFn(...args);
      return { data: fallbackData, status: 200, isFallback: true };
    }
    return res;
  } catch (error) {
    // If Flask backend actively returned a valid structured JSON error (like 401 or 409)
    if (error.response && error.response.data && typeof error.response.data === "object" && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    // Otherwise it was a connection failure or HTML 404/500
    try {
      const fallbackData = await fallbackFn(...args);
      return { data: fallbackData, status: 200, isFallback: true };
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

export const api = {
  // System Health
  checkHealth: withFallback(
    () => apiClient.get("/api/health"),
    mockEngine.checkHealth
  ),

  // Authentication
  login: withFallback(
    (credentials) => apiClient.post("/api/auth/login", credentials),
    mockEngine.login
  ),
  register: withFallback(
    (userData) => apiClient.post("/api/auth/register", userData),
    mockEngine.register
  ),

  // Dataset Operations
  uploadDataset: withFallback(
    (formData) =>
      apiClient.post("/api/dataset/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    mockEngine.uploadDataset
  ),
  resetDataset: withFallback(
    () => apiClient.post("/api/dataset/reset"),
    mockEngine.resetDataset
  ),
  getDatasetPreview: withFallback(
    (limit = 20, offset = 0) =>
      apiClient.get(`/api/dataset/preview?limit=${limit}&offset=${offset}`),
    mockEngine.getDatasetPreview
  ),
  getDatasetStatistics: withFallback(
    () => apiClient.get("/api/dataset/statistics"),
    mockEngine.getDatasetStatistics
  ),

  // Preprocessing
  runPreprocessing: withFallback(
    (config) => apiClient.post("/api/preprocessing", config),
    mockEngine.runPreprocessing
  ),
  getPreprocessingResults: withFallback(
    () => apiClient.get("/api/preprocessing/results"),
    mockEngine.getPreprocessingResults
  ),

  // Clustering (K-Means)
  runClustering: withFallback(
    (k = 4) => apiClient.post("/api/clustering", { k }),
    mockEngine.runClustering
  ),
  getClusteringResults: withFallback(
    () => apiClient.get("/api/clustering/results"),
    mockEngine.getClusteringResults
  ),

  // Classification
  trainClassification: withFallback(
    () => apiClient.post("/api/classification/train"),
    mockEngine.trainClassification
  ),
  getClassificationResults: withFallback(
    () => apiClient.get("/api/classification/results"),
    mockEngine.getClassificationResults
  ),
  predictCustomer: withFallback(
    (customerData) => apiClient.post("/api/classification/predict", customerData),
    mockEngine.predictCustomer
  ),

  // Association Rule Mining
  runApriori: withFallback(
    (params) => apiClient.post("/api/association/apriori", params),
    mockEngine.runApriori
  ),
  runFpGrowth: withFallback(
    (params) => apiClient.post("/api/association/fpgrowth", params),
    mockEngine.runFpGrowth
  ),
  getAssociationRules: withFallback(
    () => apiClient.get("/api/association/rules"),
    mockEngine.getAssociationRules
  ),

  // Recommendations
  getRecommendations: withFallback(
    (data) => apiClient.post("/api/recommendation", data),
    mockEngine.getRecommendations
  ),
  getCustomerRecommendations: withFallback(
    (customerId) => apiClient.get(`/api/recommendation/customer/${customerId}`),
    mockEngine.getCustomerRecommendations
  ),

  // Analytics & Dashboard
  getDashboardStats: withFallback(
    () => apiClient.get("/api/dashboard/statistics"),
    mockEngine.getDashboardStats
  ),
  getMonthlySales: withFallback(
    () => apiClient.get("/api/sales/monthly"),
    mockEngine.getMonthlySales
  ),
  getCategorySales: withFallback(
    () => apiClient.get("/api/sales/category"),
    mockEngine.getCategorySales
  ),
  getRegionSales: withFallback(
    () => apiClient.get("/api/sales/region"),
    mockEngine.getRegionSales
  ),

  // Data Warehouse & OLAP
  getWarehouseSchema: withFallback(
    () => apiClient.get("/api/warehouse/schema"),
    mockEngine.getWarehouseSchema
  ),
  getOlapAnalysis: withFallback(
    (params) => apiClient.get("/api/olap/analysis", { params }),
    mockEngine.getOlapAnalysis
  ),

  // Consolidated Academic Report
  getConsolidatedReport: withFallback(
    () => apiClient.get("/api/report/generate"),
    mockEngine.getConsolidatedReport
  ),
};

export default api;
