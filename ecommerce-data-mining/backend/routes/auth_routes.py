from flask import Blueprint, request, jsonify
from database.connection import execute_query

auth_bp = Blueprint("auth", __name__)

DEMO_USERS = {
    "admin@ecommerce.com": {"id": 1, "name": "System Administrator", "password": "admin123", "role": "admin"},
    "analyst@ecommerce.com": {"id": 2, "name": "Data Analyst", "password": "analyst123", "role": "analyst"},
    "student@ecommerce.com": {"id": 3, "name": "Student Demo", "password": "student123", "role": "user"}
}

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Query users from database
        try:
            query = "SELECT * FROM users WHERE email = :email"
            df = execute_query(query, {"email": email})
            if not df.empty:
                user_row = df.iloc[0]
                if str(user_row.get("password")) == str(password):
                    u_id = int(user_row.get("id", 1))
                    return jsonify({
                        "message": "Login successful",
                        "user": {
                            "id": u_id,
                            "name": str(user_row.get("name", "User")),
                            "email": str(user_row.get("email", email)),
                            "role": str(user_row.get("role", "admin"))
                        },
                        "token": f"jwt_mock_token_{u_id}_ecommerce_dwdm"
                    })
                else:
                    return jsonify({"error": "Invalid password"}), 401
        except Exception as db_err:
            print(f"[Auth] DB query note: {db_err}")

        # Check demo fallback dictionary
        if email in DEMO_USERS:
            user_data = DEMO_USERS[email]
            if user_data["password"] == password:
                return jsonify({
                    "message": "Login successful",
                    "user": {
                        "id": user_data["id"],
                        "name": user_data["name"],
                        "email": email,
                        "role": user_data["role"]
                    },
                    "token": f"jwt_mock_token_{user_data['id']}_ecommerce_dwdm"
                })
            else:
                return jsonify({"error": "Invalid password"}), 401

        return jsonify({"error": "User with this email does not exist"}), 404
    except Exception as e:
        return jsonify({"error": f"Authentication exception: {str(e)}"}), 500
