import os
import requests
from functools import wraps
from flask import request, jsonify, current_app, make_response
from jwt import PyJWKClient, decode, ExpiredSignatureError, InvalidTokenError

AUTH_ISSUER = os.getenv("AUTHENTIK_ISSUER")
AUTH_BASE_INTERNAL = os.getenv("AUTHENTIK_INTERNAL_URL", "http://wiki-auth-server:9000")
CLIENT_ID = os.getenv("AUTHENTIK_CLIENT_ID")
CLIENT_SECRET = os.getenv("AUTHENTIK_CLIENT_SECRET")

TOKEN_URL = f"{AUTH_BASE_INTERNAL}/application/o/token/"
JWKS_URL = f"{AUTH_BASE_INTERNAL}/application/o/days-gone-wiki/jwks/"

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


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.cookies.get("access_token")

        if not token:
            return jsonify({"error": "Unauthorized, missing token"}), 401

        claims = verify_and_decode_token(token)
        if not claims:
            return jsonify({"error": "Unauthorized, invalid or expired token"}), 401

        current_user = {
            "user_id": str(claims.get("sub")),
            "username": claims.get("preferred_username") or claims.get("nickname"),
            "email": claims.get("email"),
            "roles": claims.get("groups", []),
        }

        return f(current_user, *args, **kwargs)
    return wrapper


def init_auth_routes(app):
    
    @app.route("/api/auth/callback", methods=["POST"])
    def auth_callback():
        """Swaps the frontend authorization code for an Access Token"""
        data = request.json or {}
        code = data.get("code")
        redirect_uri = data.get("redirect_uri")
        code_verifier = data.get("code_verifier")

        if not code or not redirect_uri or not code_verifier:
            return jsonify({"error": "Missing code, redirect_uri or code_verifier"}), 400

        payload = {
            "grant_type": "authorization_code",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri,
            "code_verifier": code_verifier,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            response = requests.post(TOKEN_URL, data=payload, headers=headers, timeout=10)
            if response.status_code != 200:
                app.logger.error(f"Token exchange status={response.status_code}, body={response.text}")
                return jsonify({"error": "Token exchange failed with Authentik"}), 400
            
            token_data = response.json()
            access_token = token_data.get("access_token")

            resp = make_response(jsonify({"success": True}))
            resp.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=3600
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
