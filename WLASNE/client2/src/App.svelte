<script>
  
  // Import all pages
  import MenuBar from "./lib/MenuBar.svelte";
    import Login from "./pages/Login.svelte";

  let currentRoute = $state('login');
  let params = $state({});

  function parseRoute() {
    const hash = window.location.pathname;
    const [path, ...queryParts] = hash.split('?');
    const pathParts = path.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      currentRoute = 'home';
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
          currentRoute = 'home';
          break;
        case 'profile':
          currentRoute = 'profile';
          break;
        case 'search':
          currentRoute = 'search';
          break;
        case 'upload':
          currentRoute = 'upload';
          break;
        case 'photo':
          currentRoute = 'photo';
          params = { id: pathParts[1] };
          break;
        default:
          currentRoute = 'login';
      }
    }
  }

  parseRoute();
</script>

<svelte:window onhashchange={parseRoute} />



{#if currentRoute === 'login'}
  <Login/>
{:else if currentRoute === 'register'}
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'home'}
<MenuBar/>
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'profile'}
<MenuBar/>
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'settings'}
<MenuBar/>
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'search'}
<MenuBar/>
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'upload'}
<MenuBar/>
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'photo'}
<MenuBar/>
  <h1>{currentRoute}</h1>
{:else}
  <h1>{currentRoute}</h1>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
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
