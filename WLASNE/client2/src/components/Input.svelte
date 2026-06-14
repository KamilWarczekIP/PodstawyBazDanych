<script>
  export let type = 'text';
  export let placeholder = '';
  export let value = '';
  export let label = '';
  export let error = '';
  export let disabled = false;

  let inputElement;

  export function focus() {
    inputElement?.focus();
  }
</script>

<div class="input-container">
  {#if label}
    <label for="input-field">{label}</label>
  {/if}
  {#if type === 'text'}
    <input
      bind:this={inputElement}
      type="text"
      {placeholder}
      bind:value
      {disabled}
      class="input-field"
      class:error
      id="input-field"
    />
  {:else if type === 'email'}
    <input
      bind:this={inputElement}
      type="email"
      {placeholder}
      bind:value
      {disabled}
      class="input-field"
      class:error
      id="input-field"
    />
  {:else if type === 'password'}
    <input
      bind:this={inputElement}
      type="password"
      {placeholder}
      bind:value
      {disabled}
      class="input-field"
      class:error
      id="input-field"
    />
  {:else if type === 'number'}
    <input
      bind:this={inputElement}
      type="number"
      {placeholder}
      bind:value
      {disabled}
      class="input-field"
      class:error
      id="input-field"
    />
  {:else}
    <input
      bind:this={inputElement}
      type="text"
      {placeholder}
      bind:value
      {disabled}
      class="input-field"
      class:error
      id="input-field"
    />
  {/if}
  {#if error}
    <span class="error-text">{error}</span>
  {/if}
</div>

<style>
  .input-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  label {
    font-size: 12px;
    font-weight: 500;
    color: var(--on-surface);
  }

  .input-field {
    padding: 8px 16px;
    background-color: var(--surface-variant);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-family: inherit;
    transition: var(--transition-fast);

    &:focus {
      outline: none;
      background-color: var(--surface);
      border-color: var(--primary, #e91e63);
      box-shadow: 0 0 0 2px rgba(233, 30, 99, 0.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.error {
      border-color: var(--error, #b3261e);

      &:focus {
        box-shadow: 0 0 0 2px rgba(179, 38, 30, 0.1);
      }
    }

    &::placeholder {
      color: var(--outline);
    }
  }

  .error-text {
    font-size: 12px;
    color: var(--error, #b3261e);
  }
</style>
