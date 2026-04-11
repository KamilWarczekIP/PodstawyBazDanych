# Database Schema Documentation

## Przegląd

Baza danych zawiera 13 tabel zaprojektowanych do obsługi aplikacji do udostępniania zdjęć z funkcjami społecznościowymi. Schemat obsługuje wszystkie wymagania projektu: autentykację, udostępnianie zdjęć, komentarze, polubienia, system znajomych, obserwowanie, blokowanie i panel administracyjny.

## Diagram Relacji

```
users (1) ──────────────────→ (N) photos
  ↓                              ↓
  ├─→ (N) comments             ├─→ (N) likes
  ├─→ (N) friendships          ├─→ (N) comments
  ├─→ (N) follows              ├─→ (N) photo_tags
  ├─→ (N) blocks                   ↓
  ├─→ (N) user_sessions        (N) tags
  ├─→ (N) notifications
  └─→ (1) storage_info
```

## Tabele Szczegółowo

### 1. users
Przechowuje informacje o użytkownikach aplikacji.

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

**Kolumny:**
- `id`: Unikalny identyfikator użytkownika (PK)
- `username`: Unikalna nazwa użytkownika
- `email`: Unikalny email do logowania
- `password_hash`: Haszowane hasło (bcrypt)
- `first_name`, `last_name`: Dane personalne
- `bio`: Krótki opis profilu
- `profile_image_url`: URL zdjęcia profilowego
- `is_active`: Czy konto jest aktywne (softdelete)

**Indeksy:**
- PK na id dla szybkiego dostępu
- UNIQUE na username i email dla szybkiego logowania
- INDEX na created_at dla sortowania

---

### 2. photos
Przechowuje metadane o zdjęciach użytkowników.

```sql
CREATE TABLE photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_title_description (title, description)
);
```

**Klucze:**
- Foreign Key do users: Usunięcie użytkownika usuwa jego zdjęcia (CASCADE)
- FULLTEXT INDEX: Szybkie wyszukiwanie po tytule i opisie

**Softdelete:**
- `is_deleted` zamiast fizycznego usuwania (możliwość przywrócenia)

---

### 3. comments
Komentarze do zdjęć.

```sql
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    photo_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_photo_id (photo_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

**Własności:**
- CASCADE delete: Usunięcie zdjęcia usuwa komentarze
- is_deleted: Softdelete dla komentarzy
- Chronologiczny porządek komentarzy

---

### 4. likes
Polubienia zdjęć - tabela pośrednia One-to-Many.

```sql
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    photo_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (photo_id, user_id),
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_photo_id (photo_id),
    INDEX idx_user_id (user_id)
);
```

**Ograniczenia:**
- UNIQUE constraint na (photo_id, user_id): Jeden user może polubić zdjęcie tylko raz
- Szybkie wyszukiwanie polubeń danego użytkownika dla konkretnego zdjęcia

---

### 5. tags
Słowa kluczowe do kategoryzacji zdjęć.

```sql
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FULLTEXT INDEX ft_name (name),
    INDEX idx_name (name)
);
```

**Indeksy:**
- UNIQUE: Unikatowe tagi
- FULLTEXT: Szybkie wyszukiwanie tagów

---

### 6. photo_tags
Powiązanie Many-to-Many między photos i tags.

```sql
CREATE TABLE photo_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    photo_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_photo_tag (photo_id, tag_id),
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_photo_id (photo_id),
    INDEX idx_tag_id (tag_id)
);
```

**Cechy:**
- M2M relacja
- UNIQUE constraint: Każdy tag może być przypisany do zdjęcia tylko raz
- Umożliwia wyszukiwanie zdjęć po tagach

---

### 7. friendships
System znajomych z proszbami.

```sql
CREATE TABLE friendships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_friendship (requester_id, receiver_id),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_requester_id (requester_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_status (status)
);
```

**Status Enum:**
- `pending`: Zaproszenie wysłane, oczekuje na odpowiedź
- `accepted`: Użytkownicy są przyjaciółmi
- `rejected`: Zaproszenie odrzucone

**Uwagi:**
- UNIQUE constraint zapobiega duplikatom
- Indeks na status dla szybkiego znajdowania oczekujących zaproszeń

---

### 8. follows
Obserwowanie użytkowników.

```sql
CREATE TABLE follows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id)
);
```

**Różnica od friendships:**
- Jednostronny: A może obserwować B bez reciprocal
- Brak statusu: Zawsze aktywny po utworzeniu
- Używany do wyświetlania feed'u

---

### 9. blocks
Blokowanie użytkowników - najważniejszy element prywatności.

```sql
CREATE TABLE blocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_block (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_blocker_id (blocker_id),
    INDEX idx_blocked_id (blocked_id)
);
```

**Implementacja Prywatności:**
- Wszystkie zapytania sprawdzają blocks tabele
- Zalogowany użytkownik nie widzi zdjęć/komentarzy zablokowanych osób
- Zarówno photos, comments, follows są filtrowane w SQL

---

### 10. storage_info
Monitorowanie użycia dysku.

```sql
CREATE TABLE storage_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_size_bytes BIGINT DEFAULT 0,
    photo_count INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_storage (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Przeznaczenie:**
- 1:1 relacja z users
- Szybkie uzyskiwanie statystyk dysku
- Używane w panelu administracyjnym

---

### 11. user_sessions
Zarządzanie sesjami użytkowników.

```sql
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

**Funkcje:**
- Śledzenie tokenów JWT
- IP address i user_agent dla bezpieczeństwa
- Wygaśnięcie sesji
- Możliwość wycofania sesji (logout)

---

### 12. notifications
Powiadomienia dla użytkowników.

```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    related_user_id INT,
    related_photo_id INT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (related_photo_id) REFERENCES photos(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);
```

**Typy powiadomień:**
- `comment`: Ktoś skomentował zdjęcie
- `like`: Ktoś polubił zdjęcie
- `friend_request`: Zaproszenie do przyjaciół
- `follow`: Ktoś zaczął obserwować

---

### 13. admin_logs
Logi akcji administracyjnych.

```sql
CREATE TABLE admin_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at)
);
```

**Przeznaczenie:**
- Audyt działań administracyjnych
- Historia zmian w systemie
- Śledzenie problematycznych akcji

---

## Optymalizacje

### Indeksy
- PRIMARY KEY na wszystkich tabelach
- FOREIGN KEY indeksy dla JOIN operacji
- UNIQUE KEY na polach wymagających unikalności
- FULLTEXT na title, description, name dla wyszukiwania
- INDEX na foreign keys dla szybkich relacji

### JOIN Queries
- Wszystkie queries używające relationships odwołują się do indeksów
- N+1 problem rozwiązywany poprzez batch queries w backendu

### Softdelete
- `is_deleted` zamiast fizycznego DELETE
- Umożliwia przywracanie danych
- Zachowuje integralność danych referencyjnych

### Cascade Operations
- DELETE CASCADE na zdjęciach: Usunięcie użytkownika usuwa jego zdjęcia
- DELETE CASCADE na komentarzach i polubienia
- SET NULL na notifications dla opcjonalnych FK

---

## Bezpieczeństwo

### Privacy (Blokowanie)
```sql
-- Przykład: Pobieranie zdjęć, z pominięciem zablokowanych
SELECT p.* FROM photos p
WHERE p.user_id NOT IN (
    SELECT blocked_id FROM blocks WHERE blocker_id = ?
    UNION
    SELECT blocker_id FROM blocks WHERE blocked_id = ?
);
```

### Data Integrity
- FOREIGN KEY constraints
- UNIQUE constraints
- NOT NULL constraints gdzie potrzebne

### Password Security
- `password_hash` nie przechowuje tekstu
- bcryptjs używany w aplikacji

---

## Przykładowe Queries

### Pobranie profilu z statystykami
```sql
SELECT 
    u.*,
    COUNT(DISTINCT p.id) as photo_count,
    COUNT(DISTINCT f.id) as follower_count
FROM users u
LEFT JOIN photos p ON u.id = p.user_id AND p.is_deleted = FALSE
LEFT JOIN follows f ON u.id = f.following_id
WHERE u.id = 1
GROUP BY u.id;
```

### Feed zdjęć obserwowanych użytkowników
```sql
SELECT p.* FROM photos p
JOIN follows f ON p.user_id = f.following_id
WHERE f.follower_id = 1
AND p.is_deleted = FALSE
AND p.user_id NOT IN (
    SELECT blocked_id FROM blocks WHERE blocker_id = 1
    UNION
    SELECT blocker_id FROM blocks WHERE blocked_id = 1
)
ORDER BY p.created_at DESC;
```

### Wyszukiwanie zdjęć z tagami
```sql
SELECT DISTINCT p.* FROM photos p
JOIN photo_tags pt ON p.id = pt.photo_id
JOIN tags t ON pt.tag_id = t.id
WHERE t.name = 'nature'
AND p.is_deleted = FALSE;
```

---

## Skalowanie

Dla większej liczby użytkowników rozważ:
- **Partycjonowanie**: photos i comments mogą być partycjonowane po user_id
- **Read Replicas**: Dla zapytań SELECT (SELECT-heavy workload)
- **Caching**: Redis dla notifications i feed'u
- **Archivizacja**: Przenieść stare dane do archive tables

---

## Wersja
- **Schemat v1.0** - Pełna implementacja wymagań projektu
- **Data**: 2024-01-01
