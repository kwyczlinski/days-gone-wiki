from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from database import get_db_conn

wiki_bp = Blueprint("wiki", __name__)

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

@wiki_bp.get("/search")
def search():
    search_query = request.args.get("query")
    if not search_query:
        return jsonify({"error": "No search query provided"}), 400

    current_app.logger.info(f"Searching for: {search_query}")
    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("select * from search(%s)", (search_query,))
                results = cur.fetchall()

        if results == []:
            return jsonify([]), 200
        if not results:
            return jsonify({"error": "Not found"}), 404

        return jsonify(results), 200
    except Exception as err:
        current_app.logger.error(f"Search failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500

@wiki_bp.get("/<category>/<int:item_id>")
def get_details(category, item_id):
    if not category or not item_id:
        return jsonify({"error": "Missing category or id"}), 400

    current_app.logger.info(f"Getting page {category} for id:{item_id}")
    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = db_details_page_queries.get(category)
                if not query:
                    return jsonify({"error": "Invalid category"}), 400
                    
                cur.execute(query, (item_id,))
                result = cur.fetchone()
        
        if not result:
            return jsonify({"error": "Not found"}), 404

        return jsonify(result), 200
    except Exception as err:
        current_app.logger.error(f"getDetails failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500