<script lang="ts">
    import Card from "../components/Card.svelte";
    import Input from "../components/Input.svelte";
    import Button from "../components/Button.svelte";

    import { authAPI } from "../api.svelte";

    let login = $state({
        error: '',
        isPending: false,
        email: '',
        password: '',
    })

    function handleLogin(event: SubmitEvent) {
        event.preventDefault();

        login.isPending = true;
        login.error = '';
        if (!login.email || !login.password) {
            login.error = 'Uzupełnij pola';
            login.isPending = false;
            return;
        }

        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!regex.test(login.email)) {
            login.error = 'Niepoprawny adreds email';
            login.isPending = false;
            return;
        }

        if (login.password.length < 8) {
            login.error = 'Hasło nie może być krótsze niż 8 znaków';
            login.isPending = false;
            return;
        }

        authAPI.login(login.email, login.password).then((data) => {
            login.isPending = false;
            console.log(data.token)
        }).catch((e) => {
            console.log(e)
            login.error = e;
            setTimeout(() => {login.isPending = false}, 1000)
        });


        
    }
</script>

<div class="login-page">
  <Card variant="elevated" padding="lg">
    <div class="login-container">
      <h1>Witaj ponownie</h1>
      <p>Zaloguj się na swoje konto</p>

      {#if login.error}
        <div class="error-message">{login.error}</div>
      {/if}

      <form onsubmit={handleLogin} class="login-form">
        <Input
          label="Email"
          type="email"
          placeholder="adres@email.com"
          bind:value={login.email}
          disabled={login.isPending}
        />

        <Input
          label="Hasło"
          type="password"
          placeholder="••••••••"
          bind:value={login.password}
          disabled={login.isPending}
        />

        <Button
          variant="filled"
          label={login.isPending ? 'Logowanie...' : 'Zaloguj'}
          disabled={login.isPending}
          onClick={() => handleLogin(new SubmitEvent("asd"))}
        />
      </form>

      <div class="auth-links">
        <p>Nie masz konta? <a href="/register">Zarejstruj się</a></p>
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
