<script>
  export let variant = 'filled'; // filled, outlined, text
  export let size = 'md'; // sm, md, lg
  export let disabled = false;
  export let label = '';
  export let onClick = () => {};

  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }[size];

  const variantClass = {
    filled: 'btn-filled',
    outlined: 'btn-outlined',
    text: 'btn-text'
  }[variant];
</script>

<button
  class="btn {sizeClass} {variantClass}"
  {disabled}
  on:click={onClick}
  title={label}
>
  <slot>{label}</slot>
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--radius-full);
    font-family: inherit;
    cursor: pointer;
    transition: var(--transition-fast);
    font-weight: 500;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):active {
      transform: scale(0.98);
    }
  }

  .btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }

  .btn-md {
    padding: 8px 24px;
    font-size: 14px;
  }

  .btn-lg {
    padding: 12px 32px;
    font-size: 16px;
  }

  .btn-filled {
    background-color: var(--primary, #e91e63);
    color: white;

    &:not(:disabled):hover {
      background-color: color-mix(
        in srgb,
        var(--primary, #e91e63) 90%,
        black
      );
      box-shadow: var(--shadow-md);
    }
  }

  .btn-outlined {
    border: 1px solid var(--primary, #e91e63);
    color: var(--primary, #e91e63);
    background-color: transparent;

    &:not(:disabled):hover {
      background-color: rgba(233, 30, 99, 0.08);
    }
  }

  .btn-text {
    color: var(--primary, #e91e63);
    background-color: transparent;

    &:not(:disabled):hover {
      background-color: rgba(233, 30, 99, 0.08);
    }
  }
</style>
