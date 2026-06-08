#!/bin/sh

ENV_FILE="/usr/share/nginx/html/env-config.js"

echo "window._env_ = {" > $ENV_FILE
echo "  VITE_API_URL: \"${VITE_API_URL}\"," >> $ENV_FILE
echo "  VITE_AUTHENTIK_PUBLIC_URL: \"${VITE_AUTHENTIK_PUBLIC_URL}\"," >> $ENV_FILE
echo "  VITE_AUTHENTIK_CLIENT_ID: \"${VITE_AUTHENTIK_CLIENT_ID}\"" >> $ENV_FILE
echo "};" >> $ENV_FILE

exec nginx -g "daemon off;"