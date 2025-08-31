from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DB_NAME = "blood_bank.db"

# Helper to run queries
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

# Initialize tables
def init_db():
    query_db("""CREATE TABLE IF NOT EXISTS donors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        blood_type TEXT NOT NULL,
        county TEXT NOT NULL,
        nationality TEXT NOT NULL,
        password TEXT NOT NULL
    )""")
    query_db("""CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        county TEXT NOT NULL,
        password TEXT NOT NULL
    )""")

@app.route("/donor/register", methods=["POST"])
def donor_register():
    data = request.json
    try:
        query_db("INSERT INTO donors (full_name, email, phone, blood_type, county, nationality, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data["fullName"], data["email"], data["phone"], data["bloodType"], data["county"], data["nationality"], data["password"]))
        return jsonify({"message": "✅ Donor registered successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/donor/login", methods=["POST"])
def donor_login():
    data = request.json
    result = query_db("SELECT * FROM donors WHERE email=? AND password=?", (data["email"], data["password"]), fetch=True)
    if result:
        return jsonify({"message": "✅ Login successful!"})
    else:
        return jsonify({"error": "❌ Invalid credentials"}), 401

@app.route("/hospital/search", methods=["POST"])
def hospital_search():
    data = request.json
    result = query_db("SELECT full_name, phone, blood_type, county FROM donors WHERE blood_type=? AND county=?", 
                      (data["bloodType"], data["county"]), fetch=True)
    donors = [{"name": r[0], "phone": r[1], "bloodType": r[2], "county": r[3]} for r in result]
    return jsonify(donors)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
