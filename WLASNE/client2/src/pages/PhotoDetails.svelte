<script lang="ts">
    import { onMount } from "svelte";
    import Card, { Actions, Content } from "@smui/card";
    import Button, { Icon, Label } from "@smui/button";
    import TextArea from "@smui/textfield";
    import TextField from "@smui/textfield";
    import Chip, { Set, Text } from '@smui/chips';
    import { getPhotoURL, getProfilePhotoURL, photoAPI, likeAPI, commentAPI, getUserID, type Photo } from "../api.svelte";
    import Comment from "../lib/Comment.svelte";
    import Dialog, { InitialFocus, Title } from "@smui/dialog";

    let { photoId }: { photoId: number } = $props();

    // State
    let photo: any= $state(null);
    let likeCount = $state(0);
    let commentCount = $state(0);
    let userLiked = $state(false);
    let tags: {id:number, name:string}[] = $state([]);
    let loading = $state(true);
    let error = $state("");

    // Comments
    let comments: any[] = $state([]);
    let commentPage = $state(1);
    let totalComments = $state(0);
    let commentInput = $state("");
    let postingComment = $state(false);

    let openDelDialog = $state(false);

    const COMMENTS_PER_PAGE = 5;

    onMount(async () => {
        try {
            loading = true;
            
            // Load photo details
            const photoData = await photoAPI.getPhoto(photoId);
            photo = photoData.photo;
            likeCount = photoData.likeCount;
            commentCount = photoData.commentCount;
            userLiked = photoData.userLiked;
            tags = photoData.tags;

            // Load comments
            await loadComments();

            loading = false;
        } catch (e) {
            console.error("Error loading photo:", e);
            error = "Nie udało się załadować zdjęcia";
            loading = false;
        }
    });

    async function loadComments() {
        try {
            const commentsData = await commentAPI.getComments(photoId, commentPage, COMMENTS_PER_PAGE);
            comments = commentsData.comments;
            totalComments = commentsData.total;
        } catch (e) {
            console.error("Error loading comments:", e);
        }
    }

    async function handleDelete() {
        try {
            await photoAPI.deletePhoto(photoId);
            window.location.hash = "#settings"
        } catch (e) {
            console.error("Errordeleting photo:", e);
        }
    }
    async function handleLike() {
        try {
            if (userLiked) {
                await likeAPI.unlikePhoto(photoId);
            } else {
                await likeAPI.likePhoto(photoId);
            }
            userLiked = !userLiked;
            likeCount = (await likeAPI.getCount(photoId)).count;
        } catch (e) {
            console.error("Error toggling like:", e);
        }
    }

    async function handlePostComment() {
        if (!commentInput.trim()) return;

        try {
            postingComment = true;
            await commentAPI.createComment(photoId, commentInput);
            commentInput = "";
            commentPage = 0; // Reset to first page
            await loadComments();
        } catch (e) {
            console.error("Error posting comment:", e);
        } finally {
            postingComment = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && event.ctrlKey) {
            handlePostComment();
        }
    }

    function canLoadMore() {
        return (commentPage + 1) * COMMENTS_PER_PAGE < totalComments;
    }

    async function loadMoreComments() {
        commentPage++;
        try {
            const commentsData = await commentAPI.getComments(photoId, commentPage, COMMENTS_PER_PAGE);
            comments = [...comments, ...commentsData.comments];
        } catch (e) {
            console.error("Error loading more comments:", e);
        }
    }
</script>


<Dialog
  bind:open={openDelDialog}
  aria-labelledby="default-focus-title"
  aria-describedby="default-focus-content"
>
  <Title id="default-focus-title">Wymagane potwierdzenie</Title>
  <Content id="default-focus-content">
    Czy na pewno chcesz usunąc to zdjęcie?
  </Content>
  <Actions>
    <Button onclick={handleDelete}>
      <Label>Tak</Label>
    </Button>
    <Button
      defaultAction
      use={[InitialFocus]}
      onclick={() => {
        openDelDialog = false;
      }}
    >
      <Label>Nie</Label>
    </Button>
  </Actions>
</Dialog>

{#if loading}
    <div class="center">
        <p>Ładowanie...</p>
    </div>
{:else if error}
    <div class="center error-message">
        <p>{error}</p>
    </div>
{:else if photo}
    <div class="page-container">
        <div class="photo-main-section">
            <Card padded>
                <div class="main-photo-wrapper">
                    <img 
                        class="main-photo" 
                        src={getPhotoURL(photo.user_id, photo.id)} 
                        alt={photo.description}
                    >
                </div>
            </Card>
        </div>

        <div class="details-grid">
            <Card padded class="left-column">
                <div class="hbox">
                    <a href="#profile?id={photo.user_id}">
                        <div class="vbox user-info" style="align-items: center;">
                            <img 
                                class="user-avatar" 
                                src={getProfilePhotoURL(photo.user_id)} 
                                alt="Zdjęcie użytkownika {photo.username}"
                            >
                            <div class="vpad"></div>
                            <div class="vbox user-details">
                                <h3 class="username">{photo.username}</h3>
                                <p class="description">{photo.description}</p>
                            </div>
                        </div>
                    </a>
                </div>
            </Card>

            <Card padded class="right-column">
                <div class="vbox action-container">
                    <div class="tags-section">
                        <h4>Tagi</h4>
                        <Set chips={tags} nonInteractive>
                            {#snippet chip(tag: {id:number, name:string})}
                                <Chip  {chip}>
                                    <Text>#{tag.name}</Text>
                                </Chip>
                            {/snippet}
                        </Set>
                    </div>
                    <div class="vpad-large"></div>
                    <div class="vbox" style="justify-content: space-between; width:100%;">

                        <Button 
                        variant="outlined" 
                        onclick={handleLike}
                        class="like-button"
                    > 
                        <Icon class="material-icons">
                            {userLiked ? "favorite" : "favorite_border"}
                        </Icon>
                        <Label>{likeCount} polubień</Label>
                    </Button>
                    {#if photo.user_id === getUserID()}
                    <Button 
                        variant="outlined" 
                        onclick={() => {openDelDialog = true;}}
                        class="like-button"
                    > 
                        <Icon class="material-icons">
                            delete
                        </Icon>
                        <Label>Usuń zdjęcie</Label>
                    </Button>
                    {/if}
                    </div>
                </div>
            </Card>
        </div>

        <div class="comments-section">
            <Card padded>
                <h3>Komentarze ({totalComments})</h3>

                {#if getUserID()}
                    <div class="comment-input-container">
                        <div class="vbox">
                            <img 
                                class="my-avatar" 
                                src={getProfilePhotoURL(getUserID())} 
                                alt="Twoje zdjęcie"
                            >
                            <div class="vpad"></div>
                            <div class="input-wrapper">
                                <TextField 
                                    type="text"
                                    bind:value={commentInput}
                                    onkeydown={handleKeydown}
                                    placeholder="Napisz komentarz..."
                                    style="width: 100%;"
                                />
                                <Button 
                                    onclick={handlePostComment}
                                    disabled={!commentInput.trim() || postingComment}
                                    class="send-button"
                                >
                                    <Icon class="material-icons">
                                        send
                                    </Icon>
                                </Button>
                            </div>
                        </div>
                    </div>
                {/if}

                <div class="comments-list">
                    {#if comments.length === 0}
                        <p class="no-comments">Brak komentarzy. Bądź pierwszy!</p>
                    {:else}
                        {#each comments as comment (comment.id)}
                            <Comment 
                                id={comment.id}
                                commenterId={comment.commenter_id}
                                comment={comment.comment}
                                username={comment.username}
                            />
                        {/each}
                    {/if}
                </div>

                {#if canLoadMore()}
                    <div class="load-more-container">
                        <Button 
                            onclick={loadMoreComments}
                            variant="outlined"
                        >
                            <Label>Załaduj więcej</Label>
                        </Button>
                    </div>
                {/if}
            </Card>
        </div>
    </div>
{/if}

<style>
    .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .photo-main-section {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .main-photo-wrapper {
        max-width: 600px;
        width: 100%;
    }

    .main-photo {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 8px;
    }

    .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
        .details-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }

    .left-column,
    .right-column {
        width: 100%;
    }

    .hbox {
        display: flex;
        flex-direction: column;
    }

    .vbox {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }

    .vpad {
        margin-left: 1rem;
    }

    .vpad-large {
        margin-top: 1rem;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    a:hover {
        text-decoration: underline;
    }

    .user-info {
        justify-content: flex-start;
    }

    .user-avatar {
        aspect-ratio: 1;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
    }

    .user-details {
        flex-direction: column;
        align-items: flex-start;
        flex: 1;
    }

    .username {
        margin: 0;
        font-size: 1.5rem;
    }

    .description {
        margin: 0.5rem 0 0 0;
        color: var(--on-surface-variant, #49454e);
        font-size: 0.95rem;
    }

    .action-container {
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }

    .tags-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .tags-section h4 {
        margin: 0 0 0.5rem 0;
    }

    .like-button {
        width: 100%;
    }

    .comments-section {
        width: 100%;
    }

    .comments-section h3 {
        margin-top: 0;
    }

    .comment-input-container {
        display: flex;
        padding: 1.5rem 0;
        border-bottom: 1px solid var(--surface-variant, #e0e0e0);
        margin-bottom: 1rem;
    }

    .my-avatar {
        aspect-ratio: 1;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
    }

    .input-wrapper {
        display: flex;
        flex: 1;
        gap: 0.5rem;
        align-items: center;
    }

    .send-button {
        flex-shrink: 0;
    }

    .comments-list {
        display: flex;
        flex-direction: column;
    }

    .no-comments {
        text-align: center;
        color: var(--on-surface-variant, #49454e);
        padding: 2rem 0;
        font-style: italic;
    }

    .load-more-container {
        display: flex;
        justify-content: center;
        padding-top: 1.5rem;
        border-top: 1px solid var(--surface-variant, #e0e0e0);
    }

    .center {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        width: 100%;
    }

    .error-message {
        padding: 1rem;
        background-color: rgba(179, 38, 30, 0.1);
        border: 1px solid var(--error, #b3261e);
        color: var(--error, #b3261e);
        font-size: 14px;
    }

    :global(.send-button .mdc-button__label) {
        padding: 0 !important;
    }
</style>