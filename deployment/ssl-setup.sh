#!/bin/bash
# SSL and Domain Configuration Script

set -e

# Configuration
DOMAIN=$1
EMAIL=$2
SERVER_IP=$3
SSH_USER=$4

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ] || [ -z "$SERVER_IP" ] || [ -z "$SSH_USER" ]; then
  echo "Usage: ./ssl-setup.sh [domain] [email] [server-ip] [ssh-user]"
  echo "Example: ./ssl-setup.sh cashheros.com admin@cashheros.com 123.456.789.10 deploy-user"
  exit 1
fi

echo "Setting up SSL for $DOMAIN..."

# Create Nginx configuration for the domain
cat > nginx-$DOMAIN.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
    
    # Root directory
    root /var/www/$DOMAIN/html;
    index index.html;
    
    # Handle React routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Gzip compression
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml;
}
EOF

# Upload Nginx configuration to server
scp nginx-$DOMAIN.conf $SSH_USER@$SERVER_IP:/tmp/

# Set up SSL certificate and Nginx configuration on server
ssh $SSH_USER@$SERVER_IP << EOF
  set -e
  
  # Install Certbot if not already installed
  if ! command -v certbot &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
  fi
  
  # Create directories
  sudo mkdir -p /var/www/letsencrypt
  sudo mkdir -p /var/www/$DOMAIN/html
  
  # Move Nginx configuration
  sudo mv /tmp/nginx-$DOMAIN.conf /etc/nginx/sites-available/$DOMAIN
  sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
  
  # Test Nginx configuration
  sudo nginx -t
  
  # Reload Nginx to apply configuration
  sudo systemctl reload nginx
  
  # Obtain SSL certificate
  sudo certbot certonly --webroot -w /var/www/letsencrypt -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
  
  # Set up auto-renewal
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
  
  # Reload Nginx again to apply SSL configuration
  sudo nginx -t
  sudo systemctl reload nginx
  
  echo "SSL certificate for $DOMAIN has been successfully installed!"
EOF

# Clean up local files
rm nginx-$DOMAIN.conf

echo "SSL and domain configuration for $DOMAIN completed successfully!"