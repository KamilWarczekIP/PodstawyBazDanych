<script>
  export let variant = 'elevated'; // elevated, filled, outlined
  export let padding = 'md';

  const paddingClass = {
    sm: 'p-sm',
    md: 'p-md',
    lg: 'p-lg',
    none: 'p-none'
  }[padding];

  const variantClass = {
    elevated: 'card-elevated',
    filled: 'card-filled',
    outlined: 'card-outlined'
  }[variant];
</script>

<div class="card {variantClass} {paddingClass}">
  <slot />
</div>

<style>
  .card {
    border-radius: var(--radius-lg);
    transition: var(--transition-fast);

    &.p-sm {
      padding: var(--spacing-sm);
    }

    &.p-md {
      padding: var(--spacing-md);
    }

    &.p-lg {
      padding: var(--spacing-lg);
    }

    &.p-none {
      padding: 0;
    }
  }

  .card-elevated {
    background-color: var(--surface);
    box-shadow: var(--shadow-sm);

    &:hover {
      box-shadow: var(--shadow-md);
    }
  }

  .card-filled {
    background-color: var(--surface-variant);
  }

  .card-outlined {
    background-color: transparent;
    border: 1px solid var(--outline);
  }
</style>
