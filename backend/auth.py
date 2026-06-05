import os
import requests
from functools import wraps
from flask import request, jsonify, current_app, make_response
from jwt import PyJWKClient, decode, ExpiredSignatureError, InvalidTokenError

# =====================================================================
# ENV CONFIG
# =====================================================================
AUTH_ISSUER = os.getenv("AUTHENTIK_ISSUER")  # e.g., https://auth.example.com/application/o/your-app/
AUTH_BASE_INTERNAL = os.getenv("AUTHENTIK_INTERNAL_URL", "http://wiki-auth-server:9000")
CLIENT_ID = os.getenv("AUTHENTIK_CLIENT_ID")
CLIENT_SECRET = os.getenv("AUTHENTIK_CLIENT_SECRET")

# Internal endpoints for back-channel communication
TOKEN_URL = f"{AUTH_BASE_INTERNAL}/application/o/token/"
JWKS_URL = f"{AUTH_BASE_INTERNAL}/application/o/days-gone-wiki/jwks/"

# =====================================================================
# JWT VERIFICATION HELPERS (Using PyJWT)
# =====================================================================
# PyJWKClient handles fetching and automatically caching the public keys
jwks_client = PyJWKClient(JWKS_URL)

def verify_and_decode_token(token):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        claims = decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
            issuer=AUTH_ISSUER
        )
        return claims
    except Exception as e:
        current_app.logger.error(f"JWT Verification failed: {str(e)}")
        return None

# =====================================================================
# AUTH DECORATOR / IDENTITY RESOLVER
# =====================================================================
def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Read the token from the secure cookie we set during callback
        token = request.cookies.get("access_token")

        if not token:
            return jsonify({"error": "Unauthorized, missing token"}), 401

        claims = verify_and_decode_token(token)
        if not claims:
            print(token)
            return jsonify({"error": "Unauthorized, invalid or expired token"}), 401

        # Build your clean user object matching your frontend expectations
        current_user = {
            "user_id": str(claims.get("sub")),
            "username": claims.get("preferred_username") or claims.get("nickname"),
            "email": claims.get("email"),
            "roles": claims.get("groups", []), # Authentik sends groups here if scope='groups' is requested
        }

        return f(current_user, *args, **kwargs)
    return wrapper

# =====================================================================
# FLASK ROUTES (To serve your React Frontend Context)
# =====================================================================

def init_auth_routes(app):
    
    @app.route("/api/auth/callback", methods=["POST"])
    def auth_callback():
        """Swaps the frontend authorization code for an Access Token"""
        data = request.json or {}
        code = data.get("code")
        redirect_uri = data.get("redirect_uri")

        if not code or not redirect_uri:
            return jsonify({"error": "Missing code or redirect_uri"}), 400

        # Back-channel token exchange payload
        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            response = requests.post(TOKEN_URL, data=payload, headers=headers, timeout=10)
            if response.status_code != 200:
                return jsonify({"error": "Token exchange failed with Authentik"}), 400
            
            token_data = response.json()
            access_token = token_data.get("access_token")

            # Bake the access token into a secure HttpOnly cookie
            resp = make_response(jsonify({"success": True}))
            resp.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=True,          # Set to False if debugging locally on HTTP (non-HTTPS)
                samesite="Lax",
                max_age=3600          # 1 hour
            )
            return resp

        except Exception as e:
            app.logger.error(f"Callback error: {str(e)}")
            return jsonify({"error": "Internal token exchange error"}), 500


    @app.route("/api/me", methods=["GET"])
    @require_auth
    def get_me(current_user):
        """Returns decoded session identity directly to the React context"""
        return jsonify(current_user)


    @app.route("/api/auth/logout", methods=["POST"])
    def auth_logout():
        """Clears the secure session cookie"""
        resp = make_response(jsonify({"success": True}))
        resp.set_cookie("access_token", "", expires=0, httponly=True)
        return resp

# import os
# import requests
# from functools import wraps
# from flask import request, jsonify, current_app
# from jose import jwt

# # =========================
# # ENV CONFIG
# # =========================

# AUTH_ISSUER = os.getenv("AUTHENTIK_ISSUER")
# AUTH_BASE_INTERNAL = os.getenv("AUTHENTIK_INTERNAL_URL")
# AUTHENTIK_BASE_PUBLIC = os.getenv("AUTHENTIK_PUBLIC_URL") 
# CLIENT_ID = os.getenv("AUTHENTIK_CLIENT_ID")
# CLIENT_SECRET = os.getenv("AUTHENTIK_CLIENT_SECRET")

# JWKS_URL = f"{AUTHENTIK_BASE_PUBLIC}/application/o/{CLIENT_ID}/jwks/"

# TOKEN_URL = f"{AUTH_BASE_INTERNAL}/application/o/token/"
# AUTHORIZE_URL = f"{AUTHENTIK_BASE_PUBLIC}/application/o/authorize/"

# REDIRECT_URI = "https://localhost:5173/api/auth/callback"

# # =========================
# # JWKS CACHE
# # =========================

# _JWKS_CACHE = None


# def get_jwks():
#     global _JWKS_CACHE

#     if _JWKS_CACHE:
#         return _JWKS_CACHE

#     try:
#         response = requests.get(JWKS_URL, timeout=5)
#         response.raise_for_status()
#         _JWKS_CACHE = response.json()
#         return _JWKS_CACHE
#     except Exception as e:
#         current_app.logger.error(f"Failed to fetch JWKS: {str(e)}")
#         return None


# # =========================
# # AUTH DECORATOR
# # =========================

# def require_auth(f):
#     @wraps(f)
#     def wrapper(*args, **kwargs):
#         token = request.cookies.get("access_token")

#         if not token:
#             return jsonify({"error": "Missing token"}), 401

#         jwks = get_jwks()
#         if not jwks:
#             return jsonify({"error": "Auth server keys unavailable"}), 500

#         try:
#             header = jwt.get_unverified_header(token)
#             kid = header.get("kid")

#             key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
#             if not key:
#                 return jsonify({"error": "Invalid token key"}), 401

#             claims = jwt.decode(
#                 token,
#                 key,
#                 algorithms=["RS256"],
#                 audience=CLIENT_ID,
#                 issuer=AUTH_ISSUER,
#             )

#             current_user = {
#                 "user_id": str(claims.get("sub")),
#                 "username": claims.get("preferred_username"),
#                 "email": claims.get("email"),
#                 "roles": claims.get("groups", []),
#             }

#         except jwt.ExpiredSignatureError:
#             return jsonify({"error": "Token expired"}), 401
#         except jwt.JWTError as e:
#             current_app.logger.error(f"JWT error: {str(e)}")
#             return jsonify({"error": "Invalid token"}), 401

#         return f(current_user, *args, **kwargs)

#     return wrapper


# # =========================
# # LOGIN URL
# # =========================

# def build_login_url():
#     params = {
#         "client_id": CLIENT_ID,
#         "response_type": "code",
#         "scope": "openid profile email",
#         "redirect_uri": REDIRECT_URI,
#     }

#     query = requests.compat.urlencode(params)
#     return f"{AUTHORIZE_URL}?{query}"


# # =========================
# # TOKEN EXCHANGE
# # =========================

# def exchange_code_for_token(code: str):
#     payload = {
#         "grant_type": "authorization_code",
#         "code": code,
#         "redirect_uri": REDIRECT_URI,
#         "client_id": CLIENT_ID,
#         "client_secret": os.getenv("AUTHENTIK_CLIENT_SECRET"),
#     }

#     headers = {"Content-Type": "application/x-www-form-urlencoded"}

#     response = requests.post(TOKEN_URL, data=payload, headers=headers, timeout=10)

#     if response.status_code != 200:
#         current_app.logger.error("Token exchange failed:")
#         current_app.logger.error(response.text)
#         raise Exception("Token exchange failed")

#     return response.json()
