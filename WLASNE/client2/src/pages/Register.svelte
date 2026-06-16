<script lang="ts">
  import Card from '@smui/card';
  import TextField from '@smui/textfield';
  import Button, { Label } from '@smui/button';
  import { authAPI } from '../api.svelte';

  let register = $state({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    error: '',
    isLoading: false,
  })
  

  async function handleRegister(event: SubmitEvent) {
    event.preventDefault()
    register.error = '';
    if (!register.username || !register.email || !register.password || !register.confirmPassword) {
      register.error = 'Uzupełnij wszystkie pola!';
      return;
    }

    if (register.password !== register.confirmPassword) {
      register.error = 'Podane hasła są różne';
      return;
    }

    if (register.password.length < 8) {
      register.error = 'Hało musi mieć minimum 8 znaków';
      return;
    }

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(register.email)) {
        register.error = 'Niepoprawny adres email';
        return;
    }

    register.isLoading = true;
    try {
        authAPI.register(register.username, register.email, register.password)
        window.location.hash = '#login';
    } catch (e) {
      register.error = 'Probelm z rejestracją';
    }
    register.isLoading = false;
  }
</script>

<div class="page">
  <Card variant="raised" padded>
    <div class="hbox">
      <h1>Załóż konto</h1>
      <p>Dołącz do naszej aplikacji</p>

      {#if register.error}
        <div class="error-message">{register.error}</div>
      {/if}

      <form onsubmit={handleRegister} class="hbox">
        <TextField
          label="Nazwa użytkownika"
          placeholder="jan_kowalski"
          bind:value={register.username}
          disabled={register.isLoading}
        />

        <TextField
          label="Email"
          type="email"
          placeholder="jkowalski@email.com"
          bind:value={register.email}
          disabled={register.isLoading}
        />

        <TextField
          label="Hasło"
          type="password"
          placeholder="••••••••"
          bind:value={register.password}
          disabled={register.isLoading}
        />

        <TextField
          label="Powtórz hasło"
          type="password"
          placeholder="••••••••"
          bind:value={register.confirmPassword}
          disabled={register.isLoading}
        />

        <div class="hpad"></div>

        <Button
          variant="raised"
          disabled={register.isLoading}
          onclick={() => handleRegister(new SubmitEvent("Z przycisku"))}
        > 
            <Label>{register.isLoading ? 'Tworzę konto...' : 'Utwórz konto'}</Label>
        </Button>
      </form>

      <div class="auth-links">
        <p>Masz już konto? <a href="#login">Zaloguj się</a></p>
      </div>
    </div>
  </Card>
</div>

<style>
  div.page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    }

</style>
