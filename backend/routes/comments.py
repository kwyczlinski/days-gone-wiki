from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from database import get_db_conn
from auth import require_auth

comments_bp = Blueprint("comments", __name__)

@comments_bp.post("/comment")
@require_auth
def add_comment(current_user):
    data = request.json
    if not (data and isinstance(data, dict) and data.get("id") and isinstance(data.get("id"), str) and data.get("category") and isinstance(data.get("category"), str) and data.get("content") and isinstance(data.get("content"), str) and data.get("content", "").strip()):
        return jsonify({"error": "Bad comment data"}), 400

    user_id = current_user["user_id"]
    username = current_user["username"]
    item_id = data["id"]
    category = data["category"]
    content = data["content"]

    current_app.logger.info(f"Creating comment at /{category}/{item_id}")
    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("call add_comment(%s, %s, %s, %s, %s)", (user_id, username, content, category, item_id))
                conn.commit()
        return jsonify({"message": "Added comment successfully"}), 200
    except Exception as err:
        current_app.logger.error(f"Adding comment failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@comments_bp.get("/comment")
def get_comments():
    category = request.args.get("category")
    item_id = request.args.get("itemId")
    if not category or not item_id:
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
        current_app.logger.error(f"Fetching comments failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@comments_bp.patch("/comment/<int:comment_id>")
@require_auth
def update_comment(current_user, comment_id):
    data = request.json
    content = data.get("content", "").strip() if data else ""
    if not content:
        return jsonify({"error": "Content is required"}), 400

    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("select * from get_comment(%s)", (comment_id,))
                result = cur.fetchone()

                if not result:
                    return jsonify({"error": "No comment found"}), 404

                owner_id = str(result["id_user"])
                if "days-gone-moderator" not in current_user["roles"] and owner_id != current_user["user_id"]:
                    return jsonify({"error": "No permission"}), 403

                cur.execute("call update_comment(%s, %s, %s)", (comment_id, content, owner_id))
                conn.commit()

        current_app.logger.info(f"Updated comment {comment_id}")
        return jsonify({"message": "Updated successfully"}), 200
    except Exception as err:
        current_app.logger.error(f"Update failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@comments_bp.delete("/comment/<int:comment_id>")
@require_auth
def delete_comment(current_user, comment_id):
    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("select * from get_comment(%s)", (comment_id,))
                result = cur.fetchone()

                if not result:
                    return jsonify({"error": "No comment found"}), 404

                owner_id = str(result["id_user"])
                if "days-gone-moderator" not in current_user["roles"] and owner_id != current_user["user_id"]:
                    return jsonify({"error": "No permission"}), 403

                cur.execute("call delete_comment(%s, %s)", (comment_id, owner_id))
                conn.commit()

        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as err:
        current_app.logger.error(f"Deletion failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500