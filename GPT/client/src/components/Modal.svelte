<script>
  import IconButton from './IconButton.svelte';

  export let isOpen = false;
  export let title = '';
  export let onClose = () => {};

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleEscapeKey} />

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal">
      {#if title}
        <div class="modal-header">
          <h2 class="modal-title">{title}</h2>
          <button class="modal-close" on:click={onClose} title="Close">
            <IconButton icon="close" label="Close" size="sm" />
          </button>
        </div>
      {/if}
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.32);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
    animation: fadeIn 200ms ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal {
    background-color: var(--surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    animation: slideUp 300ms ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(16px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--outline);
  }

  .modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
  }

  .modal-close {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    padding: var(--spacing-lg);
  }

  @media (max-width: 768px) {
    .modal {
      max-width: 95vw;
      max-height: 95vh;
    }
  }
</style>
