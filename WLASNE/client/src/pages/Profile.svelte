<script>
  import { authStore, userStore } from '../store.js';
  import Card from '../components/Card.svelte';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import Avatar from '../components/Avatar.svelte';
  import Modal from '../components/Modal.svelte';

  let profile = $authStore.user;
  let isEditing = false;
  let editForm = {
    username: profile?.username || '',
    bio: profile?.bio || '',
    profile_image_url: profile?.profile_image_url || ''
  };
  let stats = { photoCount: 0, friendCount: 0, followerCount: 0 };
  let isSaving = false;

  async function loadStats() {
    try {
      const response = await fetch('/api/users/stats', {
        headers: { Authorization: `Bearer ${$authStore.token}` }
      });
      const data = await response.json();
      stats = data;
    } catch (e) {
      console.error(e);
    }
  }

  async function saveProfile() {
    isSaving = true;
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${$authStore.token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (response.ok) {
        profile = data.user;
        authStore.update(s => ({ ...s, user: data.user }));
        isEditing = false;
      }
    } catch (e) {
      console.error(e);
    }
    isSaving = false;
  }
</script>

<div class="profile-page">
  <Card variant="elevated" padding="lg">
    <div class="profile-header">
      <Avatar src={profile?.profile_image_url} alt={profile?.username} size="xl" />
      <div class="profile-info">
        <h1>{profile?.username}</h1>
        <p class="bio">{profile?.bio || 'No bio yet'}</p>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">{stats.photoCount}</span>
            <span class="stat-label">Photos</span>
          </div>
          <div class="stat">
            <span class="stat-value">{stats.friendCount}</span>
            <span class="stat-label">Friends</span>
          </div>
          <div class="stat">
            <span class="stat-value">{stats.followerCount}</span>
            <span class="stat-label">Followers</span>
          </div>
        </div>
        <Button 
          variant="filled" 
          label="Edit Profile"
          onClick={() => isEditing = true}
        />
      </div>
    </div>
  </Card>

  <Modal isOpen={isEditing} title="Edit Profile" onClose={() => isEditing = false}>
    <div class="edit-form">
      <Input
        label="Username"
        placeholder="Your username"
        bind:value={editForm.username}
      />
      <Input
        label="Bio"
        placeholder="Tell us about yourself"
        bind:value={editForm.bio}
      />
      <Input
        label="Profile Image URL"
        placeholder="https://example.com/image.jpg"
        bind:value={editForm.profile_image_url}
      />
      <div class="form-actions">
        <Button variant="filled" label="Save" onClick={saveProfile} disabled={isSaving} />
        <Button variant="outlined" label="Cancel" onClick={() => isEditing = false} />
      </div>
    </div>
  </Modal>
</div>

<style>
  .profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .profile-header {
    display: flex;
    gap: var(--spacing-xl);
    align-items: flex-start;
  }

  .profile-info {
    flex: 1;
  }

  .profile-info h1 {
    margin: 0 0 var(--spacing-sm) 0;
  }

  .bio {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--on-surface-variant);
  }

  .stats {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-weight: 600;
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--outline);
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
  }

  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stats {
      justify-content: center;
    }
  }
</style>
