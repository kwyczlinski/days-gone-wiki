import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from logging.config import dictConfig

from config import setup_logging
from routes.wiki import wiki_bp
from routes.users import users_bp
from routes.comments import comments_bp
# Import the authentication route initializer
from auth import init_auth_routes  

load_dotenv()
dictConfig(setup_logging())

app = Flask(__name__)

# CORS configured correctly to support credentials (cookies) over HTTPS
CORS(
    app,
    resources={r"/*": {"origins": ["https://localhost:5173"]}},
    supports_credentials=True,
)

# 1. Register standard domain blueprints
app.register_blueprint(wiki_bp)
app.register_blueprint(users_bp)       # This now handles the fixed /api/me
app.register_blueprint(comments_bp)

# 2. Register the OAuth2 utility routes (/api/auth/callback and /api/auth/logout)
init_auth_routes(app)

if __name__ == "__main__":
    app.run(
        host="0.0.0.0", 
        port=5000, 
        debug=True,
        ssl_context=('/certs/cert.pem', '/certs/key.pem')  # Crucial for secure HttpOnly cookies
    )