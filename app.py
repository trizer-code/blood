from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
DB_NAME = "blood_bank.db"

# ====================================
# DATABASE HELPER
# ====================================
def query_db(query, params=(), fetch=False):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(query, params)
    if fetch:
        result = cursor.fetchall()
        conn.close()
        return result
    conn.commit()
    conn.close()

def init_db():
    query_db("""
        CREATE TABLE IF NOT EXISTS donors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            blood_type TEXT NOT NULL,
            county TEXT NOT NULL,
            nationality TEXT NOT NULL,
            password TEXT NOT NULL
        )
    """)
    query_db("""
        CREATE TABLE IF NOT EXISTS hospitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hospital_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            county TEXT NOT NULL,
            password TEXT NOT NULL
        )
    """)

# ====================================
# DONOR ROUTES
# ====================================
@app.route("/")
def home():
    return jsonify({"message": "Welcome to Kenya Blood Bank API!"})
@app.route("/donor/register", methods=["POST"])
def donor_register():
    data = request.json
    try:
        hashed_password = generate_password_hash(data["password"])
        query_db("""
            INSERT INTO donors (full_name, email, phone, blood_type, county, nationality, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data["fullName"],
            data["email"],
            data["phone"],
            data["bloodType"],
            data["county"],
            data["nationality"],
            hashed_password
        ))
        return jsonify({"message": "✅ Donor registered successfully!"})
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "❌ Registration failed. Email may already exist."}), 400


@app.route("/donor/login", methods=["POST"])
def donor_login():
    data = request.json
    result = query_db("SELECT password FROM donors WHERE email=?", (data["email"],), fetch=True)

    if result and check_password_hash(result[0][0], data["password"]):
        return jsonify({"message": "✅ Donor login successful!"})
    else:
        return jsonify({"error": "❌ Invalid credentials"}), 401


@app.route("/donor/donations", methods=["POST"])
def donor_donations():
    data = request.json
    email = data.get("email")

    # TODO: Replace with real DB lookup in future
    if email:
        return jsonify({"count": 3})
    else:
        return jsonify({"error": "Missing email"}), 400


@app.route("/donors/search", methods=["GET"])
def donor_search():
    blood_type = request.args.get("bloodType")
    county = request.args.get("county")

    if not blood_type or not county:
        return jsonify({"error": "Missing bloodType or county parameters"}), 400

    result = query_db("""
        SELECT full_name, phone, blood_type, county
        FROM donors
        WHERE blood_type = ? AND LOWER(county) = LOWER(?)
    """, (blood_type, county), fetch=True)

    donors = [
        {"fullName": r[0], "phone": r[1], "bloodType": r[2], "county": r[3]}
        for r in result
    ]

    return jsonify(donors)

# ====================================
# HOSPITAL ROUTES
# ====================================

@app.route("/hospital/register", methods=["POST"])
def hospital_register():
    data = request.json
    try:
        hashed_password = generate_password_hash(data["password"])
        query_db("""
            INSERT INTO hospitals (hospital_name, email, phone, county, password)
            VALUES (?, ?, ?, ?, ?)
        """, (
            data["hospitalName"],
            data["email"],
            data["phone"],
            data["county"],
            hashed_password
        ))
        return jsonify({"message": "✅ Hospital registered successfully!"})
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "❌ Registration failed. Email may already exist."}), 400


@app.route("/hospital/login", methods=["POST"])
def hospital_login():
    data = request.json
    result = query_db("SELECT password, hospital_name FROM hospitals WHERE email=?", (data["email"],), fetch=True)

    if result and check_password_hash(result[0][0], data["password"]):
        return jsonify({
            "message": "✅ Hospital login successful!",
            "hospitalName": result[0][1]
        })
    else:
        return jsonify({"error": "❌ Invalid credentials"}), 401

# ====================================
# MAIN
# ====================================

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
