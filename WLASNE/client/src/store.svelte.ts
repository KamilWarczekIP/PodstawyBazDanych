// Auth Store
export const authStore = $state({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: localStorage.getItem('token') != null,
});

// Theme Store
export const themeStore = $state({
  isDark: localStorage.getItem('theme') === 'dark',
  primaryColor: localStorage.getItem('primaryColor') || '#e91e63',
  accentColor: localStorage.getItem('accentColor') || '#2196f3',
  fontSize: localStorage.getItem('fontSize') || 'normal',
  borderRadius: localStorage.getItem('borderRadius') || 'medium'
});

// Update localStorage when auth changes
authStore.subscribe((auth: { token:string | undefined, user: number | undefined, isAuthenticated:boolean }) => {
  if (auth.token) {
    localStorage.setItem('token', auth.token);
  } else {
    localStorage.removeItem('token');
  }
});
