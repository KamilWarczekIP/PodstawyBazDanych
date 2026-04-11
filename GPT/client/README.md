# Photo Sharing Application

Complete photo sharing application with Svelte frontend, Node.js/Express backend, and MariaDB database.

## Features

- **User Authentication**: Register and login with JWT authentication
- **Photo Management**: Upload, view, and delete photos
- **Social Features**: 
  - Follow other users
  - Add friends
  - Like and comment on photos
  - Block users
- **Search**: Search by photos, users, or tags
- **Profile Management**: Edit profile information
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Theme switcher with persistent storage
- **Admin Panel**: View statistics and manage content

## Tech Stack

### Frontend
- **Framework**: Svelte 4 with Vite
- **Routing**: Hash-based routing (SPA)
- **State Management**: Svelte stores with localStorage
- **Styling**: CSS custom properties with Material Design 3
- **Deployment**: Docker with Node.js/Serve

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MariaDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet.js, CORS, input validation

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Copy environment file and customize if needed
cp .env.example .env

# Start all services (database, API, frontend)
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# API: http://localhost:3000
# Database: localhost:3306
```

### Option 2: Manual Setup

#### Database Setup
```bash
# Start MariaDB
docker run -d \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=photo_sharing_db \
  -e MYSQL_USER=photo_user \
  -e MYSQL_PASSWORD=user_password \
  -p 3306:3306 \
  mariadb:latest

# Import schema
mysql -h localhost -u photo_user -puser_password photo_sharing_db < server/database/schema.sql
```

#### Backend Setup
```bash
cd server
npm install
npm start
# Server runs on http://localhost:3000
```

#### Frontend Setup
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## Project Structure

```
.
├── client/                 # Svelte frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components and router
│   │   ├── api.js         # API client
│   │   ├── store.js       # Svelte stores (state management)
│   │   ├── theme.js       # Design tokens
│   │   ├── global.css     # Global styles
│   │   └── App.svelte     # Root component
│   ├── Dockerfile         # Frontend Docker image
│   └── vite.config.js     # Vite build configuration
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Custom middleware
│   │   └── index.js       # Express app entry
│   ├── database/
│   │   └── schema.sql     # Database schema
│   ├── Dockerfile         # Backend Docker image
│   └── package.json       # Backend dependencies
│
├── docker-compose.yml     # Multi-container orchestration
├── .env.example           # Environment variables template
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

### Photos
- `GET /api/photos` - List all photos
- `GET /api/photos/:id` - Get single photo
- `POST /api/photos` - Create photo
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo
- `GET /api/photos/feed` - Get following feed

### Comments
- `POST /api/comments/:photoId` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Likes
- `POST /api/likes/:photoId` - Like photo
- `DELETE /api/likes/:photoId` - Unlike photo

### Friends
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept` - Accept request
- `GET /api/friends` - List friends

### Follows
- `POST /api/follows/:userId` - Follow user
- `DELETE /api/follows/:userId` - Unfollow user

### Blocks
- `POST /api/blocks/:userId` - Block user
- `DELETE /api/blocks/:userId` - Unblock user
- `GET /api/blocks` - List blocked users

### Search
- `GET /api/search/photos?q=query` - Search photos
- `GET /api/search/users?q=query` - Search users
- `GET /api/search/tags?tag=query` - Search by tags

### Admin
- `GET /api/admin/stats/storage` - Storage statistics
- `GET /api/admin/stats/users` - User statistics
- `GET /api/admin/graph/friendships` - Friendship graph

## Environment Variables

Copy `.env.example` to `.env` and customize:

```env
# Database
DB_HOST=db
DB_PORT=3306
DB_NAME=photo_sharing_db
DB_USER=photo_user
DB_PASSWORD=user_password

# Backend
NODE_ENV=production
PORT=3000
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3000
```

## Components

### UI Components
- **Button** - Filled, outlined, text variants
- **Input** - Text input with validation
- **Card** - Content container with elevation levels
- **Avatar** - User profile images
- **Modal** - Dialog component
- **Spinner** - Loading indicator
- **Badge** - Notification badges
- **IconButton** - Material Design icon buttons
- **Header** - Top navigation
- **Sidebar** - Side navigation
- **SearchBox** - Search input with results

### Pages
- **Login** - User authentication
- **Register** - Account creation
- **Home** - Feed or dashboard
- **Profile** - User profile view/edit
- **Search** - Search and filter results
- **PhotoDetail** - Single photo with comments
- **Router** - SPA routing

## Styling

### Theme System
The app uses a dual-layer theming system:

1. **CSS Variables** - For dynamic styling at runtime
   - Colors (primary, secondary, surface, etc.)
   - Spacing (xs, sm, md, lg, xl, xxl)
   - Border radius
   - Shadows

2. **JavaScript Objects** - For programmatic access
   - Material Design 3 color palettes
   - Typography scale
   - Shadow elevations

### Dark Mode
Toggle dark mode with theme button in header. Preference is saved to localStorage.

### Responsive Design
- Desktop: Full layout with sidebar
- Tablet (768px): Adjusted spacing
- Mobile (640px): Collapsible sidebar, optimized layout

## Development

### Frontend Development
```bash
cd client
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd server
npm run dev      # Start with nodemon
npm start        # Start normally
```

### Database
```bash
# Access database
mysql -h localhost -u photo_user -puser_password photo_sharing_db

# Reset database
mysql -h localhost -u photo_user -puser_password photo_sharing_db < server/database/schema.sql
```

## Building & Deployment

### Docker Build
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build client
docker-compose build api
```

### Production Deployment
```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f client
docker-compose logs -f api

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

## Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **CORS**: Configure `CORS_ORIGIN` for your domain
3. **HTTPS**: Use reverse proxy (nginx/traefik) for HTTPS
4. **Database**: Use strong passwords for database
5. **Input Validation**: All inputs are validated and sanitized

## Troubleshooting

### Frontend not connecting to API
- Check CORS_ORIGIN in backend environment
- Verify API_URL in frontend configuration
- Check network tab in browser DevTools

### Database connection errors
- Ensure MariaDB is running and accessible
- Verify database credentials in .env
- Check network connectivity between containers

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf client/.vite`
- Check Node.js version: `node -v` (should be 18+)

## License

MIT

## Support

For issues, feature requests, or questions, please create an issue in the repository.
