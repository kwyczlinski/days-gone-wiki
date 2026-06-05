import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from logging.config import dictConfig

from config import setup_logging
from routes.wiki import wiki_bp
from routes.comments import comments_bp
from auth import init_auth_routes  

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

init_auth_routes(app)

if __name__ == "__main__":
    app.run(
        host="0.0.0.0", 
        port=5000, 
        debug=True,
        ssl_context=('/certs/cert.pem', '/certs/key.pem')
    )