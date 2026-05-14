<script>
  export let src = '';
  export let alt = 'Avatar';
  export let size = 'md'; // xs, sm, md, lg, xl
  export let online = false;

  const sizeMap = {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '64px',
    xl: '128px'
  };
</script>

<div class="avatar" style="--avatar-size: {sizeMap[size]}">
  <img {src} {alt} class="avatar-image" />
  {#if online}
    <div class="online-indicator"></div>
  {/if}
</div>

<style>
  .avatar {
    position: relative;
    width: var(--avatar-size);
    height: var(--avatar-size);
    border-radius: var(--radius-full);
    overflow: hidden;
    background-color: var(--surface-variant);
    flex-shrink: 0;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 25%;
    height: 25%;
    background-color: var(--tertiary, #4caf50);
    border: 2px solid var(--surface);
    border-radius: var(--radius-full);
  }
</style>
