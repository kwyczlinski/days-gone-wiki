from flask import Blueprint, jsonify, current_app
from psycopg2.extras import RealDictCursor
from database import db_conn

health_bp = Blueprint("health", __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    try:
        with db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT 1;")

        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as err:
        current_app.logger.error(f"Status Unhealthy: {str(err)}")
        return jsonify({"status": "unhealthy", "reason": str(err)}), 500
    