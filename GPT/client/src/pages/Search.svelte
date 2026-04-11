<script>
  import { searchAPI } from '../api.js';
  import Card from '../components/Card.svelte';
  import Input from '../components/Input.svelte';
  import Avatar from '../components/Avatar.svelte';
  import Spinner from '../components/Spinner.svelte';

  let query = '';
  let activeTab = 'photos'; // photos, users, tags
  let results = { photos: [], users: [], tags: [] };
  let isLoading = false;

  async function handleSearch() {
    if (!query.trim()) return;

    isLoading = true;
    try {
      if (activeTab === 'photos') {
        const data = await searchAPI.searchPhotos(query, 1, 20);
        results.photos = data.photos || [];
      } else if (activeTab === 'users') {
        const data = await searchAPI.searchUsers(query, 1, 20);
        results.users = data.users || [];
      } else if (activeTab === 'tags') {
        const data = await searchAPI.searchByTag(query, 1, 20);
        results.tags = data.photos || [];
      }
    } catch (e) {
      console.error(e);
    }
    isLoading = false;
  }

  function switchTab(tab) {
    activeTab = tab;
    if (query) handleSearch();
  }
</script>

<div class="search-page">
  <div class="search-header">
    <h1>Search</h1>
    <Input
      placeholder="Search photos, users, tags..."
      bind:value={query}
    />
  </div>

  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === 'photos'}
      on:click={() => switchTab('photos')}
    >
      Photos
    </button>
    <button
      class="tab"
      class:active={activeTab === 'users'}
      on:click={() => switchTab('users')}
    >
      Users
    </button>
    <button
      class="tab"
      class:active={activeTab === 'tags'}
      on:click={() => switchTab('tags')}
    >
      Tags
    </button>
  </div>

  {#if isLoading}
    <div class="loading-container">
      <Spinner size="lg" />
    </div>
  {:else if activeTab === 'photos' && results.photos.length > 0}
    <div class="results-grid">
      {#each results.photos as photo (photo.id)}
        <Card variant="elevated">
          <a href="/photo/{photo.id}" class="photo-link">
            <img src={photo.image_url} alt={photo.title} class="result-image" />
            <div class="photo-meta">
              <div class="photo-title">{photo.title}</div>
              <div class="username">By {photo.username}</div>
            </div>
          </a>
        </Card>
      {/each}
    </div>
  {:else if activeTab === 'users' && results.users.length > 0}
    <div class="users-list">
      {#each results.users as user (user.id)}
        <Card variant="elevated" padding="md">
          <div class="user-item">
            <Avatar src={user.profile_image_url} alt={user.username} size="lg" />
            <div class="user-info">
              <a href="/user/{user.id}" class="username">@{user.username}</a>
              <div class="bio">{user.bio || 'No bio'}</div>
              <div class="follower-count">{user.followerCount || 0} followers</div>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {:else if activeTab === 'tags' && results.tags.length > 0}
    <div class="results-grid">
      {#each results.tags as photo (photo.id)}
        <Card variant="elevated">
          <img src={photo.image_url} alt={photo.title} class="result-image" />
        </Card>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <p>No results found. Try searching for something!</p>
    </div>
  {/if}
</div>

<style>
  .search-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .search-header {
    margin-bottom: var(--spacing-lg);
  }

  .search-header h1 {
    margin: 0 0 var(--spacing-md) 0;
  }

  .tabs {
    display: flex;
    gap: var(--spacing-md);
    border-bottom: 1px solid var(--outline);
    margin-bottom: var(--spacing-lg);
  }

  .tab {
    padding: var(--spacing-md) var(--spacing-lg);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: var(--transition-fast);
    color: var(--outline);

    &:hover {
      color: var(--on-surface);
    }

    &.active {
      color: var(--primary, #e91e63);
      border-bottom-color: var(--primary, #e91e63);
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: var(--spacing-xl);
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }

  .photo-link {
    text-decoration: none;
    color: inherit;
  }

  .result-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: var(--radius-md);
  }

  .photo-meta {
    padding: var(--spacing-md) 0;
  }

  .photo-title {
    font-weight: 500;
    font-size: 14px;
  }

  .username {
    font-size: 12px;
    color: var(--outline);
  }

  .users-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .user-info {
    flex: 1;
  }

  .user-info .username {
    font-weight: 500;
    font-size: 16px;
    text-decoration: none;
    color: var(--primary, #e91e63);

    &:hover {
      text-decoration: underline;
    }
  }

  .bio {
    font-size: 14px;
    color: var(--on-surface-variant);
    margin: var(--spacing-sm) 0;
  }

  .follower-count {
    font-size: 12px;
    color: var(--outline);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--outline);
  }

  @media (max-width: 768px) {
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }
</style>
