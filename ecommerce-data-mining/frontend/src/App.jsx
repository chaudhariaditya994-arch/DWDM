import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DatasetUploadPage from "./pages/DatasetUploadPage";
import PreprocessingPage from "./pages/PreprocessingPage";
import ClusteringPage from "./pages/ClusteringPage";
import ClassificationPage from "./pages/ClassificationPage";
import AssociationPage from "./pages/AssociationPage";
import RecommendationPage from "./pages/RecommendationPage";
import DataWarehousePage from "./pages/DataWarehousePage";
import OlapPage from "./pages/OlapPage";
import ReportPage from "./pages/ReportPage";

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dataset" element={<DatasetUploadPage />} />
            <Route path="/preprocessing" element={<PreprocessingPage />} />
            <Route path="/clustering" element={<ClusteringPage />} />
            <Route path="/classification" element={<ClassificationPage />} />
            <Route path="/association" element={<AssociationPage />} />
            <Route path="/recommendations" element={<RecommendationPage />} />
            <Route path="/warehouse" element={<DataWarehousePage />} />
            <Route path="/olap" element={<OlapPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
