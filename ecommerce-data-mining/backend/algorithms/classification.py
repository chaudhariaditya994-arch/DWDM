import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Global storage for trained models and transformers
_models = {}
_scaler = None
_label_encoders = {}
_feature_names = []

def train_and_compare_models(df):
    """
    Trains Decision Tree, Naive Bayes, KNN, and Random Forest.
    Calculates Accuracy, Precision, Recall, F1 Score, and Confusion Matrix.
    """
    global _models, _scaler, _label_encoders, _feature_names

    req_cols = ["age", "gender", "location", "previous_purchases", "total_spending", 
                "purchase_frequency", "days_since_last_purchase", "likely_to_purchase_again"]
    
    clean_df = df.dropna(subset=[c for c in req_cols if c in df.columns]).copy()
    
    # Encoders
    _label_encoders = {
        "gender": LabelEncoder(),
        "location": LabelEncoder()
    }
    
    clean_df["gender_enc"] = _label_encoders["gender"].fit_transform(clean_df["gender"].astype(str))
    clean_df["location_enc"] = _label_encoders["location"].fit_transform(clean_df["location"].astype(str))
    
    features = ["age", "gender_enc", "location_enc", "previous_purchases", "total_spending", 
                "purchase_frequency", "days_since_last_purchase"]
    _feature_names = features
    
    X = clean_df[features].values
    y = clean_df["likely_to_purchase_again"].astype(int).values

    # Train / Test Split 80/20
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    _scaler = StandardScaler()
    X_train_scaled = _scaler.fit_transform(X_train)
    X_test_scaled = _scaler.transform(X_test)

    # Initialize Classifiers
    candidate_models = {
        "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
        "Naive Bayes": GaussianNB(),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    }

    comparison_results = []
    _models = {}

    for name, clf in candidate_models.items():
        clf.fit(X_train_scaled, y_train)
        y_pred = clf.predict(X_test_scaled)
        _models[name] = clf

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)

        # CM format: [[TN, FP], [FN, TP]]
        tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (0, 0, 0, 0)

        comparison_results.append({
            "model": name,
            "accuracy": round(float(acc) * 100, 2),
            "precision": round(float(prec) * 100, 2),
            "recall": round(float(rec) * 100, 2),
            "f1_score": round(float(f1) * 100, 2),
            "confusion_matrix": {
                "tp": int(tp),
                "tn": int(tn),
                "fp": int(fp),
                "fn": int(fn),
                "matrix": cm.tolist()
            }
        })

    # Find best model based on F1
    best_model = max(comparison_results, key=lambda m: m["f1_score"])

    return {
        "models_comparison": comparison_results,
        "best_model": best_model["model"],
        "test_size": len(y_test),
        "training_size": len(y_train),
        "locations_available": list(_label_encoders["location"].classes_),
        "genders_available": list(_label_encoders["gender"].classes_)
    }

def predict_single_customer(customer_data, model_choice="Random Forest"):
    """
    Accepts customer profile parameters and outputs real-time prediction
    """
    global _models, _scaler, _label_encoders, _feature_names

    if not _models:
        raise ValueError("Models are not trained yet. Please train models first.")

    clf = _models.get(model_choice) or _models.get("Random Forest") or list(_models.values())[0]

    # Encode gender and location safely with fallback
    gender_str = str(customer_data.get("gender", "Female"))
    loc_str = str(customer_data.get("location", "Mumbai"))

    try:
        gender_enc = int(_label_encoders["gender"].transform([gender_str])[0])
    except Exception:
        gender_enc = 0

    try:
        loc_enc = int(_label_encoders["location"].transform([loc_str])[0])
    except Exception:
        loc_enc = 0

    raw_features = [
        float(customer_data.get("age", 30)),
        gender_enc,
        loc_enc,
        float(customer_data.get("previous_purchases", 5)),
        float(customer_data.get("total_spending", 2500)),
        float(customer_data.get("purchase_frequency", 1.2)),
        float(customer_data.get("days_since_last_purchase", 15))
    ]

    scaled = _scaler.transform([raw_features])
    pred = int(clf.predict(scaled)[0])
    
    # Calculate probability if model supports it
    prob_percent = 85.0
    if hasattr(clf, "predict_proba"):
        probs = clf.predict_proba(scaled)[0]
        prob_percent = round(float(probs[pred]) * 100, 1)

    all_predictions = {}
    for name, m in _models.items():
        p = int(m.predict(scaled)[0])
        p_pct = 80.0
        if hasattr(m, "predict_proba"):
            p_pct = round(float(m.predict_proba(scaled)[0][p]) * 100, 1)
        all_predictions[name] = {
            "prediction": "Likely to Purchase Again" if p == 1 else "Unlikely to Purchase Again",
            "confidence": p_pct
        }

    return {
        "model_used": model_choice,
        "prediction": "Likely to Purchase Again" if pred == 1 else "Unlikely to Purchase Again",
        "is_likely": pred == 1,
        "confidence": prob_percent,
        "all_models_consensus": all_predictions,
        "input_summary": customer_data
    }
