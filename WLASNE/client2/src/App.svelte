<script>
  
  import "./utils.css";

  // Import all pages
    import MenuBar from "./lib/MenuBar.svelte";
    import Home from "./pages/Home.svelte";
    import Login from "./pages/Login.svelte";
    import Register from "./pages/Register.svelte";
    import Search from "./pages/Search.svelte";

  let currentRoute = $state('login');
  let params = $state({});
  let hasMenu = $state(false)

  function parseRoute() {
    const hash = window.location.hash;
    const [path, ...queryParts] = hash.split('?');
    const pathParts = path.split('/').filter(Boolean);
    
    
    hasMenu = true;
    if (pathParts.length === 0) {
      currentRoute = 'home';
    } else {
      const route = pathParts[0].substring(1);
      switch (route) {
        case 'login':
          currentRoute = 'login';
          hasMenu = false;
          break;
        case 'register':
          currentRoute = 'register';
          hasMenu = false;
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
          hasMenu = false;
      }
    }

    if(localStorage.getItem("AUTH") == null)
    {
      if(currentRoute !== 'register')
      {
        currentRoute = 'login';
        hasMenu = 'false';
      }
    }
  }

  parseRoute();
</script>

<svelte:window onhashchange={parseRoute} />



{#if currentRoute === 'login'}
  <Login/>
{:else if currentRoute === 'register'}
  <Register/>
{:else if currentRoute === 'home'}
  <Home/>
{:else if currentRoute === 'profile'}
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'settings'}
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'search'}
  <Search/>
{:else if currentRoute === 'upload'}
  <h1>{currentRoute}</h1>
{:else if currentRoute === 'photo'}
  <h1>{currentRoute}</h1>
{:else}
  <h1>ERROR: {currentRoute}</h1>
{/if}

{#if hasMenu === true}
  <MenuBar/>
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
