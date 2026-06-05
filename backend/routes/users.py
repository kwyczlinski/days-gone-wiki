import os
from flask import Blueprint, jsonify
# Import the clean require_auth decorator we refactored
from auth import require_auth  

users_bp = Blueprint("users", __name__, url_prefix="/api")

# =====================================================================
# 🧠 THE USER IDENTITY ROUTE: /api/me
# =====================================================================
@users_bp.get("/me")
@require_auth
def me(current_user):
    """
    The require_auth decorator handles 100% of the heavy lifting:
    1. Grabs the 'access_token' cookie.
    2. Securely verifies its cryptographic signature locally using JWKS.
    3. Injects the normalized 'current_user' dictionary directly into this function.
    """
    # Simply return the user data that the decorator successfully parsed and validated
    return jsonify(current_user), 200