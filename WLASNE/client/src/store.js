import { writable } from 'svelte/store';

// Auth Store
export const authStore = writable({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null
});

// User Store
export const userStore = writable({
  currentUser: null,
  users: [],
  friends: [],
  followers: [],
  following: [],
  blockedUsers: [],
  isLoading: false,
  error: null
});

// Photo Store
export const photoStore = writable({
  photos: [],
  currentPhoto: null,
  userPhotos: [],
  feedPhotos: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0 }
});

// Theme Store
export const themeStore = writable({
  isDark: localStorage.getItem('theme') === 'dark',
  primaryColor: localStorage.getItem('primaryColor') || '#e91e63',
  accentColor: localStorage.getItem('accentColor') || '#2196f3',
  fontSize: localStorage.getItem('fontSize') || 'normal',
  borderRadius: localStorage.getItem('borderRadius') || 'medium'
});

// UI Store
export const uiStore = writable({
  sidebarOpen: false,
  modalOpen: false,
  modalContent: null,
  notifications: [],
  currentPage: 'home'
});

// Update localStorage when theme changes
themeStore.subscribe(theme => {
  localStorage.setItem('theme', theme.isDark ? 'dark' : 'light');
  localStorage.setItem('primaryColor', theme.primaryColor);
  localStorage.setItem('accentColor', theme.accentColor);
  localStorage.setItem('fontSize', theme.fontSize);
  localStorage.setItem('borderRadius', theme.borderRadius);
});

// Update localStorage when auth changes
authStore.subscribe(auth => {
  if (auth.token) {
    localStorage.setItem('token', auth.token);
  } else {
    localStorage.removeItem('token');
  }
});
