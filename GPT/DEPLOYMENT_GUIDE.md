# Przewodnik Wdrażania (Deployment Guide)

## Spis treści
1. [Deployment z Docker](#deployment-z-docker)
2. [Deployment bez Docker](#deployment-bez-docker)
3. [Konfiguracja produkcyjna](#konfiguracja-produkcyjna)
4. [Monitorowanie i Utrzymanie](#monitorowanie-i-utrzymanie)

## Deployment z Docker

### Wymagania
- Docker >= 20.10
- Docker Compose >= 1.29

### Kroki Instalacji

1. **Klonuj repozytorium**
```bash
cd /path/to/PodstawyBazDanych
```

2. **Przygotuj plik konfiguracyjny**
```bash
cp .env.docker .env
```

3. **Edytuj zmienne środowiska**
```bash
nano .env
```

Zmień co najmniej:
- `DB_PASSWORD` - hasło do bazy danych
- `JWT_SECRET` - sekretny klucz JWT
- `ADMIN_SECRET` - sekretny klucz admina
- `CORS_ORIGIN` - URL frontendu Svelte

4. **Zbuduj i uruchom kontenery**
```bash
docker-compose up -d
```

5. **Sprawdź status**
```bash
docker-compose ps
docker-compose logs api
```

6. **Baza danych będzie automatycznie zainicjalizowana** dzięki pliku `database/schema.sql`

### Liczby portów
- API: `http://localhost:3000`
- Baza danych: `localhost:3306`

### Zatrzymanie i Usunięcie
```bash
docker-compose down
docker-compose down -v  # z usunięciem wolumenów
```

## Deployment bez Docker

### Wymagania
- Node.js >= 16.0
- MariaDB lub MySQL >= 5.7

### Kroki Instalacji

1. **Zainstaluj MariaDB**

Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install mariadb-server mariadb-client
sudo mysql_secure_installation
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

macOS:
```bash
brew install mariadb
mysql_secure_installation
brew services start mariadb
```

Windows:
- Pobierz z https://mariadb.org/download/
- Uruchom instalator
- Skonfiguruj usługę

2. **Zainstaluj zależności Node.js**
```bash
cd server
npm install
```

3. **Przygotuj zmienne środowiska**
```bash
cp .env.example .env
nano .env
```

Zaktualizuj wartości:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=photo_sharing_db
```

4. **Utwórz bazę danych**
```bash
# Zaloguj się do MySQL
mysql -u root -p

# W MySQL promptu
CREATE DATABASE photo_sharing_db;
EXIT;
```

5. **Zainicjalizuj schemat bazy danych**
```bash
node init.js init
```

6. **Uruchom serwer**
```bash
npm start
```

Lub w trybie development:
```bash
npm run dev
```

Serwer będzie dostępny na `http://localhost:3000`

## Konfiguracja Produkcyjna

### Zmienne Środowiska - Produkcja

```env
# Database (silne hasła!)
DB_HOST=db.example.com
DB_USER=photoapp
DB_PASSWORD=very_strong_password_here
DB_NAME=photo_sharing_db
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=production

# JWT (wygeneruj silne hasła)
JWT_SECRET=generate_with_(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRATION=7d

# CORS (ustaw na adres produkcyjny)
CORS_ORIGIN=https://app.example.com

# Admin
ADMIN_SECRET=generate_strong_admin_secret

# Opcjonalne
MAX_FILE_SIZE=104857600
UPLOAD_DIR=/var/uploads
```

### Generowanie bezpiecznych kluczy

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Admin Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Nginx Reverse Proxy (opcjonalnie)

```nginx
upstream api {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.example.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/ssl/certs/example.crt;
    ssl_certificate_key /etc/ssl/private/example.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy
    location /api/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Limit request rate
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req zone=general burst=20 nodelay;
}
```

### PM2 Process Manager (do zarządzania aplikacją)

```bash
# Instalacja
npm install -g pm2

# Start aplikacji
pm2 start src/index.js --name "photo-api"

# Automatyczne uruchamianie przy reboot
pm2 startup
pm2 save

# Monitorowanie
pm2 monit
pm2 logs photo-api
```

### PM2 Config File (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'photo-sharing-api',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

```bash
pm2 start ecosystem.config.js
```

## Monitorowanie i Utrzymanie

### Logi

```bash
# Docker
docker-compose logs -f api

# PM2
pm2 logs

# System logs
sudo journalctl -u mariadb -f
```

### Backupy Bazy Danych

```bash
# Backup
mysqldump -u root -p photo_sharing_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u root -p photo_sharing_db < backup.sql

# Automatyczny backup (cron)
0 2 * * * mysqldump -u root -ppassword photo_sharing_db > /backups/db_$(date +\%Y\%m\%d).sql
```

### Czyszczenie Starych Logów

```bash
# Usuwanie sesji starszych niż 30 dni
mysql photo_sharing_db -e "DELETE FROM user_sessions WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY);"

# Usuwanie powiadomień starszych niż 90 dni
mysql photo_sharing_db -e "DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);"
```

### Monitorowanie Zdrowia Aplikacji

```bash
# Sprawdzenie health check
curl http://localhost:3000/api/health

# Sprawdzenie bazy danych
mysql -u root -p -e "SELECT COUNT(*) FROM photo_sharing_db.users;"
```

### Aktualizacje

```bash
# Aktualizacja zależności Node.js
npm update

# Sprawdzenie zagrożeń bezpieczeństwa
npm audit

# Naprawa znalezionych luk
npm audit fix
```

### Skalowanie (opcjonalnie)

Aby obsłużyć więcej użytkowników:

1. **Zwiększ liczę instancji Node.js** (PM2 cluster mode)
2. **Skonfiguruj load balancer** (NGINX/HAProxy)
3. **Optymalizuj bazę danych** (indeksy, replikacja)
4. **Zwiększ zasoby serwera** (CPU, RAM)

## Testery & Narzędzia

### cURL Examples

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get User (with token)
curl http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Postman Collection

Importuj URL: Do stworzenia w Postman UI
- Zmień {{BASE_URL}} na http://localhost:3000
- Zmień {{TOKEN}} na token z logowania

## Troubleshooting

### Problem: "Cannot connect to database"
**Rozwiązanie:**
- Sprawdź czy baza danych jest uruchomiona
- Sprawdź zmienne środowiska DB_HOST, DB_USER, DB_PASSWORD
- Sprawdź firewall rules

### Problem: "JWT token invalid"
**Rozwiązanie:**
- Sprawdź czy JWT_SECRET jest poprawnie ustawiony
- Sprawdź czy token nie wygasł
- Sprawdź nagłówek Authorization

### Problem: CORS errors
**Rozwiązanie:**
- Sprawdź zmienną CORS_ORIGIN
- Sprawdź czy frontend wysyła żądanie z poprawnym origin

### Problem: Out of disk space
**Rozwiązanie:**
- Usuń stare backupy
- Sprawdź upload folder
- Zwiększ pojemność dysku
