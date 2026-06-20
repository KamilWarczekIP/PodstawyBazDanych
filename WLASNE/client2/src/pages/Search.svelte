<script lang="ts">
  import Textfield from '@smui/textfield';
  import Button, { Icon } from '@smui/button';
  import Paper from '@smui/paper';
  import { searchAPI } from '../api.svelte';

  const MIN_QUERY_LENGTH = 3;
  const PAGE_LIMIT = 5;

  let query = $state('');
  let loading = $state(false);
  let error = $state('');
  let showResults = $state(false);

  let photos: any[] = $state([]);
  let users: any[] = $state([]);

  let photoPage = $state(1);
  let userPage = $state(1);

  async function searchAll() {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      photos = [];
      users = [];
      showResults = false;
      return;
    }

    loading = true;
    error = '';

    try {
      const [photoResult,  userResult] = await Promise.all([
        searchAPI.searchPhotos(query, photoPage, PAGE_LIMIT),
        searchAPI.searchUsers(query, userPage, PAGE_LIMIT)
      ]);

      photos = photoResult.photos || [];
      users = userResult.users || []; 
      showResults = true;
    } catch (e) {
      console.error(e);
      error = 'Błąd wyszukiwania. Spróbuj ponownie później.';
    } finally {
      loading = false;
    }
  }

  function handleInput() {
    if (query.trim().length >= MIN_QUERY_LENGTH) {
      photoPage = 1;
      userPage = 1;
      searchAll();
    } else {
      showResults = false;
      photos = [];
      users = [];
    }
  }

  async function loadMore(type: 'photos' | 'users') {
    loading = true;
    error = '';

    try {
      if (type === 'photos') {
        photoPage += 1;
        const result = await searchAPI.searchPhotos(query, photoPage, PAGE_LIMIT);
        photos = [...photos, ...(result.photos || [])];
      }
      if (type === 'users') {
        userPage += 1;
        const result = await searchAPI.searchUsers(query, userPage, PAGE_LIMIT);
        users = [...users, ...(result.users || [])];
      }
    } catch (e) {
      console.error(e);
      error = 'Nie udało się załadować dodatkowych wyników.';
    } finally {
      loading = false;
    }
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (query.trim().length >= MIN_QUERY_LENGTH) {
      photoPage = 1;
      userPage = 1;
      searchAll();
    }
  }
</script>

<div class="search-page">
  <form class="search-form" onsubmit={handleSubmit}>
    <Paper>
      <Textfield
        bind:value={query}
        type="text"
        outlined
        placeholder="Wpisz co najmniej 3 znaki..."
        on:input={handleInput}
      >
        {#snippet label()}
          <Icon class="material-icons">search</Icon>
          Wyszukaj
        {/snippet}
      </Textfield>
    </Paper>
  </form>

  {#if loading}
    <div class="status-message">Ładowanie...</div>
  {/if}

  {#if error}
    <div class="status-message error">{error}</div>
  {/if}

  {#if showResults}
    <div class="results-grid">
      <Paper>
        <div class="result-column">
          <h3>Zdjęcia</h3>
          {#if photos.length === 0}
            <p class="empty-text">Brak wyników dla zdjęć.</p>
          {:else}
            {#each photos as photo}
              <a class="result-link" href="#photo?id={photo.id}">
                <div class="result-row">
                  <div class="result-meta">
                    <strong>{photo.username}</strong>
                    <span>{photo.description}</span>
                  </div>
                  <img
                    class="result-thumb"
                    src={`http://${window.location.hostname}:8089/${photo.owner_id}/${photo.id}.jpg`}
                    alt={photo.description}
                  />
                </div>
              </a>
            {/each}
            <Button variant="outlined" on:click={() => loadMore('photos')}>Więcej zdjęć</Button>
          {/if}
        </div>
      </Paper>

      <Paper>
        <div class="result-column">
          <h3>Użytkownicy</h3>
          {#if users.length === 0}
            <p class="empty-text">Brak wyników dla użytkowników.</p>
          {:else}
            {#each users as user}
              <a class="result-link" href="#profile?id={user.id}">
                <div class="result-row user-row">
                  <div>
                    <strong>{user.username}</strong>
                    <span>{user.bio || 'Brak opisu'}</span>
                  </div>
                </div>
              </a>
            {/each}
            <Button variant="outlined" on:click={() => loadMore('users')}>Więcej użytkowników</Button>
          {/if}
        </div>
      </Paper>
    </div>
  {/if}
</div>

<style>
  .search-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }


  .status-message {
    color: var(--on-surface-variant, #49454e);
    font-size: 0.95rem;
  }

  .status-message.error {
    color: var(--error, #b3261e);
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .result-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    min-height: 1px;
  }

  .result-column h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .result-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .result-row span {
    color: var(--on-surface-variant, #49454e);
    font-size: 0.95rem;
  }

  .result-thumb {
    width: 4rem;
    height: 4rem;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  .result-link {
    color: inherit;
    text-decoration: none;
  }

  .tag-row {
    padding: 0.75rem 0;
  }

  .user-row {
    align-items: flex-start;
  }

  .empty-text {
    color: var(--on-surface-variant, #49454e);
    font-size: 0.95rem;
  }

  @media (max-width: 900px) {
    .results-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
