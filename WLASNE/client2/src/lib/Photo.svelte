<script lang="ts">
    import Card from "@smui/card";
    import Button, {Icon, Label} from "@smui/button";
    import Chip, { Set, Text } from '@smui/chips';
    import { getPhotoURL, getProfilePhotoURL, likeAPI } from "../api.svelte";

    let { userId, photoId, likesCount, liked,
         description, tags, username } : 
    {userId:number, photoId:number, likesCount:number, liked:boolean,
        description:string, tags: string[], username:string } 
    = $props();

    // svelte-ignore state_referenced_locally
    likeAPI.getCount(photoId).then(o => {likesCount = o.count});
    let src = getPhotoURL(userId, photoId)
    let srcUser = getProfilePhotoURL(userId);
</script>

<div class="bound">
    <Card padded>
        <div class="hbox">
            <a href="#profile?id={userId}">
                <div class="vbox" style="align-items: center;">
                    <img class="user" src="{srcUser}" alt="Zdjęcie użytkownika {username}">
                    <div class="vpad"></div>
                    <h2> {username} </h2>
                </div>
            </a>
            <div class="hpad"></div>
            <a href="#photo?id={photoId}">
                <img class="main" {src} alt="{description}">
            </a>
            <div class="hpad"></div>
            <div class="vbox" style="justify-content: space-between;">
                <div class="tags">
                    <Set chips={tags} nonInteractive>
                    {#snippet chip(chip:string)}
                        <Chip {chip}>
                        <Text>#{chip}</Text>
                        </Chip>
                    {/snippet}
                    </Set>
                </div>
                <Button variant="outlined" onclick={async () => {
                    try{
                        if(liked)
                            await likeAPI.unlikePhoto(photoId);
                        else
                            await likeAPI.likePhoto(photoId);
                    } catch(e)
                    {
                        console.error(e)
                    }
                    liked = !liked;
                    likesCount = (await likeAPI.getCount(photoId)).count;
                }}> 
                    <Icon class="material-icons">{liked ? "favorite" : "favorite_border"}</Icon>
                    <Label>{likesCount}</Label>
                </Button>
            </div>
        </div>
        
    </Card>
</div>

<style>
    div.tags {
        display: flex;
        max-width: 50%;
        overflow-x: scroll;
    }

    div.bound{
        max-width: clamp(100px, 80dvw, 600px);
    }
    img.main {
        aspect-ratio: 1;
        width: 100%;
    }
    img.user {
        aspect-ratio: 1;
        height: clamp(16px, 8dvh, 128px);
        border-radius: 50%;
    }
    a {
        text-decoration: none;
        color: unset;
    }

</style>