# Development Guide

## Development Environment Setup

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- Docker & Docker Compose (https://www.docker.com/)
- Git (https://git-scm.com/)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd photo-sharing-app

# Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## Development Workflow

### Option 1: Full Docker Development
Best for testing the complete app as it will be deployed.

```bash
# Copy environment file
cp .env.example .env

# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f client
docker-compose logs -f api
docker-compose logs -f db

# Stop services
docker-compose down
```

### Option 2: Local Development (Recommended for Development)
Best for fast development with hot reload.

```bash
# Terminal 1: Backend (port 3000)
cd server
npm run dev

# Terminal 2: Frontend (port 5173)
cd client
npm run dev

# Terminal 3: Database (if not using Docker)
docker run -d \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=photo_sharing_db \
  -e MYSQL_USER=photo_user \
  -e MYSQL_PASSWORD=user_password \
  -p 3306:3306 \
  mariadb:latest
```

### Option 3: Mixed Development
Backend in Docker, frontend local development.

```bash
# Start backend and database
docker-compose up -d api db

# Frontend in local terminal with hot reload
cd client
npm run dev
```

## Common Development Tasks

### Creating a New Component

1. **Create component file** in `client/src/components/`:
```svelte
<script>
  export let prop1 = 'default';
  export let onClick = () => {};
</script>

<div class="component">
  <h1>{prop1}</h1>
  <button on:click={onClick}>Click me</button>
</div>

<style>
  .component {
    padding: var(--spacing-md);
    background-color: var(--surface);
  }
</style>
```

2. **Import in parent component**:
```svelte
<script>
  import MyComponent from './MyComponent.svelte';
</script>

<MyComponent prop1="value" onClick={handleClick} />
```

### Creating a New API Endpoint

1. **Create route file** in `server/src/routes/`:
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/endpoint', auth, async (req, res) => {
  try {
    // Implementation
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

2. **Register route** in `server/src/index.js`:
```javascript
app.use('/api/myroute', require('./routes/myroute'));
```

3. **Add API client function** in `client/src/api.js`:
```javascript
export const myAPI = {
  endpoint: () => apiRequest('/myroute/endpoint', { method: 'POST' })
};
```

### Modifying the Database

1. **Create migration** or modify `server/database/schema.sql`
2. **Restart database**:
```bash
docker-compose down -v  # Remove volume
docker-compose up -d db  # Restart with new schema
```

### Updating Theme

Edit `client/src/theme.js` for design tokens:
```javascript
export const lightTheme = {
  primaryColor: '#e91e63',
  secondaryColor: '#2196f3',
  // ... more colors
};
```

And `client/src/global.css` for CSS variables:
```css
:root {
  --primary: #e91e63;
  --secondary: #2196f3;
  /* ... */
}
```

## Debugging

### Frontend Debugging

1. **Browser DevTools**:
   - Open Chrome/Firefox DevTools (F12)
   - Sources tab for breakpoints
   - Console tab for errors
   - Network tab for API calls

2. **Svelte DevTools**:
   - Install browser extension
   - Inspect component state
   - Time-travel debug

3. **Vite Debug**:
   ```bash
   # Check console output for HMR messages
   npm run dev
   ```

### Backend Debugging

1. **Console Logs**:
```javascript
console.log('Debug info:', variable);
console.error('Error info:', error);
```

2. **Node Debugger**:
```bash
node --inspect server/src/index.js
# Open chrome://inspect in Chrome
```

3. **VSCode Debugger**:
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/server/src/index.js"
    }
  ]
}
```

### Database Debugging

```bash
# Access database
mysql -h localhost -u photo_user -puser_password photo_sharing_db

# Useful queries
SHOW TABLES;
SELECT * FROM users;
DESC users;  # Show schema
EXPLAIN SELECT ... ;  # Query plan
```

## Testing

### Manual Testing Checklist

- [ ] Register new account
- [ ] Login with credentials
- [ ] Upload a photo
- [ ] Add comment to photo
- [ ] Like a photo
- [ ] Search for photos
- [ ] Follow a user
- [ ] Block a user
- [ ] Edit profile
- [ ] Switch theme (dark/light)
- [ ] Test responsive mobile layout
- [ ] Logout

### API Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get photos (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/photos

# Upload photo (with FormData)
curl -X POST http://localhost:3000/api/photos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Photo" \
  -F "description=A beautiful photo" \
  -F "image=@photo.jpg"
```

## Performance Optimization

### Frontend
- Use Svelte's reactivity efficiently (avoid unnecessary updates)
- Lazy load images
- Code split routes
- Minimize component bundle size

### Backend
- Add database indexes for frequently queried fields
- Use pagination for large result sets
- Cache responses when appropriate
- Monitor slow queries

### Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_photo_user_id ON photos(user_id);
CREATE INDEX idx_comment_photo_id ON comments(photo_id);
```

## Deployment

### Pre-deployment Checklist

- [ ] Update environment variables in `.env`
- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Test in Docker locally
- [ ] Run database migrations
- [ ] Test all features end-to-end
- [ ] Check Console for JavaScript errors
- [ ] Verify responsive design works
- [ ] Test on slow networks
- [ ] Review security settings

### Docker Deployment

```bash
# Build production images
docker-compose build

# Run tests
docker-compose up -d
docker-compose exec api npm test

# Deploy
docker-compose up -d

# Monitor
docker-compose logs -f
docker stats  # View resource usage
```

### Scaling Considerations

- Use load balancer for multiple instances
- Database read replicas for high traffic
- Redis for caching
- CDN for static assets
- Horizontal scaling with Kubernetes

## Troubleshooting Common Issues

### "Cannot find module" errors
```bash
cd server && npm install
cd client && npm install
rm -rf node_modules package-lock.json && npm install
```

### Port already in use
```bash
# Find process using port
lsof -i :3000
lsof -i :5173

# Kill process
kill -9 PID
```

### Database connection issues
```bash
# Check MariaDB is running
docker ps | grep mariadb

# Verify credentials
mysql -h 127.0.0.1 -u photo_user -puser_password

# Reset database
docker-compose down -v
docker-compose up -d db
```

### Build failures
```bash
# Clean build
rm -rf dist build .vite
npm run build

# Check Node version
node -v  # Should be 18+

# Update npm
npm install -g npm@latest
```

## Code Style Guidelines

### Svelte Components
```svelte
<script>
  // Props first
  export let title = 'Default';
  export let onClick = () => {};

  // Imports
  import Button from './Button.svelte';

  // Logic
  let count = 0;

  function handleClick() {
    count++;
  }
</script>

<!-- Template -->
<div class="component">
  <h1>{title}</h1>
  <Button label="Click" onClick={handleClick} />
</div>

<style>
  /* Scoped styles only */
  .component {
    color: var(--on-surface);
  }
</style>
```

### JavaScript/Node.js
```javascript
// Use async/await
async function fetchData() {
  try {
    const response = await fetch('/api/endpoint');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Use const, avoid var
const config = { /* ... */ };

// Use meaningful names
const userProfiles = [];  // ✓ Good
const data = [];          // ✗ Bad
```

### CSS
```css
/* Use CSS variables */
.component {
  background: var(--surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);
}

/* Mobile-first responsive */
@media (min-width: 768px) {
  /* Tablet and up */
}
```

## Resources

- **Svelte Docs**: https://svelte.dev
- **Vite Docs**: https://vitejs.dev
- **Express Docs**: https://expressjs.com
- **MariaDB Docs**: https://mariadb.com/kb/
- **Docker Docs**: https://docs.docker.com

## Getting Help

1. **Check existing issues** in the repository
2. **Read the documentation** files (README, API_DOCUMENTATION.md)
3. **Check browser console** for JavaScript errors
4. **Check server logs**: `docker-compose logs api`
5. **Check database status**: Verify MariaDB is accessible

## Contributing

1. Create a new branch for your feature
2. Follow code style guidelines
3. Test thoroughly before submitting
4. Create a pull request with description

Happy coding! 🚀
