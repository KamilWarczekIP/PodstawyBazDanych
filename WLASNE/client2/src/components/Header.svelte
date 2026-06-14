<script>
  import { onDestroy } from 'svelte';
  import { authStore, uiStore, themeStore } from '../store.js';
  import IconButton from './IconButton.svelte';
  import SearchBox from './SearchBox.svelte';

  let currentUser = null;

  const unsubAuth = authStore.subscribe(auth => {
    currentUser = auth.user;
  });

  function logout() {
    authStore.set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  function toggleTheme() {
    themeStore.update(t => ({ ...t, isDark: !t.isDark }));
  }

  function toggleSidebar() {
    uiStore.update(ui => ({ ...ui, sidebarOpen: !ui.sidebarOpen }));
  }

  onDestroy(() => unsubAuth());
</script>

<header class="header">
  <div class="header-left">
    <button class="menu-btn" on:click={toggleSidebar} title="Toggle Sidebar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="3" y1="6" x2="21" y2="6" stroke-width="2"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke-width="2"/>
        <line x1="3" y1="18" x2="21" y2="18" stroke-width="2"/>
      </svg>
    </button>
    <h1 class="app-title">PhotoShare</h1>
  </div>

  <SearchBox />

  <div class="header-right">
    <IconButton icon="theme" on:click={toggleTheme} title="Toggle Dark Mode" />
    
    {#if currentUser}
      <div class="user-menu">
        <img 
          src={currentUser.profile_image_url || 'https://via.placeholder.com/40'} 
          alt={currentUser.username}
          class="user-avatar"
        />
        <span class="user-name">{currentUser.username}</span>
      </div>
      <button class="logout-btn" on:click={logout}>Logout</button>
    {/if}
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-lg);
    height: var(--app-header-height);
    padding: 0 var(--spacing-lg);
    background-color: var(--surface);
    border-bottom: 1px solid var(--outline);
    box-shadow: var(--shadow-sm);
    z-index: 100;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    min-width: max-content;
  }

  .menu-btn {
    display: none;
    background: transparent;
    color: var(--on-surface);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);

    &:hover {
      background-color: var(--surface-variant);
    }
  }

  .app-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--primary);
    margin: 0;
    white-space: nowrap;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--surface-variant);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover {
      background-color: var(--primary-container);
    }
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .logout-btn {
    padding: 8px 16px;
    background-color: var(--error);
    color: var(--on-error);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    transition: var(--transition-fast);

    &:hover {
      opacity: 0.9;
      box-shadow: var(--shadow-md);
    }
  }

  @media (max-width: 768px) {
    .menu-btn {
      display: block;
    }

    .user-name {
      display: none;
    }

    .header {
      padding: 0 var(--spacing-md);
      gap: var(--spacing-sm);
    }

    .app-title {
      font-size: 18px;
    }
  }
</style>
