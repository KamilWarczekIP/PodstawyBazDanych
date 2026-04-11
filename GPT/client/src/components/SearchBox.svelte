<script>
  import { searchAPI } from '../api.js';

  let query = '';
  let results = [];
  let isSearching = false;

  async function handleSearch() {
    if (!query.trim()) {
      results = [];
      return;
    }
    
    isSearching = true;
    try {
      const photos = await searchAPI.searchPhotos(query, 1, 5);
      const users = await searchAPI.searchUsers(query, 1, 5);
      results = [
        ...photos.photos.map(p => ({ type: 'photo', ...p })),
        ...users.users.map(u => ({ type: 'user', ...u }))
      ];
    } catch (e) {
      console.error(e);
    }
    isSearching = false;
  }

  function clearSearch() {
    query = '';
    results = [];
  }
</script>

<div class="search-box">
  <input
    type="text"
    placeholder="Search photos, users..."
    bind:value={query}
    on:input={handleSearch}
    class="search-input"
  />
  
  {#if query && results.length > 0}
    <div class="search-results">
      {#each results as item (item.id)}
        <a href="/{item.type}/{item.id}" class="search-result-item">
          <div class="result-content">
            {#if item.type === 'photo'}
              <img src={item.image_url} alt={item.title} class="result-image" />
              <div>
                <div class="result-title">{item.title}</div>
                <div class="result-meta">Photo by {item.username || 'Unknown'}</div>
              </div>
            {:else}
              <img src={item.profile_image_url} alt={item.username} class="result-avatar" />
              <div>
                <div class="result-title">@{item.username}</div>
                <div class="result-meta">{item.followerCount || 0} followers</div>
              </div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-box {
    position: relative;
    flex: 1;
    max-width: 400px;
  }

  .search-input {
    width: 100%;
    padding: 8px 16px;
    background-color: var(--surface-variant);
    border: 1px solid transparent;
    border-radius: var(--radius-full);
    font-size: 14px;
    transition: var(--transition-fast);

    &:focus {
      background-color: var(--surface);
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(233, 30, 99, 0.1);
    }

    &::placeholder {
      color: var(--outline);
    }
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 8px;
    background-color: var(--surface);
    border: 1px solid var(--outline);
    border-radius: var(--radius-md);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: var(--shadow-lg);
  }

  .search-result-item {
    display: block;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--outline);
    transition: var(--transition-fast);
    text-decoration: none;
    color: inherit;

    &:hover {
      background-color: var(--surface-variant);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .result-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .result-image {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    object-fit: cover;
  }

  .result-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  .result-title {
    font-weight: 500;
    font-size: 14px;
  }

  .result-meta {
    font-size: 12px;
    color: var(--outline);
  }

  @media (max-width: 768px) {
    .search-box {
      max-width: 100%;
    }
  }
</style>
