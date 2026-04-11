import { get } from 'svelte/store';
import { authStore } from './store.js';

const API_URL = '/api';

async function apiRequest(endpoint, options = {}) {
  const auth = get(authStore);
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        authStore.set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Unauthorized'
        });
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  register: (username, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    }),

  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
};

// User APIs
export const userAPI = {
  getProfile: (userId) =>
    apiRequest(`/users/${userId}`),

  updateProfile: (userId, data) =>
    apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getStats: (userId) =>
    apiRequest(`/users/${userId}/stats`)
};

// Photo APIs
export const photoAPI = {
  getUserPhotos: (userId, page = 1, limit = 10) =>
    apiRequest(`/photos/user/${userId}?page=${page}&limit=${limit}`),

  getPhoto: (photoId) =>
    apiRequest(`/photos/${photoId}`),

  createPhoto: (data) =>
    apiRequest('/photos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deletePhoto: (photoId) =>
    apiRequest(`/photos/${photoId}`, {
      method: 'DELETE'
    })
};

// Comment APIs
export const commentAPI = {
  getComments: (photoId, page = 1, limit = 10) =>
    apiRequest(`/comments/photo/${photoId}?page=${page}&limit=${limit}`),

  createComment: (photoId, content) =>
    apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({ photo_id: photoId, content })
    }),

  deleteComment: (commentId) =>
    apiRequest(`/comments/${commentId}`, {
      method: 'DELETE'
    })
};

// Like APIs
export const likeAPI = {
  likePhoto: (photoId) =>
    apiRequest('/likes', {
      method: 'POST',
      body: JSON.stringify({ photo_id: photoId })
    }),

  unlikePhoto: (photoId) =>
    apiRequest(`/likes/${photoId}`, {
      method: 'DELETE'
    }),

  getLikeCount: (photoId) =>
    apiRequest(`/likes/${photoId}`)
};

// Friend APIs
export const friendAPI = {
  sendRequest: (receiverId) =>
    apiRequest('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId })
    }),

  acceptRequest: (requestId) =>
    apiRequest(`/friends/accept/${requestId}`, {
      method: 'POST'
    }),

  rejectRequest: (requestId) =>
    apiRequest(`/friends/reject/${requestId}`, {
      method: 'POST'
    }),

  removeFriend: (friendId) =>
    apiRequest(`/friends/${friendId}`, {
      method: 'DELETE'
    }),

  getFriends: (userId, page = 1, limit = 10) =>
    apiRequest(`/friends/${userId}?page=${page}&limit=${limit}`)
};

// Follow APIs
export const followAPI = {
  followUser: (followingId) =>
    apiRequest('/follows', {
      method: 'POST',
      body: JSON.stringify({ following_id: followingId })
    }),

  unfollowUser: (followingId) =>
    apiRequest(`/follows/${followingId}`, {
      method: 'DELETE'
    }),

  getFollowers: (userId, page = 1, limit = 10) =>
    apiRequest(`/follows/${userId}/followers?page=${page}&limit=${limit}`),

  getFollowing: (userId, page = 1, limit = 10) =>
    apiRequest(`/follows/${userId}/following?page=${page}&limit=${limit}`),

  getFeed: (page = 1, limit = 10) =>
    apiRequest(`/follows/feed?page=${page}&limit=${limit}`)
};

// Block APIs
export const blockAPI = {
  blockUser: (blockedId, reason = '') =>
    apiRequest('/blocks', {
      method: 'POST',
      body: JSON.stringify({ blocked_id: blockedId, reason })
    }),

  unblockUser: (blockedId) =>
    apiRequest(`/blocks/${blockedId}`, {
      method: 'DELETE'
    }),

  getBlockedUsers: (page = 1, limit = 10) =>
    apiRequest(`/blocks/list?page=${page}&limit=${limit}`),

  checkBlocked: (blockedId) =>
    apiRequest(`/blocks/check/${blockedId}`)
};

// Search APIs
export const searchAPI = {
  searchPhotos: (query, page = 1, limit = 10) =>
    apiRequest(`/search/photos?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),

  searchUsers: (query, page = 1, limit = 10) =>
    apiRequest(`/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),

  searchTags: (query, page = 1, limit = 10) =>
    apiRequest(`/search/tags?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
};

// Admin APIs
export const adminAPI = {
  getStorageStats: () =>
    apiRequest('/admin/stats/storage', {
      headers: {
        'x-admin-secret': localStorage.getItem('adminSecret') || ''
      }
    }),

  getUserStats: (page = 1, limit = 10) =>
    apiRequest(`/admin/stats/users?page=${page}&limit=${limit}`, {
      headers: {
        'x-admin-secret': localStorage.getItem('adminSecret') || ''
      }
    }),

  getFriendshipGraph: () =>
    apiRequest('/admin/graph/friendships', {
      headers: {
        'x-admin-secret': localStorage.getItem('adminSecret') || ''
      }
    }),

  getActivityLogs: (days = 7, limit = 50, page = 1) =>
    apiRequest(`/admin/logs/activity?days=${days}&limit=${limit}&page=${page}`, {
      headers: {
        'x-admin-secret': localStorage.getItem('adminSecret') || ''
      }
    }),

  getPopularContent: () =>
    apiRequest('/admin/content/popular', {
      headers: {
        'x-admin-secret': localStorage.getItem('adminSecret') || ''
      }
    })
};
