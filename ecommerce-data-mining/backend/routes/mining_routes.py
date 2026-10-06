from flask import Blueprint, request, jsonify
from dataset_manager import get_current_dataset
from algorithms.preprocessing import run_preprocessing_pipeline
from algorithms.clustering import run_kmeans_clustering
from algorithms.classification import train_and_compare_models, predict_single_customer
from algorithms.association import run_association_mining, get_cached_rules
from algorithms.recommendation import recommend_products

mining_bp = Blueprint("mining", __name__)

# State caches for results
_cached_preprocessing = None
_cached_clustering = None
_cached_classification = None
_cached_association = None

# ------------------------------------------------------------
# 1. Preprocessing Routes
# ------------------------------------------------------------
@mining_bp.route("/api/preprocessing", methods=["POST"])
def execute_preprocessing():
    global _cached_preprocessing
    try:
        config = request.get_json() or {}
        df = get_current_dataset()
        results = run_preprocessing_pipeline(df, config)
        
        # We don't serialize processed_df into JSON directly
        _cached_preprocessing = {
            "before": results["before"],
            "after": results["after"],
            "details": results["details"],
            "preview": results["preview"]
        }
        return jsonify(_cached_preprocessing)
    except Exception as e:
        return jsonify({"error": f"Preprocessing error: {str(e)}"}), 500

@mining_bp.route("/api/preprocessing/results", methods=["GET"])
def get_preprocessing_results():
    global _cached_preprocessing
    if _cached_preprocessing is None:
        # Run default preprocessing once
        df = get_current_dataset()
        results = run_preprocessing_pipeline(df)
        _cached_preprocessing = {
            "before": results["before"],
            "after": results["after"],
            "details": results["details"],
            "preview": results["preview"]
        }
    return jsonify(_cached_preprocessing)

# ------------------------------------------------------------
# 2. Clustering Routes
# ------------------------------------------------------------
@mining_bp.route("/api/clustering", methods=["POST"])
def execute_clustering():
    global _cached_clustering
    try:
        body = request.get_json() or {}
        k = int(body.get("k", 4))
        df = get_current_dataset()
        results = run_kmeans_clustering(df, n_clusters=k)
        _cached_clustering = results
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"Clustering error: {str(e)}"}), 500

@mining_bp.route("/api/clustering/results", methods=["GET"])
def get_clustering_results():
    global _cached_clustering
    if _cached_clustering is None:
        df = get_current_dataset()
        _cached_clustering = run_kmeans_clustering(df, n_clusters=4)
    return jsonify(_cached_clustering)

# ------------------------------------------------------------
# 3. Classification Routes
# ------------------------------------------------------------
@mining_bp.route("/api/classification/train", methods=["POST"])
def train_classification():
    global _cached_classification
    try:
        df = get_current_dataset()
        results = train_and_compare_models(df)
        _cached_classification = results
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"Classification training error: {str(e)}"}), 500

@mining_bp.route("/api/classification/results", methods=["GET"])
def get_classification_results():
    global _cached_classification
    if _cached_classification is None:
        df = get_current_dataset()
        _cached_classification = train_and_compare_models(df)
    return jsonify(_cached_classification)

@mining_bp.route("/api/classification/predict", methods=["POST"])
def predict_customer():
    try:
        data = request.get_json() or {}
        # Ensure models are trained
        get_classification_results()
        model_choice = data.get("model", "Random Forest")
        prediction = predict_single_customer(data, model_choice=model_choice)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

# ------------------------------------------------------------
# 4. Association Rule Mining Routes
# ------------------------------------------------------------
@mining_bp.route("/api/association/apriori", methods=["POST"])
def execute_apriori():
    global _cached_association
    try:
        data = request.get_json() or {}
        min_sup = float(data.get("min_support", 0.03))
        min_conf = float(data.get("min_confidence", 0.3))
        df = get_current_dataset()
        results = run_association_mining(df, algorithm="apriori", min_support=min_sup, min_confidence=min_conf)
        _cached_association = results
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"Apriori error: {str(e)}"}), 500

@mining_bp.route("/api/association/fpgrowth", methods=["POST"])
def execute_fpgrowth():
    global _cached_association
    try:
        data = request.get_json() or {}
        min_sup = float(data.get("min_support", 0.03))
        min_conf = float(data.get("min_confidence", 0.3))
        df = get_current_dataset()
        results = run_association_mining(df, algorithm="fpgrowth", min_support=min_sup, min_confidence=min_conf)
        _cached_association = results
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"FP-Growth error: {str(e)}"}), 500

@mining_bp.route("/api/association/rules", methods=["GET"])
def get_association_rules():
    global _cached_association
    if _cached_association is None:
        df = get_current_dataset()
        _cached_association = run_association_mining(df, algorithm="apriori", min_support=0.03, min_confidence=0.3)
    return jsonify(_cached_association)

# ------------------------------------------------------------
# 5. Recommendation Routes
# ------------------------------------------------------------
@mining_bp.route("/api/recommendation", methods=["POST"])
def get_recommendations():
    try:
        data = request.get_json() or {}
        selected_prods = data.get("products", [])
        customer_id = data.get("customer_id")
        df = get_current_dataset()
        res = recommend_products(df, selected_products=selected_prods, customer_id=customer_id)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": f"Recommendation error: {str(e)}"}), 500

@mining_bp.route("/api/recommendation/customer/<customer_id>", methods=["GET"])
def get_customer_recommendations(customer_id):
    try:
        df = get_current_dataset()
        res = recommend_products(df, customer_id=customer_id)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": f"Recommendation error: {str(e)}"}), 500
