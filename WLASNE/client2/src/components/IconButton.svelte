<script>
  export let icon = 'default';
  export let label = '';
  export let size = 'md';
  export let color = 'primary';
  export let disabled = false;

  const iconMap = {
    home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
    search: '<path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v5C5 9.88 6.12 11 7.5 11h8c1.38 0 2.5-1.12 2.5-2.5v-5C18 2.12 16.88 1 15.5 1zm0 6h-8v-5h8v5z"/> <circle cx="2.5" cy="15" r="2.5"/>',
    heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    comment: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
    share: '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>',
    user: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
    settings: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.04.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.12.14-.16.41-.04.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.05-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
    theme: '<path d="M12 18C6.48 18 2 13.52 2 8s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10zm0-18C6.48 0 2 4.48 2 10s4.48 10 10 10 10-4.48 10-10S17.52 0 12 0zm0 18v2c5.52 0 10-4.48 10-10h-2c0 4.41-3.59 8-8 8z"/>',
    bell: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>',
    menu: '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>',
    close: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
    back: '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>',
    photo: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
    add: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>'
  };

  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  };
</script>

<button
  class="icon-button"
  class:disabled
  class:size-sm={size === 'sm'}
  class:size-lg={size === 'lg'}
  {disabled}
  {...$$restProps}
>
  <svg
    width={sizeMap[size]}
    height={sizeMap[size]}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    {@html iconMap[icon] || iconMap.menu}
  </svg>
  {#if label}
    <span class="label">{label}</span>
  {/if}
</button>

<style>
  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    width: 40px;
    height: 40px;
    padding: var(--spacing-sm);
    background-color: transparent;
    color: var(--on-surface);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover:not(.disabled) {
      background-color: var(--surface-variant);
      color: var(--primary);
    }

    &:active:not(.disabled) {
      transform: scale(0.95);
    }
  }

  .icon-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .size-sm {
    width: 32px;
    height: 32px;
  }

  .size-lg {
    width: 48px;
    height: 48px;
  }

  .label {
    font-size: 12px;
    font-weight: 500;
  }
</style>
