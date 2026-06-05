import signal
import sys
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from logging.config import dictConfig

from config import setup_logging
from routes.wiki import wiki_bp
from routes.comments import comments_bp
from health import health_bp
from auth import init_auth_routes  
from database import DB_POOL
from redis_conn import cache

load_dotenv()
dictConfig(setup_logging())

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": ["https://localhost:5173"]}},
    supports_credentials=True,
)

app.register_blueprint(wiki_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(health_bp)

init_auth_routes(app)

def graceful_shutdown(signum, frame):
    print("Recieved SIGTERM. Closing connection pools...", flush=True)
    try:
        DB_POOL.closeall()
        print("Database connection pool was safetly closed.", flush=True)
    except Exception as e:
        print(f"Error closing database pool connections : {e}", flush=True)
    
    try:
        cache.close()
        print("Cache connection pool was safetly closed.", flush=True)
    except Exception as e:
        print(f"Error closing cache pool connections : {e}", flush=True)

    sys.exit(0)

signal.signal(signal.SIGTERM, graceful_shutdown)

if __name__ == "__main__":
    app.run(
        host="0.0.0.0", 
        port=5000, 
        debug=False,
    )