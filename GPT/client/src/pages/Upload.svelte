<script>
  import { authStore } from '../store.js';
  import Card from '../components/Card.svelte';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import Spinner from '../components/Spinner.svelte';

  let title = '';
  let description = '';
  let tags = '';
  let selectedFile = null;
  let preview = null;
  let isUploading = false;
  let error = '';
  let success = '';

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        preview = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload() {
    if (!title || !description || !selectedFile) {
      error = 'Please fill in all fields and select an image';
      return;
    }

    isUploading = true;
    error = '';
    success = '';

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image', selectedFile);
      if (tags) {
        formData.append('tags', tags.split(',').map(t => t.trim()).join(','));
      }

      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${$authStore.token}`
        },
        body: formData
      });

      if (response.ok) {
        success = 'Photo uploaded successfully!';
        title = '';
        description = '';
        tags = '';
        selectedFile = null;
        preview = null;
        setTimeout(() => {
          window.location.hash = '/';
        }, 1500);
      } else {
        error = 'Failed to upload photo';
      }
    } catch (e) {
      error = 'Upload error: ' + e.message;
      console.error(e);
    }

    isUploading = false;
  }
</script>

<div class="upload-page">
  <Card variant="elevated" padding="lg">
    <h1>Upload Photo</h1>
    <p>Share your moment with the community</p>

    {#if error}
      <div class="alert error">{error}</div>
    {/if}

    {#if success}
      <div class="alert success">{success}</div>
    {/if}

    <form on:submit|preventDefault={handleUpload} class="upload-form">
      <div class="form-group">
        <label for="image-input" class="image-input-label">
          {#if preview}
            <img src={preview} alt="Preview" class="preview-image" />
          {:else}
            <div class="placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16M14 12l2.586-2.586a2 2 0 0 1 2.828 0L20 14M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
              </svg>
              <p>Click to select image</p>
            </div>
          {/if}
        </label>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          on:change={handleFileSelect}
          disabled={isUploading}
          hidden
        />
      </div>

      <Input
        label="Title"
        placeholder="Photo title"
        bind:value={title}
        disabled={isUploading}
      />

      <Input
        label="Description"
        placeholder="Describe your photo..."
        bind:value={description}
        disabled={isUploading}
      />

      <Input
        label="Tags (comma-separated)"
        placeholder="nature, landscape, sunset"
        bind:value={tags}
        disabled={isUploading}
      />

      <Button
        variant="filled"
        label={isUploading ? 'Uploading...' : 'Upload Photo'}
        disabled={isUploading}
        onClick={handleUpload}
      />
    </form>
  </Card>
</div>

<style>
  .upload-page {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .upload-page h1 {
    margin: 0 0 var(--spacing-sm) 0;
  }

  .upload-page > div > p {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--outline);
  }

  .alert {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    font-size: 14px;

    &.error {
      background-color: rgba(179, 38, 30, 0.1);
      border: 1px solid var(--error, #b3261e);
      color: var(--error, #b3261e);
    }

    &.success {
      background-color: rgba(76, 175, 80, 0.1);
      border: 1px solid var(--tertiary, #4caf50);
      color: var(--tertiary, #4caf50);
    }
  }

  .upload-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .form-group {
    display: flex;
    justify-content: center;
  }

  .image-input-label {
    display: block;
    width: 100%;
    max-width: 400px;
    cursor: pointer;
  }

  .preview-image {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    border-radius: var(--radius-lg);
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    background-color: var(--surface-variant);
    border: 2px dashed var(--outline);
    border-radius: var(--radius-lg);
    color: var(--outline);
    transition: var(--transition-fast);
  }

  .placeholder:hover {
    border-color: var(--primary, #e91e63);
    background-color: rgba(233, 30, 99, 0.05);
  }

  .placeholder p {
    margin: var(--spacing-md) 0 0 0;
  }
</style>
