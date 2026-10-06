import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

def assign_cluster_labels(centroids_df):
    """
    Assigns human-readable academic business labels to clusters based on feature profiles:
    - High Spending & High Frequency -> Premium VIP Customers
    - Medium Spending & High Frequency -> Regular Loyal Customers
    - High Recency (Days Since Last Purchase) -> Inactive / At-Risk Customers
    - Lower Spending & Low Frequency -> Occasional / Budget Shoppers
    """
    labels = {}
    spending_median = centroids_df["total_spending"].median()
    recency_median = centroids_df["days_since_last_purchase"].median()
    freq_median = centroids_df["purchase_frequency"].median()

    for idx, row in centroids_df.iterrows():
        spend = row["total_spending"]
        rec = row["days_since_last_purchase"]
        freq = row["purchase_frequency"]

        if spend >= spending_median and freq >= freq_median and rec <= recency_median:
            labels[idx] = "Premium VIP Customers"
        elif freq >= freq_median and rec <= recency_median:
            labels[idx] = "Regular Loyal Customers"
        elif rec > recency_median and spend < spending_median:
            labels[idx] = "Occasional / Budget Shoppers"
        elif rec > recency_median:
            labels[idx] = "At-Risk / Dormant Customers"
        elif spend >= spending_median:
            labels[idx] = "High-Value Emerging Customers"
        else:
            labels[idx] = f"Cluster {idx + 1} (General Segment)"
            
    # Ensure all labels are unique by appending number if duplicated
    seen = {}
    unique_labels = {}
    for idx, lbl in labels.items():
        if lbl in seen:
            seen[lbl] += 1
            unique_labels[idx] = f"{lbl} (Group {seen[lbl]})"
        else:
            seen[lbl] = 1
            unique_labels[idx] = lbl
            
    return unique_labels

def run_kmeans_clustering(df, n_clusters=4):
    """
    Executes K-Means Clustering on customer profile records.
    Features: age, previous_purchases, total_spending, purchase_frequency, days_since_last_purchase
    """
    features = ["age", "previous_purchases", "total_spending", "purchase_frequency", "days_since_last_purchase"]
    clean_df = df.dropna(subset=features).copy()
    
    # If customer_id is present, aggregate to unique customer level for pure customer intelligence
    if "customer_id" in clean_df.columns:
        agg_rules = {
            "age": "mean",
            "previous_purchases": "max",
            "total_spending": "max",
            "purchase_frequency": "mean",
            "days_since_last_purchase": "min"
        }
        if "customer_name" in clean_df.columns:
            agg_rules["customer_name"] = "first"
        cust_df = clean_df.groupby("customer_id").agg(agg_rules).reset_index()
    else:
        cust_df = clean_df.copy()

    X = cust_df[features].values
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Fit requested K-Means
    k = max(2, min(n_clusters, 8))
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_assignments = kmeans.fit_predict(X_scaled)
    cust_df["cluster"] = cluster_assignments

    # Calculate Silhouette Score
    score = float(silhouette_score(X_scaled, cluster_assignments))

    # Calculate Elbow Curve (Inertia for K=2 to 8)
    elbow_data = []
    for test_k in range(2, 9):
        km_test = KMeans(n_clusters=test_k, random_state=42, n_init=5)
        km_test.fit(X_scaled)
        elbow_data.append({
            "k": test_k,
            "inertia": round(float(km_test.inertia_), 2)
        })

    # PCA 2D Dimensionality Reduction for Visualization
    pca = PCA(n_components=2, random_state=42)
    pca_coords = pca.fit_transform(X_scaled)
    cust_df["pca_x"] = pca_coords[:, 0]
    cust_df["pca_y"] = pca_coords[:, 1]

    # Compute unscaled Centroids & Characteristics
    centroids_df = cust_df.groupby("cluster")[features].mean()
    meaningful_labels = assign_cluster_labels(centroids_df)

    cluster_profiles = []
    for c_id in range(k):
        c_rows = cust_df[cust_df["cluster"] == c_id]
        count = len(c_rows)
        pct = round((count / len(cust_df)) * 100, 1)
        mean_row = centroids_df.loc[c_id]
        
        cluster_profiles.append({
            "cluster_id": int(c_id),
            "label": meaningful_labels.get(c_id, f"Cluster {c_id + 1}"),
            "count": int(count),
            "percentage": pct,
            "avg_age": round(float(mean_row["age"]), 1),
            "avg_purchases": round(float(mean_row["previous_purchases"]), 1),
            "avg_spending": round(float(mean_row["total_spending"]), 2),
            "avg_frequency": round(float(mean_row["purchase_frequency"]), 2),
            "avg_recency": round(float(mean_row["days_since_last_purchase"]), 1)
        })

    # Prepare 2D scatter points (sample up to 200 points for crisp frontend rendering)
    scatter_points = []
    sample_df = cust_df.head(200)
    for _, row in sample_df.iterrows():
        c_id = int(row["cluster"])
        scatter_points.append({
            "customer_id": str(row.get("customer_id", f"ID_{_}")),
            "customer_name": str(row.get("customer_name", "Customer")),
            "x": round(float(row["pca_x"]), 2),
            "y": round(float(row["pca_y"]), 2),
            "cluster": c_id,
            "cluster_label": meaningful_labels.get(c_id, f"Cluster {c_id + 1}"),
            "spending": round(float(row["total_spending"]), 2),
            "age": int(round(row["age"])),
            "recency": int(round(row["days_since_last_purchase"]))
        })

    return {
        "k": k,
        "silhouette_score": round(score, 4),
        "cluster_profiles": cluster_profiles,
        "elbow_curve": elbow_data,
        "scatter_points": scatter_points,
        "pca_variance_ratio": [round(float(v), 4) for v in pca.explained_variance_ratio_]
    }
