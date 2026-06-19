<Paper>
  <Textfield bind:value={valueElementsLabel} type="text" style="width: 100%;"
    helperLine$style="width: 100%;">
    {#snippet label()}
      <CommonIcon
        class="material-icons"
        style="font-size: 1em; line-height: normal; vertical-align: top;"
        >search</CommonIcon
      > Wyszukaj
    {/snippet}
  </Textfield>
</Paper>

<script lang="ts">
  import Textfield from '@smui/textfield';
  import { Icon as CommonIcon } from '@smui/common';
    import Paper from '@smui/paper';

  let valueElementsLabel = $state('');
</script>

<style>
</style>