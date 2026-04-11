# Photo Sharing Application - Backend API

Aplikacja do udostępniania zdjęć z funkcjami społecznościowymi, wbudowanym systemem bezpieczeństwa i panelem administracyjnym.

## Wymagania

- Node.js >= 16.0.0
- Docker & Docker Compose
- MariaDB (lub MySQL 5.7+)

## Struktura projektu

```
server/
├── src/
│   ├── index.js          # Entry point aplikacji
│   ├── config/
│   │   └── database.js   # Konfiguracja połączenia z bazą danych
│   ├── middleware/
│   │   └── auth.js       # Middleware autentykacji JWT
│   └── routes/
│       ├── auth.js       # Rejestracja i logowanie
│       ├── users.js      # Profil użytkownika
│       ├── photos.js     # Zarządzanie zdjęciami
│       ├── comments.js   # Komentarze
│       ├── likes.js      # Polubienia
│       ├── friends.js    # System znajomych
│       ├── follows.js    # Obserwowanie użytkowników
│       ├── blocks.js     # Blokowanie użytkowników
│       ├── search.js     # Wyszukiwanie
│       └── admin.js      # Panel administracyjny
├── database/
│   └── schema.sql        # Schemat bazy danych
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
```

## Baza danych - Schemat tabel

### Tabele główne:

1. **users** - Użytkownicy sistemu
   - id, username, email, password_hash
   - first_name, last_name, bio, profile_image_url
   - created_at, updated_at, is_active

2. **photos** - Zdjęcia użytkowników
   - id, user_id, title, description, image_url, file_size
   - created_at, updated_at, is_deleted

3. **comments** - Komentarze pod zdjęciami
   - id, photo_id, user_id, content
   - created_at, updated_at, is_deleted

4. **likes** - Polubienia zdjęć
   - id, photo_id, user_id, created_at
   - UNIQUE KEY (photo_id, user_id)

5. **tags** - Znaczniki do zdjęć
   - id, name, created_at

6. **photo_tags** - Powiązanie zdjęć i tagów (M2M)
   - id, photo_id, tag_id

7. **friendships** - Relacje przyjazni
   - id, requester_id, receiver_id
   - status (pending, accepted, rejected)

8. **follows** - Obserwowanie użytkowników
   - id, follower_id, following_id, created_at

9. **blocks** - Blokowanie użytkowników
   - id, blocker_id, blocked_id, reason, created_at

10. **storage_info** - Informacje o dysku
    - id, user_id, total_size_bytes, photo_count

11. **user_sessions** - Sesje użytkowników
    - id, user_id, token_hash, ip_address, user_agent
    - expires_at, is_revoked

12. **notifications** - Powiadomienia
    - id, user_id, type, related_user_id, related_photo_id
    - message, is_read, created_at

13. **admin_logs** - Logi administratora
    - id, admin_id, action, target_table, target_id, description

## Instalacja i uruchomienie

### 1. Bez Docker (lokalne uruchomienie)

```bash
# Zainstalować zależności
npm install

# Skopiować plik konfiguracyjny
cp .env.example .env

# Edytować .env z właściwymi danymi do bazy
nano .env

# Uruchomić migrację bazy danych
mysql -u root -p photo_sharing_db < database/schema.sql

# Uruchomić serwer
npm start

# Lub w trybie development ze zmianami na żywo
npm run dev
```

### 2. Z Docker (rekomendowane)

```bash
# Skopiować plik konfiguracyjny
cp .env.example .env

# Edytować .env jeśli potrzeba
# nano .env

# Budować i uruchamiać kontenery
docker-compose up -d

# Sprawdzić logi
docker-compose logs -f api

# Zatrzymać kontenery
docker-compose down
```

Serwer będzie dostępny na `http://localhost:3000`

## Endpoints API

### Autentykacja
- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie

### Użytkownicy
- `GET /api/users/:userId` - Profil użytkownika
- `PUT /api/users/:userId` - Aktualizacja profilu
- `GET /api/users/:userId/stats` - Statystyki użytkownika

### Zdjęcia
- `GET /api/photos/user/:userId` - Zdjęcia użytkownika
- `GET /api/photos/:photoId` - Szczegóły zdjęcia
- `POST /api/photos` - Dodanie zdjęcia
- `DELETE /api/photos/:photoId` - Usunięcie zdjęcia

### Komentarze
- `GET /api/comments/photo/:photoId` - Komentarze do zdjęcia
- `POST /api/comments` - Dodanie komentarza
- `DELETE /api/comments/:commentId` - Usunięcie komentarza

### Polubienia
- `POST /api/likes` - Polubienie zdjęcia
- `DELETE /api/likes/:photoId` - Usunięcie polubienia
- `GET /api/likes/:photoId` - Liczba polubeń

### Przyjaciele
- `POST /api/friends/request` - Wysłanie zaproszenia
- `POST /api/friends/accept/:requestId` - Zaakceptowanie
- `POST /api/friends/reject/:requestId` - Odrzucenie
- `DELETE /api/friends/:friendId` - Usunięcie z przyjaciół
- `GET /api/friends/:userId` - Lista przyjaciół

### Obserwowanie
- `POST /api/follows` - Obserwowanie użytkownika
- `DELETE /api/follows/:followingId` - Zaprzestanie obserwowania
- `GET /api/follows/:userId/followers` - Lista obserwujących
- `GET /api/follows/:userId/following` - Lista obserwowanych
- `GET /api/follows/feed` - Feed zdjęć obserwowanych użytkowników

### Blokowanie
- `POST /api/blocks` - Zablokowanie użytkownika
- `DELETE /api/blocks/:blockedId` - Odblokowanie
- `GET /api/blocks/list` - Lista zablokowanych
- `GET /api/blocks/check/:blockedId` - Sprawdzenie statusu bloku

### Wyszukiwanie
- `GET /api/search/photos?q=query` - Wyszukiwanie zdjęć
- `GET /api/search/users?q=query` - Wyszukiwanie użytkowników
- `GET /api/search/tags?q=query` - Wyszukiwanie tagów

### Admin
- `GET /api/admin/stats/storage` - Statystyki pamięci
- `GET /api/admin/stats/users` - Statystyki użytkowników
- `GET /api/admin/graph/friendships` - Graf znajomości
- `GET /api/admin/logs/activity` - Logi aktywności
- `GET /api/admin/content/popular` - Popularna zawartość
- `POST /api/admin/logs/action` - Zarejestrowanie akcji

## Autentykacja

Serwer używa JWT (JSON Web Tokens) dla autentykacji. Token otrzymany przy logowaniu powinien być wysłany w nagłówku:

```
Authorization: Bearer <token>
```

## Zmienne środowiska

```env
# Database
DB_HOST=localhost
DB_USER=photo_user
DB_PASSWORD=user_password
DB_NAME=photo_sharing_db
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRATION=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Admin
ADMIN_SECRET=admin_secret_key
```

## Bezpieczeństwo

- Hasła haszowane za pomocą bcrypt
- JWT dla autentykacji
- CORS skonfigurowany
- Helmet.js dla nagłówków bezpieczeństwa
- Walidacja danych wejściowych (express-validator)
- System blokowania użytkowników
- Prywatne zdjęcia i komentarze dla zablokowanych użytkowników

## Responsywność

API jest desktopowo i mobilnie agnostyczne - zwraca JSON, umożliwiając łatwą integrację z dowolnym frontendem (Svelte, React, Vue, itp.)

## Wsparcie

Dla problemów lub pytań, sprawdź dokumentację projektu w głównym katalogu `Projekt.txt`
