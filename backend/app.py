from functools import wraps

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

import psycopg2
from psycopg2.extras import RealDictCursor

from dotenv import load_dotenv
from logging.config import dictConfig
import os

from config import setup_logging

import jwt
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()
dictConfig(setup_logging())

app = Flask(__name__)
app.config["JWT_KEY"] = os.getenv("JWT_KEY")
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

def get_db_conn():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    return conn

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("session_token")

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, app.config["JWT_KEY"], algorithms=["HS256"])
            current_user = data 
        except Exception:
            return jsonify({"message": "Token is invalid or expired!"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@app.get("/me")
@token_required
def get_current_user(current_user):
    return jsonify({
        "user_id": current_user["user_id"],
        "username": current_user["username"]
    }), 200

@app.get("/search") #(/search?query=camp)
def search():
    search_query = request.args.get("query")
    if not search_query:
        return jsonify({"error": "No search query provided"}), 400

    app.logger.info(f"Searching for: {search_query}")

    try:
        conn = get_db_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM search(%s)", (search_query,))
        results = cur.fetchall()
        
        cur.close()
        conn.close()

        if not results:
            return jsonify({"error": "Not found"}), 404

        return jsonify(results), 200

    except Exception as err:
        app.logger.error(f"Search failed: {str(err)}")
        return jsonify({"error": str(err)}), 500

db_page_queries = {
    "region": "select * from get_region_page(%s)",
    "camp": "select * from get_camp_page(%s)",
    "mechanic": "select * from get_mechanic_page(%s)",
    "merchant": "select * from get_merchant_page(%s)",
    "collectible": "select * from get_collectible_page(%s)",
    "horde": "select * from get_horde_page(%s)",
    "infestation": "select * from get_infestation_page(%s)",
    "mission": "select * from get_mission_page(%s)",
}

@app.get("/<category>/<int:item_id>")
def getDetails(category, item_id):
    if not category or not item_id:
        return jsonify({"error": "Missing category or id"}), 400

    app.logger.info(f"Getting page {category} for id:{item_id}")

    try:
        conn = get_db_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = db_page_queries.get(category)
        if not query:
            return jsonify({"error": "Invalid category"}), 400
            
        cur.execute(query, (item_id,))
        result = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not result:
            return jsonify({"error": "Not found"}), 404

        return jsonify(result), 200

    except Exception as err:
        app.logger.error(f"getDetails failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.post("/login")
def login():
    data = request.json
    email = data.get("email")
    password_client_hash = data.get("password") 

    if not email or not password_client_hash:
        return jsonify({"error": "Missing credentials"}), 400

    try:
        conn = get_db_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("select * from get_user_by_email(%s)", (email,))
        user = cur.fetchone()
        
        cur.close()
        conn.close()

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        password_db_hash = user.get("password_hash")
        if not password_db_hash or not isinstance(password_db_hash, str):
            app.logger.error(f"User {email} found but has no valid hash in DB")
            return jsonify({"error": "Invalid email or password"}), 401


        if check_password_hash(password_db_hash, password_client_hash):
            token = jwt.encode({
                "user_id": user["id_user"],
                "username": user["username"],
                "exp": datetime.now(timezone.utc) + timedelta(hours=24)
            }, app.config["JWT_KEY"], algorithm="HS256")

            app.logger.info(f"password_db_hash is {password_db_hash}")

            response = make_response(jsonify({
                "username": user["username"],
                "user_id": user["id_user"]
            }))

            response.set_cookie(
                "session_token", 
                token, 
                httponly=True, 
                samesite="Lax", 
                secure=False,
                max_age=86400 # 24h
            )
            return response
        
        return jsonify({"error": "Invalid email or password"}), 401

    except Exception as err:
        app.logger.error(f"Login failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.post("/logout")
def logout():
    response = make_response(jsonify({"message": "Logged out successfully"}))
    response.set_cookie(
        "session_token", 
        "", 
        expires=0, 
        httponly=True,
        samesite="Lax",
        secure=False
    )
    return response, 200

@app.post("/register")
def register():
    data: dict[str, str] = request.json
    if not (data and isinstance(data, dict) and data.get("email") and isinstance(data.get("email"), str) and data.get("username") and isinstance(data.get("username"), str) and data.get("password") and isinstance(data.get("password"), str)):
        app.logger.error("Bad registration request data")
        return jsonify({"error": "Bad registration data"}), 400
    
    email = data["email"].strip()

    # verifying email is free in db
    try:
        conn = get_db_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT * FROM is_email_used(%s)", (email,))
        result = cur.fetchone()

        cur.close()
        conn.close()
        
        if result.get("is_email_used") == True: # type: ignore
            return jsonify({"error": "Email is already used"}), 400

        if result.get("is_email_used") != False: # type: ignore
            return jsonify({"error": "Database connection failed"}), 500

    except Exception as err:
        app.logger.error(f"Email verification failed with: {str(err)}")
        return jsonify({"error": "Email verification failed"}), 500
    
    username = data["username"].strip()
    password_client_hash = data["password"]
    password_db_hash = generate_password_hash(password_client_hash)

    app.logger.info(f"Creating a account for {username} with email: {email}")

    # creating user account
    try:
        conn = get_db_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
            
        cur.execute("call register_user(%s, %s, %s)", (username, email, password_db_hash))
        
        conn.commit()
        
        cur.close()
        conn.close()

        return jsonify({"message": "Created account successfully"}), 200

    except Exception as err:
        app.logger.error(f"Registration failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    # host="0.0.0.0" is protocol setting for Docker
    app.run(host="0.0.0.0", port=5000, debug=True)
