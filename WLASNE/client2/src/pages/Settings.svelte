<script lang="ts">
    import Card, { Actions } from '@smui/card';
    import Paper, { Content, Title } from '@smui/paper';
    import Textfield, { Input } from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import CharacterCounter from '@smui/textfield/character-counter';
    import Button, { Icon, Label } from '@smui/button';
    import { authAPI, blockAPI, getProfilePhotoURL, getUserID, photoAPI, userAPI, type Photo } from '../api.svelte';
    import { onMount } from 'svelte';
    import PhotoSmall from '../lib/PhotoSmall.svelte';
    import Dialog, { CloseTooltipWrapper } from '@smui/dialog';
    import IconButton from '@smui/icon-button';
    let userId = getUserID();
    let user : {
        id: number;
        username: string;
        email: string;
        bio?: string;
        photoCount: number;
        followerCount: number;
        followingCount: number;
        isFollowed: boolean;
        isFollowing: boolean;
    } | any = $state({})

    onMount(async () => {
        user = await userAPI.getProfile(userId || 0);
        fetchedPhotos = await photoAPI.getUserPhotos(userId || 0, 1);
        blockedUsers = (await blockAPI.getBlockedUsers(1)).blockedUsers;
    });
    let bio = $state('')
    let username = $state('')
    let password = $state('')
    let src = getProfilePhotoURL(userId);

    let fetchedPhotos : { photos: Photo[]; total: number; page: number; } = $state(
        { photos: [], total: 0, page: 1 }
    )
    let open = $state(false)
    let blockedUsers : { id: number; username: string; }[] = $state([])

</script>

<Dialog bind:open aria-describedby="sheet-content">
<div class="hbox" style="padding: 1rem; gap: 2rem;">

    <CloseTooltipWrapper>
        <IconButton action="close" onclick={() => {open= false}}>
            <Icon class="material-icons">close</Icon>
    </IconButton>
</CloseTooltipWrapper>
<h2>Zablokowani użytkownicy</h2>
<Content>
    {#each blockedUsers as user}
    <div class="vbox" style="align-items: center; gap:1rem;">
        <img class="blocked-user-img" src="{getProfilePhotoURL(user.id)}" alt="Zdjęcie użtkownika {user.username}">
        <Label>{user.username}</Label>
        <Button onclick={async () => {
            await blockAPI.unblockUser(user.id)
            blockedUsers = (await blockAPI.getBlockedUsers(1)).blockedUsers;
        }}>
            <Label>Odblokuj</Label>
        </Button>
    </div>
    {/each}
</Content>
</div>
</Dialog>

<main>
    <Paper>
        <Title>
            <div class="vbox" style="align-items: center; gap:2rem;">
                <img src={src} alt="Zdjęcie użytkownika">
                <span>
                    {user.username} 
                </span>
                <div style="flex-grow: 100;"></div>
                <Button variant="outlined" onclick={() => {
                    open = true
                }}>
                    <Label>Zablokowani użytkownicy</Label>
                </Button>
            </div>
        </Title>
        <Content>{user.bio != undefined ? user.bio : ""}</Content>
    </Paper>
    <div class="hpad"></div>
    <Card padded >
        

    <Textfield variant="outlined" bind:value={username} label="Nowa nazwa użytkownika">
      
    </Textfield>
    <div class="hpad"></div>
    <Textfield variant="outlined" bind:value={password} label="Nowe hasło">
      
    </Textfield>
    
    <div class="hpad"></div>

    <Textfield textarea bind:value={bio} label="O mnie" input$maxlength={1000}>
            {#snippet helper()}
                <HelperText>Napisz coś o sobie</HelperText>
            {/snippet}
            {#snippet internalCounter()}
                <CharacterCounter></CharacterCounter>
            {/snippet}
        </Textfield>

        <Actions>
        <Button onclick={async () => {
            if(password.length < 8)

            userAPI.updateProfile(username !== '' ? username : undefined,
                bio !== '' ? bio : undefined,
                password !== '' ? password : undefined,
            );

            bio = '';
            password = '';
            username = '';
            user = await userAPI.getProfile(userId || 0);
        }}>
          <Label>Zapisz zmiany</Label>
        </Button>
        <Button onclick={() => {
            bio = '';
            username = '';
            password = '';
        }}>
          <Label>Odrzuć zmiany</Label>
        </Button>
      </Actions>

    </Card>

    <Paper>
        <div class="user-images">
        {#each fetchedPhotos.photos as pht, i}
            <PhotoSmall description={pht.description} id={pht.id} owner_id={pht.owner_id} username={pht.username}/>
        {/each}
        </div>
    </Paper>
</main>

<style>
    img.blocked-user-img {
        height: 4rem;
    }
    img {
        aspect-ratio: 1;
        height: 7rem;
        border-radius: 50%;
    }
        div.user-images {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
</style>