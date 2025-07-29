# Instrukcje Deploymentu - Tasko

## Przegląd
Tasko to aplikacja React z TypeScript, która używa Vite jako bundlera. Aplikacja może być wdrożona na dowolnym statycznym serwerze (Netlify, Vercel, GitHub Pages, etc.).

## Wymagania
- Node.js 18+ 
- pnpm (lub npm/yarn)
- Git

## Krok 1: Przygotowanie środowiska

### Instalacja zależności
```bash
# Klonowanie repozytorium
git clone <your-repo-url>
cd tasko

# Instalacja zależności
pnpm install
```

### Sprawdzenie czy wszystko działa lokalnie
```bash
# Uruchomienie w trybie deweloperskim
pnpm dev

# Otwórz http://localhost:5173 w przeglądarce
```

## Krok 2: Konfiguracja dla produkcji

### Zmienne środowiskowe (opcjonalne)
Jeśli używasz Supabase, utwórz plik `.env.production`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Konfiguracja routingu (ważne!)
Ponieważ używamy React Router z client-side routing, musimy skonfigurować serwer, żeby przekierowywał wszystkie requesty do `index.html`.

## Krok 3: Build aplikacji

```bash
# Zbudowanie aplikacji dla produkcji
pnpm build

# Sprawdzenie build lokalnie
pnpm preview
```

Po buildzie, pliki będą w katalogu `dist/`.

## Krok 4: Deployment na różnych platformach

### Netlify

1. **Automatyczny deployment:**
   - Połącz repozytorium z Netlify
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: 18 (w ustawieniach)

2. **Ręczny deployment:**
   ```bash
   # Zbuduj aplikację
   pnpm build
   
   # Wgraj zawartość katalogu dist/ na Netlify
   ```

3. **Konfiguracja redirects (ważne!):**
   Utwórz plik `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Vercel

1. **Automatyczny deployment:**
   - Połącz repozytorium z Vercel
   - Framework preset: Vite
   - Build command: `pnpm build`
   - Output directory: `dist`

2. **Ręczny deployment:**
   ```bash
   # Instalacja Vercel CLI
   npm i -g vercel
   
   # Deployment
   vercel --prod
   ```

### GitHub Pages

1. **Konfiguracja Vite:**
   Dodaj do `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/tasko/', // Nazwa repozytorium
     // ... reszta konfiguracji
   })
   ```

2. **Workflow GitHub Actions:**
   Utwórz `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install pnpm
           uses: pnpm/action-setup@v2
           with:
             version: 8
         
         - name: Install dependencies
           run: pnpm install
         
         - name: Build
           run: pnpm build
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

### Firebase Hosting

1. **Instalacja Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Inicjalizacja:**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Konfiguracja `firebase.json`:**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deployment:**
   ```bash
   pnpm build
   firebase deploy
   ```

### Nginx (serwer własny)

1. **Konfiguracja Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/tasko/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache dla statycznych plików
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

2. **Deployment:**
   ```bash
   pnpm build
   sudo cp -r dist/* /var/www/tasko/
   sudo systemctl reload nginx
   ```

## Krok 5: Weryfikacja deploymentu

Po deploymentu sprawdź:

1. **Strona główna** - czy się ładuje
2. **Routing** - czy wszystkie ścieżki działają (np. `/tasks`, `/projects`)
3. **Funkcjonalności** - czy timer, dodawanie zadań, etc. działają
4. **LocalStorage** - czy dane są zapisywane w przeglądarce

## Rozwiązywanie problemów

### Problem: 404 przy odświeżeniu strony
**Rozwiązanie:** Skonfiguruj redirects na wszystkie requesty do `index.html`

### Problem: Białe ekrany
**Rozwiązanie:** Sprawdź console w przeglądarce pod kątem błędów JavaScript

### Problem: Brak stylów
**Rozwiązanie:** Sprawdź czy ścieżki do CSS są poprawne w buildzie

### Problem: Brak danych
**Rozwiązanie:** Aplikacja używa localStorage - dane są przechowywane lokalnie w przeglądarce

## Optymalizacje

### Kompresja
Włącz gzip/brotli na serwerze dla lepszej wydajności.

### Cache
Skonfiguruj cache dla statycznych plików (JS, CSS, obrazy).

### CDN
Rozważ użycie CDN dla szybszego ładowania.

## Monitoring

### Analytics
Dodaj Google Analytics lub podobne narzędzie do śledzenia użytkowników.

### Error tracking
Rozważ dodanie Sentry lub podobnego narzędzia do śledzenia błędów.

## Backup

Ponieważ aplikacja używa localStorage, dane użytkowników są przechowywane lokalnie. Rozważ dodanie funkcji eksportu danych dla użytkowników.

## Szybki Deployment

### Użycie skryptu deploymentu
```bash
# Uruchom interaktywny skrypt deploymentu
pnpm deploy

# Lub bezpośrednio
./scripts/deploy.sh
```

### Ręczny build i deployment
```bash
# Build aplikacji
pnpm build

# Sprawdź build lokalnie
pnpm preview

# Upload zawartości katalogu dist/ na wybraną platformę
```

## Pliki konfiguracyjne

Projekt zawiera gotowe pliki konfiguracyjne dla popularnych platform:

- `netlify.toml` - Konfiguracja Netlify
- `vercel.json` - Konfiguracja Vercel  
- `firebase.json` - Konfiguracja Firebase Hosting
- `.github/workflows/deploy.yml` - GitHub Actions dla GitHub Pages
- `public/_redirects` - Redirects dla Netlify

## Weryfikacja deploymentu

Po deploymentu sprawdź:

1. **Strona główna** - czy się ładuje
2. **Routing** - czy wszystkie ścieżki działają (np. `/tasks`, `/projects`)
3. **Funkcjonalności** - czy timer, dodawanie zadań, etc. działają
4. **LocalStorage** - czy dane są zapisywane w przeglądarce

---

**Uwaga:** Tasko to aplikacja client-side, więc wszystkie dane są przechowywane w localStorage przeglądarki. Nie ma potrzeby konfiguracji bazy danych na serwerze. 