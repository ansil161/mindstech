#!/bin/sh
# Runs from the nginx image's /docker-entrypoint.d/ before nginx starts.
# Switches to the HTTPS config only when a certificate is actually present, so
# a missing or not-yet-issued certificate leaves the site up on plain HTTP
# (which is also what certbot needs to issue the first one).
set -e
if [ -n "$SSL_DOMAIN" ] && [ -f "/etc/letsencrypt/live/$SSL_DOMAIN/fullchain.pem" ]; then
    envsubst '${SSL_DOMAIN}' < /etc/nginx/ssl.conf.template > /etc/nginx/conf.d/default.conf
    echo "40-ssl-config: HTTPS enabled for $SSL_DOMAIN"
else
    echo "40-ssl-config: no certificate for '${SSL_DOMAIN:-<unset>}', serving plain HTTP"
fi
