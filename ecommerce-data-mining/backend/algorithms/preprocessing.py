import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler, LabelEncoder

def detect_dataset_health(df):
    """Calculates statistics: missing values, duplicates, dtypes, column summary"""
    missing_counts = df.isna().sum().to_dict()
    # also detect empty strings as missing
    empty_str_counts = (df == "").sum().to_dict()
    total_missing = {col: int(missing_counts.get(col, 0) + empty_str_counts.get(col, 0)) for col in df.columns}
    
    dtypes = {col: str(df[col].dtype) for col in df.columns}
    duplicates_count = int(df.duplicated().sum())
    
    summary = []
    for col in df.columns:
        summary.append({
            "column": col,
            "dtype": dtypes[col],
            "missing": total_missing[col],
            "missing_pct": round((total_missing[col] / len(df)) * 100, 2) if len(df) > 0 else 0,
            "unique": int(df[col].nunique())
        })
        
    return {
        "total_records": len(df),
        "total_columns": len(df.columns),
        "total_duplicates": duplicates_count,
        "total_missing_cells": sum(total_missing.values()),
        "columns_summary": summary
    }

def compute_distributions(df, numeric_cols=None):
    """Computes histogram bins and boxplot stats for visualization"""
    if numeric_cols is None:
        numeric_cols = ["age", "total_spending", "days_since_last_purchase", "previous_purchases", "quantity"]
        
    charts = {}
    for col in numeric_cols:
        if col in df.columns:
            series = pd.to_numeric(df[col], errors="coerce").dropna()
            if len(series) > 0:
                # Histogram (10 bins)
                counts, bin_edges = np.histogram(series, bins=10)
                hist_data = [
                    {
                        "bin": f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}",
                        "count": int(counts[i]),
                        "mid": round((bin_edges[i] + bin_edges[i+1]) / 2, 1)
                    }
                    for i in range(len(counts))
                ]
                
                # Boxplot statistics
                q1 = float(np.percentile(series, 25))
                median = float(np.percentile(series, 50))
                q3 = float(np.percentile(series, 75))
                iqr = q3 - q1
                min_val = float(max(series.min(), q1 - 1.5 * iqr))
                max_val = float(min(series.max(), q3 + 1.5 * iqr))
                
                charts[col] = {
                    "histogram": hist_data,
                    "boxplot": {
                        "min": round(min_val, 2),
                        "q1": round(q1, 2),
                        "median": round(median, 2),
                        "q3": round(q3, 2),
                        "max": round(max_val, 2),
                        "mean": round(float(series.mean()), 2),
                        "std": round(float(series.std()), 2)
                    }
                }
    return charts

def run_preprocessing_pipeline(df_raw, config=None):
    """
    Executes complete Data Preprocessing:
    - Missing value imputation / dropping
    - Duplicate removal
    - Outlier capping (IQR method)
    - Categorical Encoding
    - Normalization / Standardization
    - Discretization (Binning)
    - Feature Selection
    """
    if config is None:
        config = {
            "imputation_strategy": "median_mode",  # "median_mode", "mean", "drop"
            "handle_outliers": True,
            "scaling": "standard",  # "standard", "minmax", "none"
            "discretize_age": True,
            "discretize_spending": True
        }

    # 1. Capture BEFORE state
    before_stats = detect_dataset_health(df_raw)
    before_charts = compute_distributions(df_raw)

    df = df_raw.copy()

    # Convert empty strings to NaN
    df.replace("", np.nan, inplace=True)

    # 2. Duplicate Removal
    initial_dupes = int(df.duplicated().sum())
    df.drop_duplicates(inplace=True)

    # 3. Missing Value Handling
    imputation_strategy = config.get("imputation_strategy", "median_mode")
    if imputation_strategy == "drop":
        df.dropna(inplace=True)
    else:
        for col in df.columns:
            if df[col].isna().sum() > 0:
                if pd.api.types.is_numeric_dtype(df[col]):
                    if imputation_strategy == "mean":
                        val = df[col].mean()
                    else:  # median
                        val = df[col].median()
                    df[col] = df[col].fillna(val)
                else:
                    # Categorical: fill with mode
                    mode_val = df[col].mode()
                    val = mode_val[0] if len(mode_val) > 0 else "Unknown"
                    df[col] = df[col].fillna(val)

    # 4. Outlier Handling via IQR (Tukey's method)
    outliers_handled = {}
    if config.get("handle_outliers", True):
        num_cols = ["age", "total_spending", "days_since_last_purchase", "previous_purchases"]
        for col in num_cols:
            if col in df.columns:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                num_outliers = int(((df[col] < lower) | (df[col] > upper)).sum())
                outliers_handled[col] = num_outliers
                # Capping / Winsorizing
                df[col] = np.clip(df[col], lower, upper)

    # 5. Discretization / Binning
    if config.get("discretize_age", True) and "age" in df.columns:
        # Age bins: Youth (<30), Middle-aged (30-45), Senior (>45)
        df["age_group"] = pd.cut(
            df["age"],
            bins=[0, 30, 45, 120],
            labels=["Youth (18-30)", "Middle-Aged (31-45)", "Senior (46+)"]
        ).astype(str)

    if config.get("discretize_spending", True) and "total_spending" in df.columns:
        # Spending tiers: Low, Medium, High
        df["spending_tier"] = pd.qcut(
            df["total_spending"],
            q=3,
            labels=["Low Spender", "Medium Spender", "High Spender"],
            duplicates="drop"
        ).astype(str)

    # 6. Categorical Encoding (Label Encoding for pipeline use)
    encoded_columns = {}
    le_map = {}
    cat_cols = ["gender", "category", "region"]
    for col in cat_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[f"{col}_encoded"] = le.fit_transform(df[col].astype(str))
            le_map[col] = {label: int(code) for label, code in zip(le.classes_, range(len(le.classes_)))}
            encoded_columns[col] = f"{col}_encoded"

    # 7. Normalization / Standardization
    scaling_type = config.get("scaling", "standard")
    scaled_cols = {}
    features_to_scale = ["total_spending", "days_since_last_purchase", "purchase_frequency"]
    features_present = [f for f in features_to_scale if f in df.columns]

    if scaling_type == "minmax":
        scaler = MinMaxScaler()
        scaled_vals = scaler.fit_transform(df[features_present])
        for idx, col in enumerate(features_present):
            df[f"{col}_minmax"] = scaled_vals[:, idx]
            scaled_cols[col] = f"{col}_minmax"
    elif scaling_type == "standard":
        scaler = StandardScaler()
        scaled_vals = scaler.fit_transform(df[features_present])
        for idx, col in enumerate(features_present):
            df[f"{col}_std"] = scaled_vals[:, idx]
            scaled_cols[col] = f"{col}_std"

    # 8. Feature Selection: correlation with target 'likely_to_purchase_again'
    feature_correlations = []
    if "likely_to_purchase_again" in df.columns:
        numeric_sub = df.select_dtypes(include=[np.number])
        corr_series = numeric_sub.corr()["likely_to_purchase_again"].drop("likely_to_purchase_again", errors="ignore")
        for col, val in corr_series.items():
            if not np.isnan(val):
                feature_correlations.append({
                    "feature": col,
                    "correlation": round(float(val), 4),
                    "impact": "Strong Positive" if val > 0.4 else "Moderate Positive" if val > 0.1 else "Strong Negative" if val < -0.4 else "Moderate Negative" if val < -0.1 else "Weak/Neutral"
                })
        feature_correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)

    # 9. Capture AFTER state
    after_stats = detect_dataset_health(df)
    after_charts = compute_distributions(df)

    preview_rows = df.head(15).to_dict(orient="records")

    return {
        "before": {
            "stats": before_stats,
            "charts": before_charts
        },
        "after": {
            "stats": after_stats,
            "charts": after_charts
        },
        "details": {
            "duplicates_removed": initial_dupes,
            "outliers_handled": outliers_handled,
            "imputation_strategy": imputation_strategy,
            "scaling_applied": scaling_type,
            "encoded_columns": encoded_columns,
            "encoding_mappings": le_map,
            "feature_correlations": feature_correlations
        },
        "preview": preview_rows,
        "processed_df": df
    }
