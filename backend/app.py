from flask import Flask, request, jsonify
from flask_cors import CORS

import psycopg2
from psycopg2.extras import RealDictCursor

from dotenv import load_dotenv
import os

load_dotenv()

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
    print("Recieved a search request")
    search_query = request.args.get('query')
    if not search_query:
        return jsonify({"error": "No search query provided"}), 400

    print(f"Searching for: {search_query}")

    try:
        conn = get_db_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM search(%s)", (search_query,))
        results = cur.fetchall()
        
        cur.close()
        conn.close()

        return jsonify(results), 200

    except Exception as err:
        print(f"Database error: {err}")
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    # host='0.0.0.0' is protocol setting for Docker
    app.run(host='0.0.0.0', port=5000, debug=True)