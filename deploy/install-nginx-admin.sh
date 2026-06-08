#!/usr/bin/env bash
set -euo pipefail

DOMAIN="admin.karnatakarollerskatingassociation.com"
FRONTEND_ROOT="/home/ubuntu/skate-karnataka-frontend"
SITE_NAME="skate-karnataka-admin"
SITES_AVAILABLE="/etc/nginx/sites-available/${SITE_NAME}"
SITES_ENABLED="/etc/nginx/sites-enabled/${SITE_NAME}"
TEMPLATE="${FRONTEND_ROOT}/deploy/nginx-admin.conf"

if [ ! -f "$TEMPLATE" ]; then
  echo "Missing nginx template: $TEMPLATE"
  exit 1
fi

SSL_CERT=""
SSL_KEY=""
OLD_CONFIG=""

for config in /etc/nginx/sites-enabled/*; do
  [ -f "$config" ] || continue
  if grep -q "$DOMAIN" "$config" 2>/dev/null; then
    OLD_CONFIG="$config"
    SSL_CERT="$(grep -m1 'ssl_certificate ' "$config" | awk '{print $2}' | tr -d ';' || true)"
    SSL_KEY="$(grep -m1 'ssl_certificate_key ' "$config" | awk '{print $2}' | tr -d ';' || true)"
    break
  fi
done

if [ -z "$SSL_CERT" ]; then
  SSL_CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
fi
if [ -z "$SSL_KEY" ]; then
  SSL_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
fi

sed \
  -e "s|__SSL_CERT__|${SSL_CERT}|g" \
  -e "s|__SSL_KEY__|${SSL_KEY}|g" \
  "$TEMPLATE" | sudo tee "$SITES_AVAILABLE" > /dev/null

sudo ln -sf "$SITES_AVAILABLE" "$SITES_ENABLED"

if [ -n "$OLD_CONFIG" ] && [ "$OLD_CONFIG" != "$SITES_ENABLED" ]; then
  sudo rm -f "$OLD_CONFIG"
fi

sudo nginx -t
sudo systemctl reload nginx

echo "Admin nginx SPA config installed for ${DOMAIN}"
