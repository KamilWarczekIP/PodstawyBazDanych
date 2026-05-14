<script>
  import { authStore } from '../store.js';
  
  // Import all pages
  import Login from './Login.svelte';
  import Register from './Register.svelte';
  import Home from './Home.svelte';
  import Profile from './Profile.svelte';
  import Search from './Search.svelte';
  import PhotoDetail from './PhotoDetail.svelte';
  import Upload from './Upload.svelte';

  let currentRoute = 'login';
  let params = {};

  function parseHash() {
    const hash = window.location.hash.slice(1);
    const [path, ...queryParts] = hash.split('?');
    const pathParts = path.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      currentRoute = $authStore.isAuthenticated ? 'home' : 'login';
    } else {
      const route = pathParts[0];
      switch (route) {
        case 'login':
          currentRoute = 'login';
          break;
        case 'register':
          currentRoute = 'register';
          break;
        case 'home':
        case '':
          currentRoute = $authStore.isAuthenticated ? 'home' : 'login';
          break;
        case 'profile':
          currentRoute = $authStore.isAuthenticated ? 'profile' : 'login';
          break;
        case 'search':
          currentRoute = $authStore.isAuthenticated ? 'search' : 'login';
          break;
        case 'upload':
          currentRoute = $authStore.isAuthenticated ? 'upload' : 'login';
          break;
        case 'photo':
          currentRoute = $authStore.isAuthenticated ? 'photo-detail' : 'login';
          params = { id: pathParts[1] };
          break;
        default:
          currentRoute = $authStore.isAuthenticated ? 'home' : 'login';
      }
    }
  }

  function handleHashChange() {
    parseHash();
  }

  // Parse initial hash on mount
  parseHash();
</script>

<svelte:window on:hashchange={handleHashChange} />

{#if currentRoute === 'login'}
  <Login />
{:else if currentRoute === 'register'}
  <Register />
{:else if currentRoute === 'home'}
  <Home />
{:else if currentRoute === 'profile'}
  <Profile />
{:else if currentRoute === 'search'}
  <Search />
{:else if currentRoute === 'upload'}
  <Upload />
{:else if currentRoute === 'photo-detail'}
  <PhotoDetail {params} />
{:else}
  <Login />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
