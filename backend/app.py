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
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["https://localhost:5173", "https://192.168.1.97:5173"]}})

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
        "user_id": current_user.get("user_id"),
        "username": current_user.get("username"),
        "email": current_user.get("email"),
        "rank": current_user.get("rank")
    }), 200

@app.get("/search") #(/search?query=camp)
def search():
    search_query = request.args.get("query")
    if not search_query:
        return jsonify({"error": "No search query provided"}), 400

    app.logger.info(f"Searching for: {search_query}")

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
        
                cur.execute("select * from search(%s)", (search_query,))
                results = cur.fetchall()

        if not results:
            return jsonify({"error": "Not found"}), 404

        return jsonify(results), 200

    except Exception as err:
        app.logger.error(f"Search failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

db_details_page_queries = {
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
        app.logger.warning(f"Missing category: {category} or id: {item_id}")
        return jsonify({"error": "Missing category or id"}), 400

    app.logger.info(f"Getting page {category} for id:{item_id}")

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
        
                query = db_details_page_queries.get(category)
                if not query:
                    app.logger.warning(f"Invalid category: {category}")
                    return jsonify({"error": "Invalid category"}), 400
                    
                cur.execute(query, (item_id,))
                result = cur.fetchone()
                app.logger.info(result)
        
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
    password = data.get("password") 

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
        
                cur.execute("select * from get_user_by_email(%s)", (email,))
                user = cur.fetchone()

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        password_db_hash = user.get("password_hash")
        if not password_db_hash or not isinstance(password_db_hash, str):
            app.logger.error(f"User {email} found but has no valid hash in DB")
            return jsonify({"error": "Invalid email or password"}), 401


        if check_password_hash(password_db_hash, password):
            token = jwt.encode({
                "user_id": user["id_user"],
                "username": user["username"],
                "email": user["email"],
                "rank": user["rank"],
                "exp": datetime.now(timezone.utc) + timedelta(hours=6)
            }, app.config["JWT_KEY"], algorithm="HS256")

            response = make_response(jsonify({
                "username": user["username"],
                "user_id": user["id_user"],
                "email": user["email"]
            }))

            response.set_cookie(
                "session_token", 
                token, 
                httponly=True, 
                secure=True,
                samesite='None',
                max_age=10800 # 3h
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
        max_age=0,
        expires=0, 
        httponly=True,
        secure=True,
        samesite='None'
    )
    return response, 200

@app.post("/register")
def register():
    data: dict[str, str] = request.json
    if not (data and isinstance(data, dict) and data.get("email") and isinstance(data.get("email"), str) and data.get("username") and isinstance(data.get("username"), str) and data.get("password") and isinstance(data.get("password"), str)):
        app.logger.error("Bad registration request data")
        return jsonify({"error": "Bad registration data"}), 400

    email = data["email"].strip().lower()
    username = data["username"].strip()
    password = data["password"]
    password_db_hash = generate_password_hash(password)

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                # Verify if email is free in db
                cur.execute("select * from is_email_used(%s)", (email,))
                result = cur.fetchone()

                if result is None:
                    return jsonify({"error": "Not found"}), 404

                if result.get("is_email_used") == True:
                    return jsonify({"error": "Email is already used"}), 400

                if result.get("is_email_used") != False:
                    return jsonify({"error": "Database connection failed"}), 500

                app.logger.info(f"Creating a account for {username} with email: {email}")

                # Create user account
                cur.execute("call register_user(%s, %s, %s)", (username, email, password_db_hash))
                conn.commit()

        return jsonify({"message": "Created account successfully"}), 200

    except Exception as err:
        app.logger.error(f"Registration failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.patch("/user/username/<int:user_id>")
@token_required
def update_username(current_user, user_id):
    if current_user["user_id"] != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data: dict[str, str] = request.json
    if not (data and isinstance(data, dict) and data.get("username") and isinstance(data.get("username"), str)):
        return jsonify({"error": "Bad update request data"}), 400

    username = data["username"].strip()

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("select * from update_user_username(%s, %s)", (user_id, username))
                result = cur.fetchone()
                conn.commit()

        if result is None:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "Profile updated", "user": result}), 200

    except Exception as err:
        app.logger.error(f"Profile update failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.patch("/user/login/<int:user_id>")
@token_required
def update_login_data(current_user, user_id):
    if current_user["user_id"] != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data: dict[str, str] = request.json
    if not (data and isinstance(data, dict) and data.get("email") and isinstance(data.get("email"), str) and data.get("currentPassword") and isinstance(data.get("currentPassword"), str) and "newPassword" in data):
        return jsonify({"error": "Bad update request data"}), 400

    new_email = data.get("email").strip().lower()
    current_password = data.get("currentPassword").strip()
    new_password = data.get("newPassword")

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                cur.execute("select * from get_user_by_id(%s)", (user_id,))
                user = cur.fetchone()

                if not user:
                    return jsonify({"error": "User not found"}), 404

                if not check_password_hash(user["password_hash"],  current_password):
                    return jsonify({"error": "Incorrect current password"}), 403

                if new_email != user["email"].lower():
                    cur.execute("select * from is_email_used(%s)", (new_email,))
                    if cur.fetchone()["is_email_used"]:
                        return jsonify({"error": "Email is already in use"}), 409

                set_password_hash = user["password_hash"]
                if new_password and new_password.strip() != "":
                    if not check_password_hash(user["password_hash"], new_password):
                        set_password_hash = generate_password_hash(new_password)

                cur.execute("select * from update_user_login(%s, %s, %s)",(user_id, new_email, set_password_hash))
                updated_user = cur.fetchone()
                conn.commit()

        return jsonify({"message": "Profile updated", "user": updated_user}), 200

    except Exception as err:
        app.logger.error(f"Profile login data update failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.delete("/user/<int:user_id>")
@token_required
def delete_account(current_user, user_id):
    if current_user["user_id"] != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    if not (data and isinstance(data, dict) and data.get("password") and isinstance(data.get("password"), str)):
        return jsonify({"error": "Password required"}), 400

    password = data["password"]

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                cur.execute("select * from get_user_by_id(%s)", (user_id,))
                result = cur.fetchone()
                if result is None:
                    return jsonify({"error": "User not found"}), 404

                password_db_hash = result["password_hash"]

                if not check_password_hash(password_db_hash, password):
                    return jsonify({"error": "Incorrect password"}), 403

                cur.execute("call delete_user(%s)", (user_id,))
                conn.commit()

        return jsonify({"message": "Account deleted"}), 200

    except Exception as err:
        app.logger.error(f"Account deletion failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.post("/comment")
@token_required
def add_comment(current_user):
    data: dict[str, str] = request.json
    if not (data and isinstance(data, dict) and data.get("id") and isinstance(data.get("id"), str) and data.get("category") and isinstance(data.get("category"), str) and data.get("content") and isinstance(data.get("content"), str) and data.get("content", "").strip()):
        return jsonify({"error": "Bad comment data"}), 400

    user_id = current_user["user_id"]
    item_id = data["id"]
    category = data["category"]
    content = data["content"]

    app.logger.info(f"Creating comment at /{category}/{item_id}")

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
            
                cur.execute("call add_comment(%s, %s, %s, %s)", (user_id, content, category, item_id))
                conn.commit()

        return jsonify({"message": "Added comment successfully"}), 200

    except Exception as err:
        app.logger.error(f"Adding comment failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.get("/comment") #(/comment?category=camp&itemId=3)
def get_comments():
    category = request.args.get("category")
    item_id = request.args.get("itemId")
    if not category or not item_id:
        app.logger.warning(f"Missing category: {category} or id: {item_id}")
        return jsonify({"error": "Missing category or id"}), 400
    
    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    
                cur.execute("select * from get_comments(%s, %s)", (category, item_id))
                result = cur.fetchone()
                
                if result and "get_comments" in result:
                    return jsonify(result["get_comments"]), 200
                
                return jsonify([]), 200

    except Exception as err:
        app.logger.error(f"Adding comment failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.patch("/comment/<int:comment_id>")
@token_required
def update_comment(current_user, comment_id):
    data = request.json
    content = data.get("content", "").strip()
    if not content:
        return jsonify({"error": "Content is required"}), 400

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                cur.execute("select * from get_comment(%s)", (comment_id,))
                result = cur.fetchone()

                if not result:
                    app.logger.warning(f"No comment found for id: {comment_id}")
                    return jsonify({"error": "No comment found"}), 404

                owner_id = result["id_user"]
                if current_user["rank"] != "admin" and owner_id != current_user["user_id"]:
                    app.logger.warning(f"No permision for comment: {comment_id}")
                    return jsonify({"error": "No permission"}), 403

                cur.execute("call update_comment(%s, %s, %s)", (comment_id, content, owner_id))
                conn.commit()

        app.logger.info(f"Updated comment {comment_id} {'by admin' if current_user['rank'] == 'admin' else ''}")
        return jsonify({"message": "Updated successfully"}), 200

    except Exception as err:
        app.logger.error(f"Update failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@app.delete("/comment/<int:comment_id>")
@token_required
def delete_comment(current_user, comment_id):
    if not (comment_id and isinstance(comment_id, int)):
        return jsonify({"error": "Bad comment data"}), 400

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                cur.execute("select * from get_comment(%s)", (comment_id,))
                result = cur.fetchone()

                if not result:
                    app.logger.warning(f"No comment found for id: {comment_id}")
                    return jsonify({"error": "No comment found"}), 404

                owner_id = result["id_user"]
                if current_user["rank"] != "admin" and owner_id != current_user["user_id"]:
                    app.logger.warning(f"No permision for comment: {comment_id}")
                    return jsonify({"error": "No permission"}), 403

                app.logger.info(f"Deleting comment {comment_id} {'by admin' if current_user['rank'] == 'admin' else ''}")

                cur.execute("call delete_comment(%s, %s)", (comment_id, owner_id))
                conn.commit()

        app.logger.info(f"Deleted comment {comment_id} {'by admin' if current_user['rank'] == 'admin' else ''}")
        return jsonify({"message": "Deleted successfully"}), 200

    except Exception as err:
        app.logger.error(f"Deletion failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(
            host="0.0.0.0", 
            port=5000, 
            debug=True,
            ssl_context=('/app/certs/cert.pem', '/app/certs/key.pem')
        )