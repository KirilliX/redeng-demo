#!/bin/bash
set -e

echo "=== Установка PM2, nginx, certbot ==="
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx git

echo "=== Клонирование репозитория ==="
mkdir -p /var/www
cd /var/www
git clone https://github.com/KirilliX/redeng-demo.git
cd redeng-demo/redeng

echo "=== Установка зависимостей и сборка ==="
npm ci
npm run build

echo "=== Создание .env ==="
cat > .env << 'EOF'
PORT=8787
CRM_AUTH_ENABLED=true
CRM_AUTH_COOKIE_SECURE=true
EOF

echo "=== Запуск через PM2 ==="
pm2 start npm --name "redeng" -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo "=== Настройка nginx ==="
cat > /etc/nginx/sites-available/red-eng.ru << 'NGINX'
server {
    listen 80;
    server_name red-eng.ru www.red-eng.ru;

    client_max_body_size 25m;

    location / {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/red-eng.ru /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo "=== Добавление deploy-ключа GitHub Actions ==="
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICODtfK/7+07b9hFF3POekfeAy+kMgC5tOWCjz946Xnv github-actions" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo ""
echo "======================================"
echo "Готово! Осталось получить SSL:"
echo "certbot --nginx -d red-eng.ru -d www.red-eng.ru"
echo "======================================"
echo "Сервер запущен на http://red-eng.ru"
