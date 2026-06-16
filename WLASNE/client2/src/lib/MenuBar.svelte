<script lang="ts">
    import Button, { Icon, Label } from "@smui/button";
    import BottomAppBar, { Section } from "@smui-extra/bottom-app-bar"
    import IconButton from "@smui/icon-button";
    import TabBar from '@smui/tab-bar'
    import Tab from '@smui/tab'

    let activeTab = $state("Strona główna")

    let tabToIconMapping: any = {
      'Strona główna':'home',
      'Szukaj':'search',
      'Dodaj':'upload',
      'Moje konto':'person',
    };

    let tabToPathMapping: any = {
      'Strona główna':'#home',
      'Szukaj': '#search',
      'Dodaj':'#upload',
      'Moje konto':'#profile',
    };
</script>

<header>
    <BottomAppBar
      variant="static"
      color='primary'
    >
    <TabBar tabs={['Strona główna', 'Szukaj', 'Dodaj', 'Moje konto']} bind:activeTab>
    {#snippet tab(tab: any)}
      <Tab {tab} onclick={() => {window.location.hash = tabToPathMapping[tab]}}>
      <div class="hbox" style="justify-content: center; align-items: center;">
        <Icon class="material-icons">{tabToIconMapping[tab]}</Icon>
        <Label>{tab}</Label>
      </div>
      </Tab>
    {/snippet}
    </TabBar>
    </BottomAppBar>
</header>

<style>
    header {
        width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        position: fixed;
        bottom:0;
    }
</style>