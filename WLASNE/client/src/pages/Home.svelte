<script>
  import { authStore, photoStore } from '../store.js';
  import Card from '../components/Card.svelte';
  import Button from '../components/Button.svelte';
  import Spinner from '../components/Spinner.svelte';
  import Avatar from '../components/Avatar.svelte';

  let photos = [];
  let isLoading = false;

  async function loadPhotos() {
    isLoading = true;
    try {
      const response = await fetch('/api/photos/feed', {
        headers: { Authorization: `Bearer ${$authStore.token}` }
      });
      const data = await response.json();
      photos = data.photos || [];
    } catch (e) {
      console.error(e);
    }
    isLoading = false;
  }

  function toggleLike(photoId) {
    window.location.hash = `/photo/${photoId}`;
  }
</script>

<div class="home-page">
  <div class="hero">
    <h1>Welcome, {$authStore.user?.username || 'User'}!</h1>
    <p>Share your moments with friends</p>
    <Button variant="filled" label="Upload Photo" onClick={() => window.location.hash = '/upload'} />
  </div>

  <div class="photos-grid">
    {#if isLoading}
      <div class="loading-container">
        <Spinner size="lg" />
      </div>
    {:else if photos.length === 0}
      <div class="empty-state">
        <p>No photos yet. Follow someone or upload your first photo!</p>
      </div>
    {:else}
      {#each photos as photo (photo.id)}
        <Card variant="elevated">
          <div class="photo-card">
            <img src={photo.image_url} alt={photo.title} class="photo-image" />
            <div class="photo-info">
              <div class="photo-header">
                <Avatar src={photo.user_avatar_url} alt={photo.username} size="sm" />
                <div>
                  <div class="username">{photo.username}</div>
                  <div class="timestamp">{new Date(photo.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div class="photo-title">{photo.title}</div>
              <div class="photo-description">{photo.description}</div>
              <div class="photo-stats">
                <span>❤️ {photo.likeCount || 0}</span>
                <span>💬 {photo.commentCount || 0}</span>
              </div>
              <Button 
                variant="text" 
                size="sm"
                label="View Details"
                onClick={() => toggleLike(photo.id)}
              />
            </div>
          </div>
        </Card>
      {/each}
    {/if}
  </div>
</div>

<style>
  .home-page {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .hero {
    text-align: center;
    padding: var(--spacing-xl) 0;
  }

  .hero h1 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 28px;
  }

  .hero p {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--outline);
  }

  .photos-grid {
    display: grid;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-lg);
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: var(--spacing-xl);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--outline);
  }

  .photo-card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .photo-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: var(--radius-md);
  }

  .photo-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .photo-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .username {
    font-weight: 500;
    font-size: 14px;
  }

  .timestamp {
    font-size: 12px;
    color: var(--outline);
  }

  .photo-title {
    font-weight: 500;
    font-size: 16px;
  }

  .photo-description {
    font-size: 14px;
    color: var(--on-surface-variant);
    line-height: 1.5;
  }

  .photo-stats {
    display: flex;
    gap: var(--spacing-lg);
    font-size: 14px;
    color: var(--outline);
  }

  @media (min-width: 768px) {
    .photos-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
