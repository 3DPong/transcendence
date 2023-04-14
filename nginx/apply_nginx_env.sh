#!/bin/sh

# Replace environment variables in the template file
envsubst '\$APP_PORT \$APP_HOST \$NGINX_PORT \$NGINX_HOST \$EXTERNAL_HOST \$EXTERNAL_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
echo "Nginx configuration file:"
cat /etc/nginx/nginx.conf
echo "Nginx configuration file end"
echo "Starting Nginx..."
# Start Nginx
exec nginx -g "daemon off;"