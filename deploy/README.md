# VPS Deploy Example

This folder contains example files for deploying the site to a fresh Ubuntu/Debian VPS with:

- Nginx as the public web server
- Node.js running the optional API
- systemd keeping the API alive
- SQLite storing view counts

Replace every placeholder value before using these commands:

- `example.com`
- `www.example.com`
- `deploy`
- `/var/www/link-profile`
- `/var/lib/link-profile`
- `RANDOM_SECRET`

## 1. Create A Deploy User

Run on the VPS as `root`:

```bash
adduser --gecos "" --disabled-password deploy
usermod -aG sudo deploy

mkdir -p /home/deploy/.ssh
echo "YOUR_PUBLIC_SSH_KEY" >> /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

Allow restarting only this service without a password:

```bash
echo 'deploy ALL=(root) NOPASSWD: /bin/systemctl restart link-profile-api' > /etc/sudoers.d/link-profile
chmod 440 /etc/sudoers.d/link-profile
```

## 2. Install Packages

```bash
apt update
apt install -y curl ca-certificates git build-essential nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

## 3. Prepare Directories

```bash
mkdir -p /var/www/link-profile/dist /var/www/link-profile/server
chown -R deploy:deploy /var/www/link-profile

mkdir -p /var/lib/link-profile
chown -R deploy:deploy /var/lib/link-profile
```

## 4. Backend Env

Create `/var/www/link-profile/server/.env`:

```bash
sudo -u deploy tee /var/www/link-profile/server/.env >/dev/null <<EOF
PORT=3000
HOST=127.0.0.1
DB_PATH=/var/lib/link-profile/views.sqlite
IP_SALT=RANDOM_SECRET
EOF

chmod 600 /var/www/link-profile/server/.env
chown deploy:deploy /var/www/link-profile/server/.env
```

Generate a salt:

```bash
openssl rand -hex 32
```

## 5. systemd

Copy `deploy/systemd/link-profile-api.service` to your server and adapt paths/service names if needed.

Example:

```bash
cp deploy/systemd/link-profile-api.service /etc/systemd/system/link-profile-api.service
systemctl daemon-reload
systemctl enable link-profile-api
```

## 6. Nginx

Copy and edit `deploy/nginx/link-profile.conf`.

At minimum, change:

- `server_name`
- `root`
- certificate paths if you manage TLS manually

Then:

```bash
nginx -t
systemctl reload nginx
```

## 7. Deploy From Your Machine

```bash
REMOTE_HOST=example.com \
REMOTE_USER=deploy \
REMOTE_ROOT=/var/www/link-profile \
SERVICE_NAME=link-profile-api \
./deploy.sh
```

Start the API the first time:

```bash
systemctl start link-profile-api
```

Smoke tests:

```bash
curl -i https://example.com/api/health
curl -i -X POST https://example.com/api/views
```
