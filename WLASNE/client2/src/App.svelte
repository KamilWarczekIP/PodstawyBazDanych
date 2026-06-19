<script lang="ts">
  
  import "./utils.css";

  // Import all pages
    import MenuBar from "./lib/MenuBar.svelte";
    import Home from "./pages/Home.svelte";
    import Login from "./pages/Login.svelte";
    import Register from "./pages/Register.svelte";
    import Search from "./pages/Search.svelte";
    import Upload from "./pages/Upload.svelte";
    import Settings from "./pages/Settings.svelte";
    import Profile from "./pages/Profile.svelte";
    import PhotoDetails from "./pages/PhotoDetails.svelte";
    import { getUserID } from "./api.svelte";

  let currentRoute = $state('login');
  let params : any = $state({});
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
        case 'settings':
          currentRoute = 'settings';
          break;
        case 'profile':
          currentRoute = 'profile';
          params[queryParts[0].split("=")[0]] = parseInt(queryParts[0].split("=")[1], 10);
          if(params['id'] === getUserID())
            currentRoute = 'settings'
          break;
        case 'search':
          currentRoute = 'search';
          break;
        case 'upload':
          currentRoute = 'upload';
          break;
        case 'photo':
          currentRoute = 'photo';
          params[queryParts[0].split("=")[0]] = parseInt(queryParts[0].split("=")[1], 10);
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
        hasMenu = false;
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
<Profile userId={params.id}/>
{:else if currentRoute === 'settings'}
<Settings/>
{:else if currentRoute === 'search'}
  <Search/>
{:else if currentRoute === 'upload'}
  <Upload/>
{:else if currentRoute === 'photo'}
  <PhotoDetails photoId={params.id}/>
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
