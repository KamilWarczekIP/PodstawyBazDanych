<script lang="ts">
    import Card from '@smui/card';
    import Paper, { Content, Title } from '@smui/paper';
    import { onMount } from 'svelte';
    import { blockAPI, followAPI, getPhotoURL, getProfilePhotoURL, photoAPI, userAPI, type Photo } from '../api.svelte';
    
    
    import PhotoSmall from '../lib/PhotoSmall.svelte';
    import Button, { Group, GroupItem,Label, Icon } from '@smui/button';
    import Menu from '@smui/menu';
    import List, { Item, Separator, Text } from '@smui/list';

    let { userId } : { userId:number } = $props();

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
    let fetchedPhotos : { photos: Photo[]; total: number; page: number; } = $state(
        { photos: [], total: 0, page: 1 }
    )
    let page = $state(1)

    // svelte-ignore state_referenced_locally
    let src = getProfilePhotoURL(userId);

    onMount(async () => {
        user = await userAPI.getProfile(userId);
        fetchedPhotos = await photoAPI.getUserPhotos(userId, page);
    });
    let menu: Menu;
</script>





<Paper>
        <Title>
            <div class="vbox" style="align-items: center; gap:2rem;">
                <img class="profile-pic" src={src} alt="Zdjęcie użytkownika" style="flex-grow: 0;">
                <span style="flex-grow: 0;">
                    {user.username}
                </span>
                <div style="flex-grow: 100;"></div>
                <div class="hbox">

                    <Label>
                        {user.followerCount} Obserwujących
                    </Label>

                    <Label>
                        {user.followingCount} Obserwowanych
                    </Label>
                </div>
                <div class="userinfo-buttons hbox" style="flex-grow: 0;">
                    <Group variant="raised">
                    <Button onclick={() => {
                        if(user.isFollowing)
                            followAPI.unfollowUser(user.id);
                        else
                            followAPI.followUser(user.id);
                        window.setTimeout(async () => {user = await userAPI.getProfile(userId);}, 100)
                
                    }} variant="raised">
                        <Label>{user.isFollowing === true ? "PRZESTAŃ OBSERWOWAĆ" : "OBSERWUJ"}</Label>
                    </Button>
                    <div use:GroupItem>
                        <Button
                        onclick={() => menu.setOpen(true)}
                        variant="raised"
                        style="padding: 0; min-width: 36px;"
                        >
                        <Icon class="material-icons" style="margin: 0;">arrow_drop_down</Icon>
                        </Button>
                        <Menu bind:this={menu} anchorCorner="TOP_LEFT">
                        <List>
                            <Item onSMUIAction={() => {
                                blockAPI.blockUser(user.id)
                            }}>
                            <Text>Zablokuj użytkownika</Text>
                            </Item>
                        </List>
                        </Menu>
                    </div>
                    </Group>
                </div>
            </div>
        </Title>
        <Content>{user.bio != undefined ? user.bio : ""}</Content>
    </Paper>
    <div class="hpad"></div>
    <Paper>
        <div class="user-images">
        {#each fetchedPhotos.photos as pht, i}
            <PhotoSmall description={pht.description} id={pht.id} owner_id={pht.owner_id} username={pht.username}/>
        {/each}
        </div>
    </Paper>
<Card>

</Card>

<style>
    div.user-images {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
    img.profile-pic {
        aspect-ratio: 1;
        height: 7rem;
        border-radius: 50%;
    }
    </style>
