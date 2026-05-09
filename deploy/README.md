# Hanosuko.art — server setup (one-time, on a fresh Ubuntu/Debian VPS)

> Run all commands as `root` unless noted. Replace `YOUR_PUBKEY_HERE` and `RANDOM_SECRET` with real values.

## 0. Lock down SSH first

```bash
# change root password (the one you posted is now public — rotate immediately)
passwd

# create deploy user
adduser --gecos "" --disabled-password hanosuko
usermod -aG sudo hanosuko

# install your SSH pubkey (run from your Mac):
#   ssh-copy-id hanosuko@194.93.2.60
# OR manually on server:
mkdir -p /home/hanosuko/.ssh
echo "YOUR_PUBKEY_HERE" >> /home/hanosuko/.ssh/authorized_keys
chmod 700 /home/hanosuko/.ssh
chmod 600 /home/hanosuko/.ssh/authorized_keys
chown -R hanosuko:hanosuko /home/hanosuko/.ssh

# allow passwordless sudo for systemctl restart only (used by deploy.sh)
echo 'hanosuko ALL=(root) NOPASSWD: /bin/systemctl restart hanosuko-api' > /etc/sudoers.d/hanosuko
chmod 440 /etc/sudoers.d/hanosuko

# test login as hanosuko in another terminal BEFORE disabling root password
# then harden sshd:
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl reload ssh
```

## 1. Firewall

```bash
apt update && apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## 2. Install stack

```bash
apt install -y curl ca-certificates git build-essential nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

## 3. Prepare app dirs

```bash
mkdir -p /var/www/hanosuko/dist /var/www/hanosuko/server
chown -R hanosuko:hanosuko /var/www/hanosuko

mkdir -p /var/lib/hanosuko
chown -R hanosuko:hanosuko /var/lib/hanosuko
```

## 4. Backend env

Create `/var/www/hanosuko/server/.env`:

```bash
sudo -u hanosuko tee /var/www/hanosuko/server/.env >/dev/null <<EOF
PORT=3000
HOST=127.0.0.1
DB_PATH=/var/lib/hanosuko/views.sqlite
IP_SALT=RANDOM_SECRET
EOF
chmod 600 /var/www/hanosuko/server/.env
chown hanosuko:hanosuko /var/www/hanosuko/server/.env
```

Generate `RANDOM_SECRET` with: `openssl rand -hex 32`.

## 5. systemd unit

Copy `deploy/systemd/hanosuko-api.service` to `/etc/systemd/system/`:

```bash
# from your Mac, after first rsync:
scp deploy/systemd/hanosuko-api.service hanosuko@194.93.2.60:/tmp/
ssh root@194.93.2.60 'mv /tmp/hanosuko-api.service /etc/systemd/system/ && systemctl daemon-reload && systemctl enable hanosuko-api'
```

## 6. Nginx (HTTP first, then certbot upgrades to HTTPS)

```bash
# copy initial HTTP-only conf for the cert challenge:
cat >/etc/nginx/sites-available/hanosuko.art <<'EOF'
server {
    listen 80;
    server_name hanosuko.art www.hanosuko.art;
    root /var/www/hanosuko/dist;
    index index.html;
    location /api/ { proxy_pass http://127.0.0.1:3000; }
    location / { try_files $uri $uri/ /index.html; }
}
EOF
ln -sf /etc/nginx/sites-available/hanosuko.art /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 7. First deploy (from your Mac)

```bash
cd "/Users/stepazilin/Desktop/Новая папка 2"
chmod +x deploy.sh
./deploy.sh
sudo systemctl start hanosuko-api  # (run on server first time)
```

After that, smoke-test:

```bash
curl -i http://hanosuko.art/api/health
curl -i -X POST http://hanosuko.art/api/views
```

## 8. TLS (certbot)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d hanosuko.art -d www.hanosuko.art --redirect --agree-tos -m you@hanosuko.art
```

Then replace `/etc/nginx/sites-available/hanosuko.art` with the full version from `deploy/nginx/hanosuko.art.conf` (certbot's TLS lines stay), and `nginx -t && systemctl reload nginx`.

## 9. Future deploys

Just run `./deploy.sh` from your Mac.
