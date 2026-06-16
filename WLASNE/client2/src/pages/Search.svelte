<div class="page">
  <Textfield bind:value={valueElementsLabel} type="text" label$class="w80">
    {#snippet label()}
      <CommonIcon
        class="material-icons"
        style="font-size: 1em; line-height: normal; vertical-align: top;"
        >search</CommonIcon
      > Wyszukaj
    {/snippet}
  </Textfield>
</div>

<script lang="ts">
  import Textfield from '@smui/textfield';
  import { Icon as CommonIcon } from '@smui/common';

  let valueElementsLabel = $state('');
</script>

<style>
    .w80 {
     width: 80dvw;   
    }
    div.page {
        width: 100dvw;
        display: flex;
        justify-content: center;
        align-items: center;
        height:100dvh;
    }
</style>