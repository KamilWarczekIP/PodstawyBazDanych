<script>
  import { authStore } from '../store.svelte.js';
  import { authApi } from '../api.api.svelte.ts'
  import Card from '../components/Card.svelte';
  import Input from '../components/Input.svelte';
  import Button from '../components/Button.svelte';
  import Spinner from '../components/Spinner.svelte';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);

  async function handleLogin() {
    isLoading = true;
    error = '';
    if (!email || !password) {
      error = 'Uzupełnij pola';
      isLoading = false;
      return;
    }


    try {
      authApi
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
        error = data.message || 'Login failed';
      }
    } catch (e) {
      error = 'Network error';
      console.error(e);
    }

    isLoading = false;
  }
</script>

<div class="login-page">
  <Card variant="elevated" padding="lg">
    <div class="login-container">
      <h1>Witaj ponownie</h1>
      <p>Zaloguj się na swoje konto</p>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleLogin} class="login-form">
        <Input
          label="Email"
          type="email"
          placeholder="adres@email.com"
          bind:value={email}
          disabled={isLoading}
        />

        <Input
          label="Hasło"
          type="password"
          placeholder="••••••••"
          bind:value={password}
          disabled={isLoading}
        />

        <Button
          variant="filled"
          label={isLoading ? 'Logowanie...' : 'Zaloguj'}
          disabled={isLoading}
          onClick={handleLogin}
        />
      </form>

      <div class="auth-links">
        <p>Nie masz konta? <a href="#/register">Zarejstruj się</a></p>
      </div>
    </div>
  </Card>
</div>

<style>
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%);
  }

  .login-container {
    width: 100%;
    max-width: 400px;
  }

  .login-container h1 {
    margin: 0 0 var(--spacing-sm) 0;
    text-align: center;
  }

  .login-container > p {
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

  .login-form {
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
