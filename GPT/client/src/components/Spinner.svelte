<script>
  export let size = 'md'; // sm, md, lg
  export let color = 'primary';

  const sizeMap = {
    sm: '20px',
    md: '40px',
    lg: '60px'
  };

  const colorVar = {
    primary: 'var(--primary, #e91e63)',
    secondary: 'var(--secondary, #2196f3)',
    tertiary: 'var(--tertiary, #4caf50)',
    error: 'var(--error, #b3261e)'
  }[color];
</script>

<div class="spinner" style="--spinner-size: {sizeMap[size]}; --spinner-color: {colorVar}">
</div>

<style>
  :global(:root) {
    --spinner-size: 40px;
    --spinner-color: var(--primary, #e91e63);
  }

  .spinner {
    width: var(--spinner-size);
    height: var(--spinner-size);
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-top-color: var(--spinner-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
