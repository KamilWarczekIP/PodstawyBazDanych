# Szybki Start (Quick Start Guide)

## 🚀 Uruchomienie w 5 minut

### Opcja 1: Docker (Rekomendowane)

```bash
# 1. Przejdź do mainu projektu
cd c:\Users\kamil\OneDrive_sync\Desktop\studia\Semestr_4\PodstawyBazDanych

# 2. Skopiuj plik konfiguracji
copy .env.docker .env

# 3. Uruchom Docker Compose
docker-compose up -d

# 4. Czekaj na start (baza danych inicjalizuje się automatycznie)
# Sprawdzenie statusu:
docker-compose ps

# 5. API jest gotowe!
# Otwórz w przeglądarce: http://localhost:3000/api/health
```

✅ **Gotowe!** Baza danych i API są uruchomione.

---

### Opcja 2: Lokalne uruchomienie (Node.js + MariaDB)

```bash
# 1. Zainstaluj MariaDB (jeśli nie masz)
# Windows: https://mariadb.org/download/
# macOS: brew install mariadb
# Linux: sudo apt-get install mariadb-server

# 2. Przejdź do folderu serwera
cd server

# 3. Zainstaluj zależności
npm install

# 4. Skopiuj plik konfiguracji
copy .env.example .env

# 5. Utwórz bazę danych i zaimportuj schemat
node init.js init

# 6. Uruchom serwer
npm start

# 7. API jest gotowe!
# Otwórz w przeglądarce: http://localhost:3000/api/health
```

✅ **Gotowe!** Serwer jest uruchomiony na localhost:3000

---

## 🧪 Testowanie API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Rejestracja
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Logowanie
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Otrzymasz odpowiedź z tokenem JWT. Zapisz go!

### Pobieranie profilu (z tokenem)
```bash
curl http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Struktura Plików

```
PodstawyBazDanych/
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── index.js                 # Entry point
│   │   ├── config/database.js       # Połączenie z bazą
│   │   ├── middleware/auth.js       # Autentykacja JWT
│   │   └── routes/                  # Wszystkie endpoint'y
│   ├── database/schema.sql          # Schemat bazy danych
│   ├── package.json
│   ├── Dockerfile
│   ├── .env                         # Zmienne środowiska
│   ├── .env.example
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   └── init.js                      # Setup script
├── client/                          # Frontend (Svelte) - do stworzenia
├── docker-compose.yml               # Orkestracja Docker
├── DATABASE_SCHEMA_DOCUMENTATION.md # Szczegóły bazy danych
├── DEPLOYMENT_GUIDE.md              # Wdrażanie na produkcję
├── .env.docker                      # Zmienne dla Docker'a
└── Projekt.txt                      # Specyfikacja projektu
```

---

## 🔑 Zmienne Środowiska

Plik `.env` zawiera wszystkie konfiguracje:

```env
DB_HOST=localhost          # Host bazy danych
DB_USER=root              # Użytkownik bazy
DB_PASSWORD=root_password # Hasło bazy
DB_NAME=photo_sharing_db  # Nazwa bazy
PORT=3000                 # Port API

JWT_SECRET=dev_secret     # Sekret JWT (zmień na produkcji!)
CORS_ORIGIN=http://localhost:5173  # URL frontendu
```

---

## 📚 Dokumentacja

- **[API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)** - Pełna dokumentacja API z przykładami
- **[DATABASE_SCHEMA_DOCUMENTATION.md](DATABASE_SCHEMA_DOCUMENTATION.md)** - Schemat bazy i relacje
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Wdrażanie na produkcję
- **[server/README.md](server/README.md)** - Instrukcje serwera

---

## 🐛 Rozwiązywanie Problemów

### Problem: Port 3000 już zajęty
**Rozwiązanie:**
```bash
# Zmień PORT w pliku .env
PORT=3001

# Lub zabij proces na porcie 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Problem: Błąd "Cannot find module 'mysql2'"
**Rozwiązanie:**
```bash
cd server
npm install
```

### Problem: "Access denied for user 'root'"
**Rozwiązanie:**
- Sprawdź DB_PASSWORD w pliku .env
- Sprawdź czy MariaDB jest uruchomiona
- Reset hasła root w MariaDB

### Problem: Port Docker'a już zajęty
**Rozwiązanie:**
```bash
# Zmień port w docker-compose.yml
# Zmień "3000:3000" na "3001:3000"

# Lub zatrzymaj używający proces
docker ps
docker stop <CONTAINER_ID>
```

---

## 💻 Frontend Integration

Aby połączyć frontend Svelte, ustaw:

1. **W pliku `.env`:**
```env
CORS_ORIGIN=http://localhost:5173
```

2. **W Svelte aplikacji:**
```javascript
const API_URL = 'http://localhost:3000/api';

// Logowanie
async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Żądania z tokenem
async function getUser(userId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
```

---

## 🔐 Bezpieczeństwo

### Produkcja - Ważne!

Przed wdrażaniem zmień:

1. **JWT_SECRET**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **DB_PASSWORD** - silne hasło

3. **ADMIN_SECRET** - zmień na produkcji

4. **NODE_ENV=production**

---

## 📊 Panel Administracyjny

Przykład użycia API admina:

```bash
# Statystyki pamięci
curl http://localhost:3000/api/admin/stats/storage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-admin-secret: admin_secret_key_change_in_production"

# Statystyki użytkowników
curl http://localhost:3000/api/admin/stats/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-admin-secret: admin_secret_key_change_in_production"
```

---

## 🧹 Czyszczenie

### Zatrzymanie (Docker)
```bash
docker-compose down
```

### Usunięcie Container'ów i Danych
```bash
docker-compose down -v
```

### Czyszczenie (Node.js)
```bash
cd server
npm uninstall
rm -rf node_modules
```

---

## ✅ Checklist Implementacji

- [x] Baza danych (13 tabel)
- [x] Autentykacja (Register + Login)
- [x] Profil użytkownika
- [x] Zdjęcia (CRUD)
- [x] Komentarze
- [x] Polubienia
- [x] System przyjaciół
- [x] Obserwowanie
- [x] Blokowanie (z ochroną prywatności)
- [x] Wyszukiwanie (tagi, użytkownicy, tytuł)
- [x] Panel administracyjny
- [x] Docker setup
- [x] JWT autentykacja
- [x] CORS konfiguracja

---

## 📞 Wsparcie

Jeśli masz pytania:
1. Sprawdź dokumentację API
2. Sprawdź logi: `docker-compose logs api`
3. Sprawdź błędy w konsoli Node.js
4. Sprawdź ustawienia .env

---

## 🎯 Następne Kroki

1. **Stwórz frontend Svelte** i połącz z API
2. **Dodaj upload zdjęć** - zintegruj storage (AWS S3, Azure Blob, itp.)
3. **Wdróż aplikację** - patrz DEPLOYMENT_GUIDE.md
4. **Testowanie** - napisz testy jednostkowe
5. **Monitoring** - dodaj logging i monitoring

---

Powodzenia! 🚀
