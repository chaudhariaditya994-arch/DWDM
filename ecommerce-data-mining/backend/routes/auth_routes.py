from flask import Blueprint, request, jsonify
from database.connection import execute_query, execute_statement

auth_bp = Blueprint("auth", __name__)

DEMO_USERS = {
    "admin@ecommerce.com": {"id": 1, "name": "System Administrator", "password": "admin123", "role": "admin"},
    "analyst@ecommerce.com": {"id": 2, "name": "Data Analyst", "password": "analyst123", "role": "analyst"},
    "student@ecommerce.com": {"id": 3, "name": "Student Demo", "password": "student123", "role": "user"}
}

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()
        role = data.get("role", "analyst").strip()

        if not name:
            return jsonify({"error": "Full name is required"}), 400
        if not email or "@" not in email:
            return jsonify({"error": "A valid email address is required"}), 400
        if not password or len(password) < 4:
            return jsonify({"error": "Password must be at least 4 characters"}), 400

        # Check existing user in database
        try:
            df = execute_query("SELECT id, email FROM users WHERE LOWER(email) = :email", {"email": email})
            if not df.empty:
                return jsonify({"error": "An account with this email address already exists"}), 409
        except Exception as check_err:
            print(f"[Auth Register] Check user note: {check_err}")

        # Check demo in-memory store
        if email in DEMO_USERS:
            return jsonify({"error": "An account with this email address already exists"}), 409

        # Insert user into database
        new_id = len(DEMO_USERS) + 101
        try:
            execute_statement(
                "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)",
                {"name": name, "email": email, "password": password, "role": role}
            )
            df_new = execute_query("SELECT id FROM users WHERE LOWER(email) = :email", {"email": email})
            if not df_new.empty:
                new_id = int(df_new.iloc[0]["id"])
        except Exception as ins_err:
            print(f"[Auth Register] DB insert fallback: {ins_err}")

        # Update in-memory cache
        DEMO_USERS[email] = {
            "id": new_id,
            "name": name,
            "password": password,
            "role": role
        }

        return jsonify({
            "message": "Account created successfully! Welcome to the platform.",
            "user": {
                "id": new_id,
                "name": name,
                "email": email,
                "role": role
            },
            "token": f"jwt_mock_token_{new_id}_ecommerce_dwdm"
        }), 201

    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Query users from database
        try:
            query = "SELECT * FROM users WHERE LOWER(email) = :email"
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

