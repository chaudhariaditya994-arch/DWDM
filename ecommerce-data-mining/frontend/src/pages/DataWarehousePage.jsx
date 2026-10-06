import React, { useState, useEffect } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Database,
  Key,
  Link,
  Layers,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";

export const DataWarehousePage = () => {
  const [loading, setLoading] = useState(true);
  const [schemaData, setSchemaData] = useState(null);
  const [activeTable, setActiveTable] = useState("sales_fact");

  useEffect(() => {
    const fetchSchema = async () => {
      setLoading(true);
      try {
        const res = await api.getWarehouseSchema();
        setSchemaData(res.data);
      } catch (err) {
        console.error("Failed to load warehouse schema:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, []);

  if (loading && !schemaData) {
    return <LoadingSpinner message="Inspecting data warehouse Star Schema metadata..." />;
  }

  const fact = schemaData?.fact_table;
  const dims = schemaData?.dimension_tables || [];
  const dimCustomer = dims.find((d) => d.name === "customers");
  const dimProduct = dims.find((d) => d.name === "products");
  const dimStore = dims.find((d) => d.name === "stores");
  const dimTime = dims.find((d) => d.name === "time_dimension");

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Warehouse Architecture: Star Schema</h1>
          <p className="page-subtitle">
            Multidimensional database model featuring a central fact table surrounded by 4 de-normalized dimension tables for high-performance OLAP queries.
          </p>
        </div>
      </div>

      {/* Visual Star Schema Topology Diagram */}
      <div className="card star-schema-visual-card">
        <div className="card-header flex-between">
          <h3 className="card-title text-indigo-700">Visual Star Schema Architectural Topology</h3>
          <span className="badge badge-indigo">1 Fact Table • 4 Dimensions</span>
        </div>

        <div className="star-schema-diagram">
          {/* Top: Dim_Customer */}
          <div className="diagram-row top-row">
            <div
              className={`table-node dim-node ${activeTable === "customers" ? "node-active" : ""}`}
              onClick={() => setActiveTable("customers")}
            >
              <div className="node-header">
                <Database size={15} /> Dim_Customer
              </div>
              <div className="node-body">
                <span className="node-pk"><Key size={11} /> customer_id (PK)</span>
                <span>name, age, gender, location</span>
              </div>
            </div>
          </div>

          <div className="connector-vertical">
            <div className="connector-line"></div>
            <span className="connector-label">1 : N</span>
          </div>

          {/* Middle Row: Dim_Product <---> Fact_Sales <---> Dim_Store */}
          <div className="diagram-row middle-row">
            <div
              className={`table-node dim-node ${activeTable === "products" ? "node-active" : ""}`}
              onClick={() => setActiveTable("products")}
            >
              <div className="node-header">
                <Database size={15} /> Dim_Product
              </div>
              <div className="node-body">
                <span className="node-pk"><Key size={11} /> product_id (PK)</span>
                <span>product_name, category, price</span>
              </div>
            </div>

            <div className="connector-horizontal">
              <span className="connector-label">1 : N</span>
              <div className="connector-h-line"></div>
            </div>

            {/* Central Fact Table */}
            <div
              className={`table-node fact-node ${activeTable === "sales_fact" ? "node-active" : ""}`}
              onClick={() => setActiveTable("sales_fact")}
            >
              <div className="node-header fact-header">
                <Sparkles size={16} /> Fact_Sales (Central Fact)
              </div>
              <div className="node-body">
                <div className="node-pk font-bold"><Key size={12} /> sales_id (PK)</div>
                <div className="fact-fks">
                  <span><Link size={10} /> customer_id (FK)</span>
                  <span><Link size={10} /> product_id (FK)</span>
                  <span><Link size={10} /> store_id (FK)</span>
                  <span><Link size={10} /> time_id (FK)</span>
                </div>
                <div className="fact-measures">
                  <span className="measure-tag">∑ quantity</span>
                  <span className="measure-tag">∑ total_amount</span>
                </div>
              </div>
            </div>

            <div className="connector-horizontal">
              <div className="connector-h-line"></div>
              <span className="connector-label">N : 1</span>
            </div>

            <div
              className={`table-node dim-node ${activeTable === "stores" ? "node-active" : ""}`}
              onClick={() => setActiveTable("stores")}
            >
              <div className="node-header">
                <Database size={15} /> Dim_Store
              </div>
              <div className="node-body">
                <span className="node-pk"><Key size={11} /> store_id (PK)</span>
                <span>store_name, region</span>
              </div>
            </div>
          </div>

          <div className="connector-vertical">
            <span className="connector-label">N : 1</span>
            <div className="connector-line"></div>
          </div>

          {/* Bottom Row: Dim_Time */}
          <div className="diagram-row bottom-row">
            <div
              className={`table-node dim-node ${activeTable === "time_dimension" ? "node-active" : ""}`}
              onClick={() => setActiveTable("time_dimension")}
            >
              <div className="node-header">
                <Database size={15} /> Dim_Time
              </div>
              <div className="node-body">
                <span className="node-pk"><Key size={11} /> time_id (PK)</span>
                <span>date, day, month, quarter, year</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Table Schema Details Inspector */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="card-title">Table Metadata Inspector: {activeTable.toUpperCase()}</h3>
            <p className="card-sub">
              {activeTable === "sales_fact"
                ? "Central numerical fact table storing quantitative business events and transactions."
                : "Contextual dimension table providing filtering, slicing, and drill-down attributes."}
            </p>
          </div>
          <div className="table-switch-pills">
            {["sales_fact", "customers", "products", "stores", "time_dimension"].map((tbl) => (
              <button
                key={tbl}
                className={`pill-btn ${activeTable === tbl ? "pill-btn-active" : ""}`}
                onClick={() => setActiveTable(tbl)}
              >
                {tbl}
              </button>
            ))}
          </div>
        </div>

        {activeTable === "sales_fact" ? (
          <div className="schema-details-grid">
            <div className="schema-spec-box">
              <h4 className="spec-title">Primary & Foreign Keys</h4>
              <ul className="spec-list">
                <li>
                  <Key size={14} className="text-amber-500" />
                  <strong>sales_id:</strong> Primary Key (Unique event identifier)
                </li>
                {fact?.foreign_keys?.map((fk, idx) => (
                  <li key={idx}>
                    <Link size={14} className="text-indigo-500" />
                    <strong>{fk.column}:</strong> References {fk.references}
                  </li>
                ))}
              </ul>
            </div>

            <div className="schema-spec-box">
              <h4 className="spec-title">Measures / Facts (Additive Metrics)</h4>
              <ul className="spec-list">
                {fact?.measures?.map((m, idx) => (
                  <li key={idx}>
                    <span className="badge badge-emerald">{m.type}</span>
                    <strong>{m.name}:</strong> {m.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attribute Name</th>
                  <th>SQL Data Type</th>
                  <th>Key Constraint</th>
                </tr>
              </thead>
              <tbody>
                {dims
                  .find((d) => d.name === activeTable)
                  ?.attributes?.map((attr, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-gray-800">{attr.name}</td>
                      <td className="font-mono text-xs">{attr.type}</td>
                      <td>
                        {attr.key === "PK" ? (
                          <span className="badge badge-amber">PRIMARY KEY</span>
                        ) : (
                          <span className="text-gray-400">Dimension Attribute</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Academic Viva DWDM Notes Card */}
      <div className="card academic-note-card">
        <div className="academic-note-header">
          <Info size={20} className="text-indigo-600" />
          <h4 className="font-bold text-gray-900">Academic Notes: Why Star Schema for E-Commerce?</h4>
        </div>
        <div className="academic-note-body">
          <p>
            <strong>1. De-normalization for Query Speed:</strong> In standard 3NF relational databases, answering queries like "Monthly Sales by Region" requires joining 5+ normalized tables. The Star Schema de-normalizes dimensions, minimizing JOIN operations and accelerating OLAP aggregations.
          </p>
          <p>
            <strong>2. Star Schema vs. Snowflake Schema:</strong> Unlike Snowflake schemas which normalize dimensions into secondary hierarchy tables (e.g. splitting Store into Store & City & Region), the Star Schema keeps dimension tables completely flat for intuitive slice-and-dice operations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataWarehousePage;
