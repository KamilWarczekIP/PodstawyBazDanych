<script>
  import { authStore } from '../store.js';
  import { photoAPI, commentAPI, likeAPI, blockAPI } from '../api.js';
  import Card from '../components/Card.svelte';
  import Avatar from '../components/Avatar.svelte';
  import Input from '../components/Input.svelte';
  import Button from '../components/Button.svelte';
  import IconButton from '../components/IconButton.svelte';
  import Spinner from '../components/Spinner.svelte';

  export let params = {};
  const photoId = params.id;

  let photo = null;
  let comments = [];
  let isLiked = false;
  let newComment = '';
  let isLoading = true;
  let isSubmitting = false;

  async function loadPhoto() {
    try {
      const data = await photoAPI.getPhoto(photoId);
      photo = data.photo;
      comments = data.comments || [];
      
      // Check if user liked
      if ($authStore.isAuthenticated) {
        const likeData = await likeAPI.checkLike(photoId);
        isLiked = likeData.isLiked;
      }
    } catch (e) {
      console.error(e);
    }
    isLoading = false;
  }

  async function toggleLike() {
    if (!$authStore.isAuthenticated) return;

    try {
      if (isLiked) {
        await likeAPI.unlike(photoId);
      } else {
        await likeAPI.like(photoId);
      }
      isLiked = !isLiked;
    } catch (e) {
      console.error(e);
    }
  }

  async function submitComment() {
    if (!newComment.trim()) return;

    isSubmitting = true;
    try {
      const data = await commentAPI.addComment(photoId, { text: newComment });
      comments = [...comments, data.comment];
      newComment = '';
    } catch (e) {
      console.error(e);
    }
    isSubmitting = false;
  }
</script>

<div class="photo-detail-page">
  {#if isLoading}
    <div class="loading-container">
      <Spinner size="lg" />
    </div>
  {:else if photo}
    <div class="photo-container">
      <Card variant="elevated" padding="none">
        <img src={photo.image_url} alt={photo.title} class="photo-image" />
      </Card>

      <div class="photo-sidebar">
        <Card variant="elevated" padding="lg">
          <div class="photo-header">
            <Avatar src={photo.user_avatar_url} alt={photo.username} size="lg" />
            <div class="user-info">
              <a href="/user/{photo.user_id}" class="username">{photo.username}</a>
              <div class="timestamp">{new Date(photo.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="photo-meta">
            <h2>{photo.title}</h2>
            <p>{photo.description}</p>
            {#if photo.tags}
              <div class="tags">
                {#each photo.tags as tag}
                  <span class="tag">#{tag}</span>
                {/each}
              </div>
            {/if}
          </div>

          <div class="photo-actions">
            <button class="action-btn" on:click={toggleLike}>
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{photo.likeCount || 0}</span>
            </button>
            <button class="action-btn">
              <span>💬</span>
              <span>{comments.length}</span>
            </button>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <h3>Comments</h3>
          <div class="comments-section">
            {#each comments as comment}
              <div class="comment-item">
                <Avatar src={comment.user_avatar_url} alt={comment.username} size="sm" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-username">{comment.username}</span>
                    <span class="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p class="comment-text">{comment.text}</p>
                </div>
              </div>
            {/each}

            {#if $authStore.isAuthenticated}
              <div class="add-comment">
                <Input
                  placeholder="Add a comment..."
                  bind:value={newComment}
                  disabled={isSubmitting}
                />
                <Button
                  variant="filled"
                  size="sm"
                  label="Post"
                  onClick={submitComment}
                  disabled={isSubmitting || !newComment.trim()}
                />
              </div>
            {/if}
          </div>
        </Card>
      </div>
    </div>
  {/if}
</div>

<style>
  .photo-detail-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .photo-container {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--spacing-lg);
  }

  .photo-image {
    width: 100%;
    height: auto;
    max-height: 600px;
    object-fit: contain;
  }

  .photo-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .user-info {
    flex: 1;
  }

  .username {
    font-weight: 500;
    color: var(--primary, #e91e63);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .timestamp {
    font-size: 12px;
    color: var(--outline);
  }

  .photo-meta {
    margin-bottom: var(--spacing-lg);
  }

  .photo-meta h2 {
    margin: 0 0 var(--spacing-sm) 0;
  }

  .photo-meta p {
    margin: 0;
    color: var(--on-surface-variant);
    line-height: 1.5;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .tag {
    padding: 4px 8px;
    background-color: var(--surface-variant);
    border-radius: var(--radius-full);
    font-size: 12px;
    color: var(--primary, #e91e63);
  }

  .photo-actions {
    display: flex;
    gap: var(--spacing-lg);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    transition: var(--transition-fast);

    &:hover {
      color: var(--primary, #e91e63);
    }
  }

  .comments-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .comments-section h3 {
    margin: 0 0 var(--spacing-md) 0;
  }

  .comment-item {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--surface-variant);
    border-radius: var(--radius-md);
  }

  .comment-content {
    flex: 1;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xs);
  }

  .comment-username {
    font-weight: 500;
    font-size: 14px;
  }

  .comment-date {
    font-size: 12px;
    color: var(--outline);
  }

  .comment-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
  }

  .add-comment {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: var(--spacing-xl);
  }

  @media (max-width: 1024px) {
    .photo-container {
      grid-template-columns: 1fr;
    }

    .photo-sidebar {
      display: contents;
    }
  }
</style>
