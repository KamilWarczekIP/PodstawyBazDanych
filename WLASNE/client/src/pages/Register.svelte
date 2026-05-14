<script>
  import { authStore } from '../store.js';
  import Card from '../components/Card.svelte';
  import Input from '../components/Input.svelte';
  import Button from '../components/Button.svelte';

  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let isLoading = false;

  async function handleRegister() {
    if (!username || !email || !password || !confirmPassword) {
      error = 'Please fill in all fields';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        authStore.set({
          token: data.token,
          user: data.user,
          isAuthenticated: true
        });
        localStorage.setItem('token', data.token);
        window.location.hash = '/';
      } else {
        error = data.message || 'Registration failed';
      }
    } catch (e) {
      error = 'Network error';
      console.error(e);
    }

    isLoading = false;
  }
</script>

<div class="register-page">
  <Card variant="elevated" padding="lg">
    <div class="register-container">
      <h1>Create Account</h1>
      <p>Join our photo sharing community</p>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleRegister} class="register-form">
        <Input
          label="Username"
          placeholder="your_username"
          bind:value={username}
          disabled={isLoading}
        />

        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          bind:value={email}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          bind:value={password}
          disabled={isLoading}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          bind:value={confirmPassword}
          disabled={isLoading}
        />

        <Button
          variant="filled"
          label={isLoading ? 'Creating account...' : 'Sign Up'}
          disabled={isLoading}
          onClick={handleRegister}
        />
      </form>

      <div class="auth-links">
        <p>Already have an account? <a href="#/login">Sign in</a></p>
      </div>
    </div>
  </Card>
</div>

<style>
  .register-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%);
  }

  .register-container {
    width: 100%;
    max-width: 400px;
  }

  .register-container h1 {
    margin: 0 0 var(--spacing-sm) 0;
    text-align: center;
  }

  .register-container > p {
    text-align: center;
    color: var(--outline);
    margin: 0 0 var(--spacing-lg) 0;
  }

  .error-message {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    background-color: rgba(179, 38, 30, 0.1);
    border: 1px solid var(--error, #b3261e);
    border-radius: var(--radius-md);
    color: var(--error, #b3261e);
    font-size: 14px;
  }

  .register-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .auth-links {
    text-align: center;
    font-size: 14px;
  }

  .auth-links a {
    color: var(--primary, #e91e63);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
