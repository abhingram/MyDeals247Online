# 🚀 Quick Deployment Commands - Deals247

## Initial Setup (Run Once)

```bash
# 1. Connect to VPS
ssh root@YOUR_VPS_IP

# 2. Install everything
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs mysql-server nginx git build-essential
sudo npm install -g pm2

# 3. Setup MySQL
sudo mysql_secure_installation
sudo mysql -u root -p
```

```sql
CREATE DATABASE deals247_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'deals247_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON deals247_db.* TO 'deals247_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 4. Clone & Setup
cd /var/www
sudo git clone https://github.com/abhingram/MyDeals247.git deals247
sudo chown -R $USER:$USER /var/www/deals247
cd /var/www/deals247

# 5. Configure environment (edit these files)
nano server/.env
nano .env.production

# 6. Install & Build
npm install
npm run build

# 7. Setup database
mysql -u deals247_user -p deals247_db < server/database/schema.sql
mysql -u deals247_user -p deals247_db < server/database/business_schema.sql

# 8. Start backend
pm2 start server/index.js --name deals247-backend
pm2 save
pm2 startup systemd

# 9. Configure Nginx
sudo nano /etc/nginx/sites-available/deals247
sudo ln -s /etc/nginx/sites-available/deals247 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Setup SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 11. Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Daily Operations

### Deploy Updates
```bash
cd /var/www/deals247
git pull origin main
npm install
npm run build
pm2 restart deals247-backend
```

### Check Status
```bash
pm2 status                          # Backend status
pm2 logs deals247-backend           # View logs
sudo systemctl status nginx         # Nginx status
```

### Restart Services
```bash
pm2 restart deals247-backend        # Restart backend
sudo systemctl restart nginx        # Restart Nginx
sudo systemctl restart mysql        # Restart MySQL
```

## Information You'll Need

**Before Starting, Have Ready:**
- ✅ VPS IP Address
- ✅ Domain name
- ✅ SSH credentials
- ✅ MySQL passwords (you'll create)
- ✅ Firebase credentials

**What to Update:**
1. `server/.env` - Backend configuration
2. `.env.production` - Frontend configuration
3. `/etc/nginx/sites-available/deals247` - Replace "yourdomain.com"
4. Certbot command - Replace "yourdomain.com"

## Troubleshooting

```bash
# Backend issues
pm2 logs deals247-backend --lines 50

# Nginx issues
sudo tail -f /var/log/nginx/error.log

# Check if port is in use
sudo lsof -i :5000

# Rebuild frontend
cd /var/www/deals247
npm run build

# Database access
mysql -u deals247_user -p deals247_db
```

## 🎯 Your Action Items

1. ✅ **DONE** - Code pushed to GitHub
2. ⏳ Collect VPS information (IP, credentials)
3. ⏳ Point domain to VPS IP
4. ⏳ Follow VPS_DEPLOYMENT_GUIDE.md step-by-step
5. ⏳ Configure environment variables
6. ⏳ Setup SSL certificate
7. ⏳ Test the application

**Full guide:** See `VPS_DEPLOYMENT_GUIDE.md` for detailed steps!
