<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { themeStore, authStore } from './store.js';
  import Header from './components/Header.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Router from './pages/Router.svelte';
  import './global.css';

  let isDark = false;
  let isAuthenticated = false;

  onMount(() => {
    // Check for saved token
    const token = localStorage.getItem('token');
    if (token) {
      const currentAuth = get(authStore);
      authStore.set({
        token,
        isAuthenticated: true,
        user: currentAuth.user || { username: 'User' }
      });
    }

    const unsubscribeTheme = themeStore.subscribe(theme => {
      isDark = theme.isDark;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    const unsubscribeAuth = authStore.subscribe(auth => {
      isAuthenticated = auth.isAuthenticated;
    });

    return () => {
      unsubscribeTheme();
      unsubscribeAuth();
    };
  });
</script>

{#if isAuthenticated}
  <div class="app-container">
    <Header />
    <div class="app-main">
      <Sidebar />
      <main class="app-content">
        <Router />
      </main>
    </div>
  </div>
{:else}
  <Router />
{/if}

<style>
  :global(:root) {
    --app-header-height: 64px;
    --app-sidebar-width: 280px;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: var(--background);
  }

  .app-main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    :global(:root) {
      --app-sidebar-width: 240px;
    }
  }

  @media (max-width: 640px) {
    .app-main {
      flex-direction: column;
    }
  }
</style>
