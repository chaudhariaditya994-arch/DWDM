import axios from "axios";

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
  timeout: 45000,
});

// Response interceptor for clear error messaging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let msg = "Network error or backend is not reachable. Please ensure Flask server is running on port 5000.";
    if (error.response && error.response.data && error.response.data.error) {
      msg = error.response.data.error;
    } else if (error.message) {
      msg = error.message;
    }
    return Promise.reject(new Error(msg));
  }
);

export const api = {
  // System Health
  checkHealth: () => apiClient.get("/api/health"),

  // Authentication
  login: (credentials) => apiClient.post("/api/auth/login", credentials),

  // Dataset Operations
  uploadDataset: (formData) =>
    apiClient.post("/api/dataset/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  resetDataset: () => apiClient.post("/api/dataset/reset"),
  getDatasetPreview: (limit = 20, offset = 0) =>
    apiClient.get(`/api/dataset/preview?limit=${limit}&offset=${offset}`),
  getDatasetStatistics: () => apiClient.get("/api/dataset/statistics"),

  // Preprocessing
  runPreprocessing: (config) => apiClient.post("/api/preprocessing", config),
  getPreprocessingResults: () => apiClient.get("/api/preprocessing/results"),

  // Clustering (K-Means)
  runClustering: (k = 4) => apiClient.post("/api/clustering", { k }),
  getClusteringResults: () => apiClient.get("/api/clustering/results"),

  // Classification
  trainClassification: () => apiClient.post("/api/classification/train"),
  getClassificationResults: () => apiClient.get("/api/classification/results"),
  predictCustomer: (customerData) => apiClient.post("/api/classification/predict", customerData),

  // Association Rule Mining
  runApriori: (params) => apiClient.post("/api/association/apriori", params),
  runFpGrowth: (params) => apiClient.post("/api/association/fpgrowth", params),
  getAssociationRules: () => apiClient.get("/api/association/rules"),

  // Recommendations
  getRecommendations: (data) => apiClient.post("/api/recommendation", data),
  getCustomerRecommendations: (customerId) => apiClient.get(`/api/recommendation/customer/${customerId}`),

  // Analytics & Dashboard
  getDashboardStats: () => apiClient.get("/api/dashboard/statistics"),
  getMonthlySales: () => apiClient.get("/api/sales/monthly"),
  getCategorySales: () => apiClient.get("/api/sales/category"),
  getRegionSales: () => apiClient.get("/api/sales/region"),

  // Data Warehouse & OLAP
  getWarehouseSchema: () => apiClient.get("/api/warehouse/schema"),
  getOlapAnalysis: (params) => apiClient.get("/api/olap/analysis", { params }),

  // Consolidated Academic Report
  getConsolidatedReport: () => apiClient.get("/api/report/generate"),
};

export default api;
