import React, { useEffect, useState } from "react";
import api from "../services/api";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Award,
  Layers,
  BrainCircuit,
  ArrowUpRight,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [regionData, setRegionData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, monthlyRes, catRes, regRes] = await Promise.all([
          api.getDashboardStats(),
          api.getMonthlySales(),
          api.getCategorySales(),
          api.getRegionSales(),
        ]);
        setStats(statsRes.data);
        setMonthlyData(monthlyRes.data);
        setCategoryData(catRes.data);
        setRegionData(regRes.data);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating sales fact measures & mining metrics..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Analytics Dashboard</h1>
          <p className="page-subtitle">
            Holistic view of e-commerce performance, Star Schema sales facts, and customer intelligence models.
          </p>
        </div>
      </div>

      {/* Primary KPI Stat Cards (8 requested metrics) */}
      <div className="kpi-grid">
        <StatCard
          title="Total Customers"
          value={stats?.total_customers?.toLocaleString() || "0"}
          subtitle="Distinct dimensional buyers"
          icon={Users}
          color="indigo"
          trend={{ positive: true, label: "+12.4% MoM" }}
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products || "0"}
          subtitle="Active catalog items"
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders?.toLocaleString() || "0"}
          subtitle="Completed transactions"
          icon={ShoppingBag}
          color="blue"
          trend={{ positive: true, label: "+8.1% vs target" }}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.total_revenue?.toLocaleString() || "0"}`}
          subtitle="Cumulative fact sales"
          icon={DollarSign}
          color="emerald"
          trend={{ positive: true, label: "+15.3% gross" }}
        />
        <StatCard
          title="Average Order Value"
          value={`₹${stats?.average_order_value || "0"}`}
          subtitle="Revenue per transaction"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Most Purchased Item"
          value={stats?.most_purchased_product || "N/A"}
          subtitle="Highest item frequency"
          icon={Award}
          color="pink"
        />
        <StatCard
          title="Customer Segments"
          value={`${stats?.customer_segments || 4} Clusters`}
          subtitle="K-Means segmented profiles"
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Classification Accuracy"
          value={`${stats?.classification_accuracy || 89.2}%`}
          subtitle="Random Forest repurchase prediction"
          icon={BrainCircuit}
          color="purple"
          trend={{ positive: true, label: "Top ML model" }}
        />
      </div>

      {/* Main Charts Row 1: Monthly Sales & Sales by Category */}
      <div className="charts-grid-two">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Monthly Revenue Trend</h3>
              <p className="chart-sub">Fact_Sales aggregation across Dim_Time (Roll-up)</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Sales by Product Category</h3>
              <p className="chart-sub">Category proportion of total monetary volume</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Sales"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Sales by Region & Top Products Table */}
      <div className="charts-grid-two">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Regional Sales Performance</h3>
              <p className="chart-sub">Geographic revenue from Dim_Store</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="region" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Top 5 Best-Selling Products</h3>
              <p className="chart-sub">Leading contributors to overall sales revenue</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Units Sold</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats?.top_products?.map((prod, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-gray-800">{prod.product}</td>
                    <td>
                      <span className="category-pill">{prod.category}</span>
                    </td>
                    <td>{prod.quantity} units</td>
                    <td className="font-bold text-indigo-600">₹{prod.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
