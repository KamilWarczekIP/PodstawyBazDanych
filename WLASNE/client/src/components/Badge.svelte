<script>
  export let count = 0;
  export let variant = 'filled'; // filled, outlined
  export let max = 99;

  const displayCount = count > max ? `${max}+` : count;
</script>

<div class="badge" class:variant>
  {displayCount}
</div>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    min-height: 20px;
    padding: 2px 6px;
    border-radius: var(--radius-full);
    font-size: 11px;
    font-weight: 600;
    line-height: 1;

    &.filled {
      background-color: var(--error, #b3261e);
      color: white;
    }

    &.outlined {
      background-color: transparent;
      border: 1px solid var(--error, #b3261e);
      color: var(--error, #b3261e);
    }
  }
</style>
