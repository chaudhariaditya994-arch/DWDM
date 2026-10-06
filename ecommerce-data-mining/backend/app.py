import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_database, get_db_status
from routes.auth_routes import auth_bp
from routes.dataset_routes import dataset_bp
from routes.mining_routes import mining_bp
from routes.analytics_routes import analytics_bp

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for seamless cross-origin communication with Vite React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database & Star Schema
    print("[Server] Initializing database and star schema...")
    try:
        init_database()
    except Exception as e:
        print(f"[Server] Database initialization warning: {e}")

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dataset_bp)
    app.register_blueprint(mining_bp)
    app.register_blueprint(analytics_bp)

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "project": "E-Commerce Customer Intelligence & Product Recommendation System",
            "course": "Data Mining and Data Warehousing (DWDM)",
            "status": "Online and Operational",
            "db_status": get_db_status()
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "database": get_db_status()
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Requested API route not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error occurred", "details": str(e)}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"\n=======================================================")
    print(f"  E-COMMERCE DWDM BACKEND API SERVER RUNNING")
    print(f"  Base URL: http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=True)
