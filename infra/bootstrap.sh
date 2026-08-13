#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/pace-profile"
APP_PORT="${app_port}"

dnf update -y
dnf install -y git nginx
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "${repo_url}" "$APP_DIR"
else
  cd "$APP_DIR"
  git pull
fi

cd "$APP_DIR/app"
cat > .env.production <<EOF
AWS_REGION=${aws_region}
DYNAMODB_TABLE_NAME=${dynamodb_table_name}
NEXT_PUBLIC_APP_NAME=PACE PROFILE
EOF

npm install
npm run build

cat > /etc/systemd/system/pace-profile.service <<EOF
[Unit]
Description=PACE PROFILE Next.js application
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR/app
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/nginx/conf.d/pace-profile.conf <<EOF
server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:$APP_PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \\$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \\$host;
    proxy_cache_bypass \\$http_upgrade;
  }
}
EOF

systemctl daemon-reload
systemctl enable pace-profile
systemctl restart pace-profile
systemctl enable nginx
systemctl restart nginx
