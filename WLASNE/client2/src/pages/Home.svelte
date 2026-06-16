<script lang="ts">
    import { followAPI, photoAPI } from "../api.svelte";
    import Photo from "../lib/Photo.svelte";
    import CircularProgress from '@smui/circular-progress';
    import { onMount } from 'svelte';

    let photos : {
    photo: {
        id: number;
        user_id: number;
        username: string;
        description: string;
    };
    likeCount: number;
    commentCount: number;
    userLiked: boolean;
}[]  = $state([])
    followAPI.getFeed(1).then((el) => {
        el.photos.forEach(photo => {photos.push(photo)})
    });

    photoAPI.getPhoto(16).then((e) => {
        photos.push(e);
        photos.push(e);
        photos.push(e);
    })

    const intersectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio <= 0) return;

        console.log("Loaded new items");
    });
	onMount(() => {
        intersectionObserver.observe(document.querySelector("#load-more"))
	});

</script>



<main class="hbox">
    {#each photos as photo}
        <Photo photoId={photo.photo.id} userId={photo.photo.user_id} description={photo.photo.description} liked={photo.userLiked} likesCount={photo.likeCount} tags={[]} username={photo.photo.username}/>
        <div class="hpad"></div>
    {/each}
    <div class="hpad"></div>
    <div id="load-more">
        <CircularProgress style="height: 32px; width: 32px;" indeterminate />
    </div>
</main>



<style>
    main {
        align-items: center;
        width: 100dvw;
    }
</style>