<script lang="ts">
    import { onMount } from "svelte";
    import {getPhotoURL, type Photo} from "../api.svelte";

let photo : Photo = $props()
let src = $state("")
onMount(() => {
    src = getPhotoURL(photo.owner_id, photo.id);
}) 
</script>

<a href="#photo?id={photo.id}">
    <div>
        <!-- <span class="desc">{photo.description}</span> -->
        <img {src} alt={photo.description}>
    </div>
</a>

<style>
    div:hover {
        transform: scale(1.2);
        filter: drop-shadow(10px 10px 5px grey);
    }
    div {
        position: relative;
        transition: all 0.1s ease-in-out;
    }
    img {
        aspect-ratio: 1;
        width: 10rem;
    }
    span.desc {
        position: absolute;
        bottom: 0rem;
        border-radius: 0.3rem 0.3rem 0% 0%;
        width: 10rem;
        overflow: hidden;
        display: flex;
        justify-content: center;
        background-color: rgb(22, 22, 22);
        filter: opacity(0.9);
        color: aliceblue;
    }

    
</style>


