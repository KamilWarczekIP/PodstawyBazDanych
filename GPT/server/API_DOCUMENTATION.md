# API Documentation

## Client Configuration

Frontend w `client/src/api.js` korzysta z:

```
const API_URL = '/api';
```

W produkcji w kontenerze klienta za pomocą `nginx` proxy /api/ jest przekierowywane do kontenera serwera `api:3000`.

Ustawienie w `docker-compose.yml`:

- `VITE_API_URL: http://api:3000` (opcjonalnie)

Szczegóły CORS w backendzie:

- `CORS_ORIGIN` ustawione na `*` w trybie development
- w produkcji dopuszczane werdykty 🟢

## Known Issues i debug

1. Jeśli frontend zwraca HTML zamiast JSON, sprawdź czy:
   - request do `/api/auth/register` napływa na Nginx (logi client)
   - client `api.js` ma `API_URL = '/api'`
   - backend ma `CORS_ORIGIN` zgodne (lub `*` w dev)
2. Warto użyć `docker-compose logs -f api` i `docker-compose logs -f client` w celu śledzenia statusów
3. Jeśli `npm ci` w `client` zachodzi błąd, najpierw uruchom `npm install` i skommituj `package-lock.json`.

## Authentication Endpoints

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (201):
{
  "message": "User registered successfully",
  "userId": 1
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

## User Endpoints

### Get User Profile
```
GET /api/users/:userId
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Photography enthusiast",
  "profile_image_url": "https://...",
  "created_at": "2024-01-01T10:00:00Z",
  "photoCount": 15,
  "followerCount": 120,
  "followingCount": 85,
  "isFriend": true,
  "isFollowing": true,
  "isBlocked": false
}
```

### Update User Profile
```
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Photography enthusiast",
  "profile_image_url": "https://..."
}

Response (200):
{
  "message": "Profile updated successfully"
}
```

### Get User Stats
```
GET /api/users/:userId/stats
Authorization: Bearer <token>

Response (200):
{
  "total_size_bytes": 1048576000,
  "photo_count": 15,
  "comment_count": 47,
  "like_count": 230
}
```

## Photo Endpoints

### Get User Photos
```
GET /api/photos/user/:userId?page=1&limit=10
Authorization: Bearer <token> (optional)

Response (200):
{
  "photos": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Mountain Sunset",
      "description": "Beautiful sunset at the mountains",
      "image_url": "https://...",
      "created_at": "2024-01-01T10:00:00Z",
      "likeCount": 25,
      "commentCount": 5,
      "userLiked": false
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Get Single Photo
```
GET /api/photos/:photoId
Authorization: Bearer <token> (optional)

Response (200):
{
  "id": 1,
  "user_id": 1,
  "title": "Mountain Sunset",
  "description": "Beautiful sunset at the mountains",
  "image_url": "https://...",
  "created_at": "2024-01-01T10:00:00Z",
  "likeCount": 25,
  "commentCount": 5,
  "userLiked": false,
  "tags": [
    { "id": 1, "name": "nature" },
    { "id": 2, "name": "sunset" }
  ]
}
```

### Create Photo
```
POST /api/photos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mountain Sunset",
  "description": "Beautiful sunset at the mountains",
  "image_url": "https://...",
  "file_size": 2048576,
  "tags": ["nature", "sunset", "landscape"]
}

Response (201):
{
  "message": "Photo created successfully",
  "photoId": 1
}
```

### Delete Photo
```
DELETE /api/photos/:photoId
Authorization: Bearer <token>

Response (200):
{
  "message": "Photo deleted successfully"
}
```

## Comment Endpoints

### Get Photo Comments
```
GET /api/comments/photo/:photoId?page=1&limit=10
Authorization: Bearer <token> (optional)

Response (200):
{
  "comments": [
    {
      "id": 1,
      "photo_id": 1,
      "user_id": 2,
      "content": "Amazing photo!",
      "created_at": "2024-01-01T10:00:00Z",
      "username": "jane_doe",
      "profile_image_url": "https://..."
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### Create Comment
```
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "photo_id": 1,
  "content": "Amazing photo!"
}

Response (201):
{
  "message": "Comment created successfully",
  "commentId": 1
}
```

### Delete Comment
```
DELETE /api/comments/:commentId
Authorization: Bearer <token>

Response (200):
{
  "message": "Comment deleted successfully"
}
```

## Like Endpoints

### Like Photo
```
POST /api/likes
Authorization: Bearer <token>
Content-Type: application/json

{
  "photo_id": 1
}

Response (201):
{
  "message": "Photo liked successfully",
  "likeId": 1
}
```

### Unlike Photo
```
DELETE /api/likes/:photoId
Authorization: Bearer <token>

Response (200):
{
  "message": "Photo unliked successfully"
}
```

### Get Likes Count
```
GET /api/likes/:photoId

Response (200):
{
  "count": 25
}
```

## Friend Endpoints

### Send Friend Request
```
POST /api/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_id": 2
}

Response (201):
{
  "message": "Friend request sent",
  "requestId": 1
}
```

### Accept Friend Request
```
POST /api/friends/accept/:requestId
Authorization: Bearer <token>

Response (200):
{
  "message": "Friend request accepted"
}
```

### Get Friends List
```
GET /api/friends/:userId?page=1&limit=10

Response (200):
{
  "friends": [
    {
      "id": 2,
      "username": "jane_doe",
      "profile_image_url": "https://..."
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

## Follow Endpoints

### Follow User
```
POST /api/follows
Authorization: Bearer <token>
Content-Type: application/json

{
  "following_id": 2
}

Response (201):
{
  "message": "User followed successfully",
  "followId": 1
}
```

### Unfollow User
```
DELETE /api/follows/:followingId
Authorization: Bearer <token>

Response (200):
{
  "message": "User unfollowed"
}
```

### Get Feed
```
GET /api/follows/feed?page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "photos": [
    {
      "id": 1,
      "user_id": 2,
      "title": "Photo Title",
      "description": "Description",
      "image_url": "https://...",
      "created_at": "2024-01-01T10:00:00Z",
      "username": "jane_doe",
      "profile_image_url": "https://...",
      "likeCount": 10,
      "commentCount": 2,
      "userLiked": false
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

## Block Endpoints

### Block User
```
POST /api/blocks
Authorization: Bearer <token>
Content-Type: application/json

{
  "blocked_id": 3,
  "reason": "Inappropriate content"
}

Response (201):
{
  "message": "User blocked successfully",
  "blockId": 1
}
```

### Unblock User
```
DELETE /api/blocks/:blockedId
Authorization: Bearer <token>

Response (200):
{
  "message": "User unblocked"
}
```

### Get Blocked Users List
```
GET /api/blocks/list?page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "blockedUsers": [
    {
      "id": 1,
      "blocked_id": 3,
      "reason": "Inappropriate content",
      "created_at": "2024-01-01T10:00:00Z",
      "username": "bad_user",
      "profile_image_url": "https://..."
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10
}
```

## Search Endpoints

### Search Photos
```
GET /api/search/photos?q=nature&page=1&limit=10
Authorization: Bearer <token> (optional)

Response (200):
{
  "photos": [...],
  "query": "nature",
  "page": 1,
  "limit": 10
}
```

### Search Users
```
GET /api/search/users?q=john&page=1&limit=10
Authorization: Bearer <token> (optional)

Response (200):
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "profile_image_url": "https://...",
      "bio": "Photography enthusiast",
      "photoCount": 15,
      "followerCount": 120,
      "isFriend": false,
      "isFollowing": true
    }
  ],
  "query": "john",
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### Search Tags
```
GET /api/search/tags?q=nature&page=1&limit=10

Response (200):
{
  "tags": [
    { "id": 1, "name": "nature" },
    { "id": 2, "name": "natural" }
  ],
  "query": "nature",
  "total": 2,
  "page": 1,
  "limit": 10
}
```

## Admin Endpoints

All admin endpoints require `x-admin-secret` header with valid admin secret key.

### Get Storage Statistics
```
GET /api/admin/stats/storage
Authorization: Bearer <token>
x-admin-secret: <admin_secret>

Response (200):
{
  "total_users": 150,
  "total_storage_bytes": 157286400000,
  "avg_storage_per_user": 1048576000,
  "max_user_storage": 5242880000,
  "total_photos": 3500,
  "active_users": 140,
  "inactive_users": 10
}
```

### Get User Statistics
```
GET /api/admin/stats/users?page=1&limit=10
Authorization: Bearer <token>
x-admin-secret: <admin_secret>

Response (200):
{
  "users": [...],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

### Get Friendship Graph
```
GET /api/admin/graph/friendships
Authorization: Bearer <token>
x-admin-secret: <admin_secret>

Response (200):
{
  "nodes": [
    { "id": 1, "label": "john_doe" },
    { "id": 2, "label": "jane_doe" }
  ],
  "edges": [
    { "source": 1, "target": 2 }
  ],
  "stats": {
    "total_connections": 450,
    "avg_friends_per_user": 3.2,
    "most_connected_user": 45
  }
}
```

## Error Responses

All endpoints may return error responses with appropriate HTTP status codes:

```
{
  "error": "Error message describing what went wrong"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., already exists)
- 500: Server Error
