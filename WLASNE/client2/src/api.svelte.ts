type AuthInfo = {
  token: string,
  user?: {
    id: number,
    email: string,
    username: string
  },
};

export type Photo = {
  id: number,
  owner_id: number,
  username: string,
  description: string,
};

let auth:AuthInfo = $state({
  token: '',
  user: undefined,
})

export const API_URL = "http://localhost:3000"

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
    // console.log('API call to: ', endpoint);
    // console.info($state.snapshot(auth))
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
    bio?:string,
    photoCount: number,
    followerCount: number,
    followingCount: number,
    isFollowed:boolean,
    isFollowing:boolean}> =>
    apiRequest(`/users/${userId}`, {method: "GET"}),


  changePhoto: (photoId:number) : Promise<{message:string}> =>
    apiRequest(`/users/photo`, {
      method: 'PUT',
      body: JSON.stringify({profile_photo_id:photoId})
    }),

  updateProfile: (username?:string, bio?:string, password?:string) : Promise<{message:string}> =>
    apiRequest(`/users/`, {
      method: 'PUT',
      body: JSON.stringify({
        username,
        bio,
        password,
      })
    }),
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
      tags: {id:number, name:string}[]
  }> => apiRequest(`/photos/${photoId}`, {
    method:"GET",
  }),

  // createPhoto: async (jpeg_data:any, description:string, tags: string[]) : Promise<{message:string, photoId:number}> =>
  //   apiRequest('/photos', {
  //     method: 'POST',
  //     body: JSON.stringify(jpeg_data) // NO WAY
  //   }),

  deletePhoto: async (photoId:number) : Promise<{message:string}>=>
    apiRequest(`/photos/${photoId}`, {
      method: 'DELETE'
    })
};

// Comment APIs
export const commentAPI = {
  getComments: async (photoId:number, page :number, limit = 10) : Promise<
  {
            comments: {
              id:number,
              commenter_id: number,
              comment:string,
              username:string,
            }[],
            total: number,
            page: number,
        }>=>
    apiRequest(`/comments/${photoId}`, {
      method: "POST",
      body: JSON.stringify({
        page,
        limit,
      }),
    }),

  createComment: async (photoId :number, content:string) : Promise<{message:string}> =>
    apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({ photo_id: photoId, content })
    }),
};

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
// Block APIs
export const blockAPI = {
  blockUser: async (blockedId:number) : Promise<{message:string}> =>
    apiRequest('/blocks', {
      method: 'PUT',
      body: JSON.stringify({ blocked_id: blockedId })
    }),

  unblockUser: (blockedId:number) : Promise<{message:string}> =>
    apiRequest(`/blocks`, {
      method: 'DELETE',
      body: JSON.stringify({ blocked_id: blockedId })
    }),

  getBlockedUsers: async (page:number, limit = 10) : Promise<{
            blockedUsers: {
              id: number,
              username:string
            }[],
            total: number,
            page: number,
        }> =>
    apiRequest(`/blocks/list`, {
      method:"POST",
      body: JSON.stringify({
        page,
        limit,
      })
    }),
  
};

// Search APIs
export const searchAPI = {
  searchPhotos: async (queryTerm:string, page:number, limit = 5) =>
    apiRequest(`/search/photos`, {
      method: 'POST',
      body: JSON.stringify({ queryTerm, page, limit })
    }),

  searchUsers: async (queryTerm:string, page:number, limit = 5) : Promise<{users: {id:number, username:string}[], total:number}> =>
    apiRequest(`/search/users`, {
      method: 'POST',
      body: JSON.stringify({ queryTerm, page, limit })
    }),

  // searchTags: async (query:string, page:number, limit = 5) =>
  //   apiRequest(`/search/tags?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
  //     method: 'POST'
  //   })
};
/*
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
export function getUserID() : number|undefined {
  return auth.user?.id;
}
export function getPhotoURL(userId:number, photoId:number) : string  {
 return "http://" + window.location.hostname + ":8089/" + userId + "/" + photoId + ".jpg";
}
export function getProfilePhotoURL(userId:number | undefined) : string {
  return "http://" + window.location.hostname + ":8089/" + userId + "/" + "user.jpg";
}