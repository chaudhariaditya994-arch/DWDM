import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Sparkles,
  ShoppingBag,
  User,
  Plus,
  Trash2,
  ArrowRight,
  TrendingUp,
  Tag,
  Star,
  Check
} from "lucide-react";

const SAMPLE_PRODUCTS = [
  "Bread", "Butter", "Milk", "Tea", "Biscuits", "Coffee", "Sugar", "Snacks",
  "Laptop", "Wireless Mouse", "Smartphone", "Screen Protector", "Phone Case",
  "Headphones", "Running Shoes", "Socks", "Camera", "Memory Card", "Shampoo", "Conditioner"
];

const SAMPLE_CUSTOMERS = [
  { id: "C0001", name: "Aarav Sharma (Mumbai)" },
  { id: "C0002", name: "Diya Patel (Ahmedabad)" },
  { id: "C0003", name: "Rohan Gupta (Delhi)" },
  { id: "C0004", name: "Ananya Iyer (Bengaluru)" },
  { id: "C0005", name: "Vikram Singh (Jaipur)" },
  { id: "C0006", name: "Pooja Nair (Kochi)" },
];

export const RecommendationPage = () => {
  const { addToast } = useToast();
  const [mode, setMode] = useState("cart"); // "cart" or "customer"
  const [selectedCustomerId, setSelectedCustomerId] = useState("C0001");
  const [cartItems, setCartItems] = useState(["Tea", "Biscuits"]);
  const [recommendations, setRecommendations] = useState([]);
  const [customerMeta, setCustomerMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let res;
      if (mode === "customer") {
        res = await api.getCustomerRecommendations(selectedCustomerId);
      } else {
        res = await api.getRecommendations({ products: cartItems });
      }
      setRecommendations(res.data.recommendations || []);
      setCustomerMeta(res.data.customer || null);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [mode, selectedCustomerId]);

  const handleAddToCart = (productName) => {
    if (!cartItems.includes(productName)) {
      setCartItems([...cartItems, productName]);
    }
  };

  const handleRemoveFromCart = (productName) => {
    setCartItems(cartItems.filter((i) => i !== productName));
  };

  const handleApplyCart = () => {
    fetchRecommendations();
    addToast("Recommendations updated based on cart items!", "info");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personalized Product Recommendation Engine</h1>
          <p className="page-subtitle">
            Hybrid recommender system leveraging market basket association rules, antecedent itemsets, and customer purchasing history.
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="recommendation-tabs">
        <button
          className={`tab-btn ${mode === "cart" ? "tab-active" : ""}`}
          onClick={() => setMode("cart")}
        >
          <ShoppingBag size={18} /> Recommend by Current Cart Items
        </button>
        <button
          className={`tab-btn ${mode === "customer" ? "tab-active" : ""}`}
          onClick={() => setMode("customer")}
        >
          <User size={18} /> Recommend by Customer Purchase Profile
        </button>
      </div>

      {/* Inputs Configuration Card */}
      <div className="card">
        {mode === "cart" ? (
          <div>
            <h3 className="card-title mb-2">Simulate Customer Shopping Cart</h3>
            <p className="card-sub mb-4">
              Add products to the basket to calculate market basket association rule matches:
            </p>

            <div className="cart-builder-box">
              <div className="current-cart">
                <span className="cart-title">Items Currently in Basket:</span>
                <div className="cart-chips">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <span key={item} className="cart-chip">
                        {item}
                        <button
                          onClick={() => handleRemoveFromCart(item)}
                          className="chip-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Cart is empty. Add products below!</span>
                  )}
                </div>
              </div>

              <div className="cart-quick-add">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  Quick Add Products:
                </span>
                <div className="product-quick-grid">
                  {SAMPLE_PRODUCTS.map((p) => {
                    const inCart = cartItems.includes(p);
                    return (
                      <button
                        key={p}
                        className={`product-tag-btn ${inCart ? "tag-selected" : ""}`}
                        onClick={() => (inCart ? handleRemoveFromCart(p) : handleAddToCart(p))}
                      >
                        {inCart ? <Check size={13} /> : <Plus size={13} />}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex-end">
                <button
                  className="btn btn-primary"
                  onClick={handleApplyCart}
                  disabled={loading || cartItems.length === 0}
                >
                  <Sparkles size={16} /> Generate Recommendations
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="card-title mb-2">Select Target Customer Profile</h3>
            <p className="card-sub mb-4">
              Inspect past purchase transactions from Dim_Customer and generate personalized items:
            </p>
            <div className="customer-select-box">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="form-select max-w-md"
              >
                {SAMPLE_CUSTOMERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.name}
                  </option>
                ))}
              </select>

              {customerMeta && (
                <div className="customer-meta-strip">
                  <div className="cm-item">
                    <span className="cm-k">Customer:</span>
                    <span className="cm-v">{customerMeta.name}</span>
                  </div>
                  <div className="cm-item">
                    <span className="cm-k">Past Purchases:</span>
                    <span className="cm-v">{customerMeta.past_purchases?.join(", ") || "None"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Results Section */}
      <div className="recommendations-section">
        <div className="section-header-row">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-purple-600" />
            <h2 className="section-title">Recommended Products: "You May Also Like"</h2>
          </div>
          <span className="badge badge-purple">{recommendations.length} Recommendations Found</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Calculating matching antecedents and confidence weights..." />
        ) : recommendations.length > 0 ? (
          <div className="recommendations-grid">
            {recommendations.map((item, idx) => (
              <div key={idx} className="recommendation-card">
                <div className="rec-card-top">
                  <span className="rec-category-badge">{item.category}</span>
                  <div className="rec-confidence-pill">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{item.score}% Match</span>
                  </div>
                </div>

                <h3 className="rec-product-name">{item.product_name}</h3>
                <div className="rec-price">₹{item.price?.toLocaleString()}</div>

                <div className="rec-reason-box">
                  <span className="reason-label">Association Rationale:</span>
                  <p className="reason-text">{item.reason}</p>
                </div>

                <div className="rec-footer-stats">
                  <span className="r-stat">Confidence: {item.confidence_pct}%</span>
                  <span className="r-stat">Lift: {item.lift}x</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-recommendations card text-center py-8">
            <ShoppingBag size={42} className="text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-700">No matching association rules found</h4>
            <p className="text-gray-500 text-sm">
              Try adding more complementary items to your cart or select a different customer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationPage;
