<script>
  import { authStore, uiStore } from '../store.js';
  import IconButton from './IconButton.svelte';

  const menuItems = [
    { icon: 'home', label: 'Home', href: '/' },
    { icon: 'photo', label: 'Explore', href: '/explore' },
    { icon: 'add', label: 'Upload', href: '/upload' },
    { icon: 'heart', label: 'Likes', href: '/likes' },
    { icon: 'bell', label: 'Notifications', href: '/notifications' },
    { icon: 'user', label: 'Profile', href: '/profile' },
    { icon: 'settings', label: 'Settings', href: '/settings' }
  ];

  function handleMenuClick(href) {
    window.location.hash = href;
    uiStore.update(s => ({ ...s, sidebarOpen: false }));
  }

  function logout() {
    authStore.set({ token: null, user: null, isAuthenticated: false });
    localStorage.removeItem('token');
    window.location.hash = '/login';
  }
</script>

<aside class="sidebar" class:open={$uiStore.sidebarOpen}>
  <nav class="nav-menu">
    {#each menuItems as item (item.href)}
      <button
        class="nav-item"
        on:click={() => handleMenuClick(item.href)}
        title={item.label}
      >
        <IconButton icon={item.icon} label={item.label} />
        <span class="nav-label">{item.label}</span>
      </button>
    {/each}
  </nav>

  {#if $authStore.isAuthenticated}
    <div class="sidebar-footer">
      <button
        class="logout-btn"
        on:click={logout}
        title="Logout"
      >
        <IconButton icon="back" label="Logout" />
        <span class="logout-label">Logout</span>
      </button>
    </div>
  {/if}
</aside>

<style>
  .sidebar {
    width: 256px;
    background-color: var(--surface);
    border-right: 1px solid var(--outline);
    display: flex;
    flex-direction: column;
    transition: var(--transition-fast);

    @media (max-width: 768px) {
      position: fixed;
      left: -256px;
      top: 64px;
      height: calc(100vh - 64px);
      z-index: 900;
      box-shadow: var(--shadow-lg);

      &.open {
        left: 0;
      }
    }
  }

  .nav-menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--spacing-md) 0;
    list-style: none;
    margin: 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: none;
    border: none;
    color: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition-fast);
    width: 100%;
    text-align: left;

    &:hover {
      background-color: var(--surface-variant);
    }

    &:active {
      background-color: var(--primary, #e91e63);
      color: white;
    }
  }

  .nav-label {
    flex: 1;

    @media (max-width: 768px) {
      display: block;
    }

    @media (min-width: 1024px) {
      display: block;
    }
  }

  .sidebar-footer {
    border-top: 1px solid var(--outline);
    padding: var(--spacing-md) 0;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: none;
    border: none;
    color: var(--error, #b3261e);
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition-fast);
    width: 100%;
    text-align: left;

    &:hover {
      background-color: rgba(179, 38, 30, 0.1);
    }
  }

  .logout-label {
    flex: 1;
  }
</style>
