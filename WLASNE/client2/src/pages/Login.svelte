<script lang="ts">
    import Card from "@smui/card";
    import Textfield from "@smui/textfield";
    import Button, { Label } from "@smui/button";

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
            localStorage.setItem("AUTH", JSON.stringify(data))
            login.isPending = false;
            window.location.hash = '';
        }).catch((e) => {
            login.error = "Błąd logowania. Niepoprawne dane.";
            window.location.hash = '#login';
            localStorage.removeItem("AUTH")
            setTimeout(() => {login.isPending = false}, 2000)
        });


        
    }
</script>
<div class="page">
  <Card padded>
    <div class="hbox">

    <h1>Witaj ponownie</h1>
      <p>Zaloguj się na swoje konto</p>

      {#if login.error}
        <div class="error-message">{login.error}</div>
      {/if}

      <form onsubmit={handleLogin} class="hbox">
        <Textfield
          label="Email"
          type="email"
          placeholder="adres@email.com"
          bind:value={login.email}
          disabled={login.isPending}
        />

        <Textfield
          label="Hasło"
          type="password"
          placeholder="••••••••"
          bind:value={login.password}
          disabled={login.isPending}
        />
        <div class="hpad"></div>

        <Button
          variant="raised"
          disabled={login.isPending}
          onclick={() => handleLogin(new SubmitEvent("asd"))}
        >
          <Label>{login.isPending ? 'Logowanie...' : 'Zaloguj'}</Label>
        </Button>
      </form>

      <div class="auth-links">
        <p>Nie masz konta? <a href="#register">Zarejstruj się</a></p>
      </div>

      </div>
  </Card>
</div>
<style>
  div.page {
    width: 100dvw;
    height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;
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
</style>
