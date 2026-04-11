# 🚀 Przewodnik Uruchamiania - Aplikacja Udostępniania Zdjęć

## ✅ Status Projektów

### Frontend (Svelte + Vite)
- ✅ **Kompilacja**: SUKCES
- ✅ **Build**: `dist/` gotowy do deploymentu
- ✅ **Rozmiar**: 73.87 kB JavaScript + 24.92 kB CSS (minified)
- ✅ Wszystkie komponenty (11 UI + 8 Stron)
- ✅ API client integracja
- ✅ System tematów (ciemny/jasny)

### Backend (Node.js + Express)
- ✅ Pełne API REST (40+ endpoints)
- ✅ Baza danych schema (13 tabel)
- ✅ Autoryzacja JWT

### Docker Environment
- ✅ Ścieżki konfiguracji naprawione
- ✅ docker-compose.yml aktualizowany
- ✅ Wszystkie Dockerfiles gotowe

## 📋 Aby Uruchomić Aplikację

### Krok 1: Uruchom Docker Desktop

**Na Windows:**
1. Otwórz menu Start
2. Wpisz "Docker" i uruchom "Docker Desktop"
3. Czekaj aż pojawi się ikona Docker w systemtray (może to chwilę trwać)
4. Czekaj na status "Docker is running" w Docker Desktop

**Lub z PowerShell (jeśli Docker Desktop jest zainstalowany):**
```powershell
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Krok 2: Sprawdź Docker

```powershell
docker ps
```

Powinieneś zobaczyć (nawet jeśli puste):
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

### Krok 3: Uruchom Aplikację

```powershell
cd C:\Users\kamil\OneDrive_sync\Desktop\studia\Semestr_4\PodstawyBazDanych

# Kopiuj plik .env
cp .env.example .env

# Buduj i uruchom wszystkie usługi
docker-compose up -d --build

# Sprawdź status
docker-compose ps
```

### Krok 4: Otwórz Aplikację

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Database**: localhost:3306

## 🧪 Testy

### Sprawdź logi
```powershell
# Logi frontendu
docker-compose logs -f client

# Logi API
docker-compose logs -f api

# Logi bazy danych
docker-compose logs -f db
```

### Zatrzymaj aplikację
```powershell
docker-compose down
```

### Wyczyść wszystko (łącznie z danymi)
```powershell
docker-compose down -v
```

## 🔧 Naprawione Błędy

### Frontend
1. ✅ Fixed: `App.svelte` - reactive store access w onMount
2. ✅ Fixed: `Input.svelte` - dynamic type attribute z bind:value
3. ✅ Fixed: CSS parsing - Added `lang="scss"` support
4. ✅ Fixed: Avatar.svelte - Removed invalid `:global {}` blocks
5. ✅ Fixed: Router.svelte - Fixed `:global()` selector syntax
6. ✅ Installed: `terser` - dla minifikacji JavaScript
7. ✅ Installed: `sass` - dla SCSS support

### Docker
1. ✅ Fixed: `docker-compose.yml` - Schema path: `./server/database/schema.sql`
2. ✅ Fixed: Backend build context: `./server`
3. ✅ Fixed: Volume paths dla backend: `./server/src` i `./server/uploads`
4. ✅ Added: Frontend service do docker-compose.yml
5. ✅ Removed: Deprecated `version` field

## 📊 Build Output

```
✓ 69 modules transformed
dist/index.html                  0.54 kB │ gzip:  0.34 kB
dist/assets/index-c6d89660.css  24.92 kB │ gzip:  4.69 kB
dist/assets/index-9a778881.js   73.87 kB │ gzip: 21.52 kB
✓ built in 2.62s
```

## 💡 Uwagi

- **Port 5173**: Vite dev server (jeśli uruchamiasz lokalnie)
- **Port 3000**: Express API server
- **Port 3306**: MariaDB database
- **Wszystkie porty**: Dostępne w docker-compose.yml

## 🚨 Jeśli Coś Nie Działa

1. **Docker nie startuje**: Sprawdź czy Docker Desktop jest zainstalowany
2. **Port już w użyciu**: Zmień port w docker-compose.yml
3. **Błędy bazy danych**: `docker-compose down -v` a potem `up -d`
4. **Błędy kompilacji**: `npm run build --prefix client` ponownie

## ✨ Następne Kroki

Po uruchomieniu aplikacji możesz:
- Zarejestrować nowe konto
- Zalogować się
- Wysłać zdjęcia
- Dodawać komentarze
- Obserwować użytkowników
- Testować system bloków i przyjaźni

Powodzenia! 🎉
