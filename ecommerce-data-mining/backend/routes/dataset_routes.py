import io
import pandas as pd
from flask import Blueprint, request, jsonify
from dataset_manager import get_current_dataset, set_current_dataset, reset_to_sample_dataset
from algorithms.preprocessing import detect_dataset_health

dataset_bp = Blueprint("dataset", __name__)

@dataset_bp.route("/api/dataset/upload", methods=["POST"])
def upload_dataset():
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported"}), 400

    try:
        df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8", errors="replace")))
        if df.empty:
            return jsonify({"error": "Uploaded CSV file is empty"}), 400

        set_current_dataset(df)
        stats = detect_dataset_health(df)
        return jsonify({
            "message": "Dataset uploaded and parsed successfully",
            "filename": file.filename,
            "statistics": stats
        })
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV: {str(e)}"}), 500

@dataset_bp.route("/api/dataset/reset", methods=["POST"])
def reset_dataset():
    try:
        df = reset_to_sample_dataset()
        stats = detect_dataset_health(df)
        return jsonify({
            "message": "Reset to realistic academic sample sales dataset successfully",
            "statistics": stats
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dataset_bp.route("/api/dataset/preview", methods=["GET"])
def preview_dataset():
    try:
        limit = int(request.args.get("limit", 20))
        offset = int(request.args.get("offset", 0))
        df = get_current_dataset()
        
        total_rows = len(df)
        sub_df = df.iloc[offset:offset + limit]
        
        # Replace NaN with empty string or None for JSON serialization
        rows = sub_df.fillna("").to_dict(orient="records")
        columns = list(df.columns)

        return jsonify({
            "total_rows": total_rows,
            "columns": columns,
            "limit": limit,
            "offset": offset,
            "rows": rows
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dataset_bp.route("/api/dataset/statistics", methods=["GET"])
def dataset_statistics():
    try:
        df = get_current_dataset()
        health = detect_dataset_health(df)
        return jsonify(health)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
