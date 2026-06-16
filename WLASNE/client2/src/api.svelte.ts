type AuthInfo = {
  token: string,
  user?: {
    id: number,
    email: string,
    username: string
  },
};

type Photo = {
  id: number,
  user_id: number,
  username: string,
  description: string,
};

let auth:AuthInfo = $state({
  token: '',
  user: undefined,
})

let API_URL = "http://localhost:3000"

async function apiRequest(endpoint:string, options: {
  body?: string,
  method: "POST" | "GET" | "PUT" | "DELETE",
}) {

  let loggedInInfo = localStorage.getItem("AUTH");
  if(loggedInInfo != null) {
    auth = JSON.parse(loggedInInfo);
  }

  const headers:any = {
    'Content-Type': 'application/json',
  };

  if (auth.token != '') {
    headers['Authorization'] = auth.token;
  }

  try {
    console.log('API call to: ', endpoint);
    console.info($state.snapshot(auth))
    const response = await fetch(API_URL+endpoint, {
      headers,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        auth = {
          token: '',
          user: undefined,
        };
        localStorage.removeItem("AUTH");
      }
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<{}> =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    }),

  login: async (email: string, password: string): Promise<AuthInfo> =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
};

// User APIs
export const userAPI = {
  getProfile: async (userId: number): Promise<{
    id:number, 
    username:string, 
    email:string, 
    bio:string,
    photoCount: number,
    followerCount: number,
    followingCount: number,
    isFollowed:boolean,
    isFollowing:boolean}> =>
    apiRequest(`/users/${userId}`, {method: "GET"}),


  changePhoto: (photoId:number) =>
    apiRequest(`/users/photo`, {
      method: 'PUT',
      body: JSON.stringify({profile_photo_id:photoId})
    }),

  updateProfile: (username?:string, bio?:string, password?:string, email?:string) =>
    apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getStats: (userId:number) =>
    apiRequest(`/users/${userId}/stats`)
};

// Photo APIs
export const photoAPI = {
  getUserPhotos: async (userId:number, page:number, limit = 10) : Promise<{
      photos: 
        Photo[],
      total: number,
      page: number
  }> =>
    apiRequest(`/photos/user/${userId}`, {
        method: "POST",
        body: JSON.stringify({
          page,
          limit,
        })
      }),

  getPhoto: async (photoId: number) : Promise<{
      photo: Photo,
      likeCount: number,
      commentCount: number,
      userLiked: boolean,
      tags: string[]
  }> => apiRequest(`/photos/${photoId}`, {
    method:"GET",
  }),

  createPhoto: async (jpeg_data:any, description:string, tags: string[]) : Promise<{message:string, photoId:number}> =>
    apiRequest('/photos', {
      method: 'POST',
      body: JSON.stringify(jpeg_data) // NO WAY
    }),

  deletePhoto: async (photoId:number) : Promise<{message:string}>=>
    apiRequest(`/photos/${photoId}`, {
      method: 'DELETE'
    })
};
/*
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
*/
// Like APIs
export const likeAPI = {
  likePhoto: async (photoId: number) : Promise<{message:string}> =>
    apiRequest(`/likes/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify({})
    }),

  unlikePhoto: async (photoId: number) : Promise<{message:string}> =>
    apiRequest(`/likes/${photoId}`, {
      method: 'DELETE',
      body: JSON.stringify({})
    }),
  getCount: async (photoId: number) : Promise<{count:number}> => 
    apiRequest(`/likes/${photoId}`, {
      method: "GET"
    }),
};


// Follow APIs
export const followAPI = {
  followUser: async (followingId:number) : Promise<{message:string}> =>
    apiRequest('/follows', {
      method: 'PUT',
      body: JSON.stringify({ followed_id: followingId })
    }),

  unfollowUser: async(followingId:number) : Promise<{message:string}> =>
    apiRequest(`/follows`, {
      method: 'DELETE',
      body: JSON.stringify({ followed_id: followingId })
    }),

  getFollowers: async (userId:number, page:number, limit = 10) =>
    apiRequest(`/follows/followers/${userId}`, {
        method: "POST",
        body: JSON.stringify({
          page,
          limit,
        }),
      }),

  getFollowing: async (userId:number, page:number, limit = 10) =>
    apiRequest(`/follows/following/${userId}`, {
        method: "POST",
        body: JSON.stringify({
          page,
          limit,
        }),
      }),

  getFeed: async (page: number, limit = 10) : Promise<{
      photos: {
        photo: {
            id: number,
            user_id: number,
            username: string,
            description: string,
        },
        likeCount: number,
        commentCount: number,
        userLiked: boolean
      }[],
      total: number,
      page: number,
      limit: number,
  }> =>
    apiRequest(`/follows/feed`, {
        method: "POST",
        body: JSON.stringify({
          page,
          limit,
        }),
      })
};
/*
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
*/