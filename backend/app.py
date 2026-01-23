from flask import Flask, request, jsonify
from flask_cors import CORS

import psycopg2
from psycopg2.extras import RealDictCursor

from dotenv import load_dotenv
from logging.config import dictConfig
import os

from config import setup_logging

load_dotenv()
dictConfig(setup_logging())

app = Flask(__name__)
CORS(app)

def get_db_conn():
    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )
    return conn

@app.get("/search") #(/search?query=camp)
def search():
    search_query = request.args.get('query')
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
    'collectible': "select * from get_collectible_page(%s)",
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
        app.logger.error(f"Search failed: {str(err)}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    # host='0.0.0.0' is protocol setting for Docker
    app.run(host='0.0.0.0', port=5000, debug=True)
