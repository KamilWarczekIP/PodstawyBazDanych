<script lang="ts">
    import { getProfilePhotoURL } from "../api.svelte";

    let { id, commenterId, comment, username } : 
    { id: number, commenterId: number, comment: string, username: string } 
    = $props();

    let srcUser = getProfilePhotoURL(commenterId);
</script>

<div class="comment-container">
    <div class="vbox">
        <a href="#profile?id={commenterId}">
            <img class="user-avatar" src="{srcUser}" alt="Zdjęcie użytkownika {username}">
        </a>
        <div class="vpad"></div>
        <div class="vbox comment-content">
            <div class="comment-header">
                <a href="#profile?id={commenterId}" class="username-link">
                    <strong>{username}</strong>
                </a>
            </div>
            <div class="comment-text">
                {comment}
            </div>
        </div>
    </div>
</div>

<style>
    .comment-container {
        padding: 1rem 0;
        border-bottom: 1px solid var(--surface-variant, #e0e0e0);
    }

    .vbox {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }

    .vpad {
        margin-left: 1rem;
    }

    .user-avatar {
        aspect-ratio: 1;
        height: 2.5rem;
        border-radius: 50%;
        object-fit: cover;
    }

    .comment-content {
        flex: 1;
        flex-direction: column;
    }

    .comment-header {
        margin-bottom: 0.25rem;
    }

    .username-link {
        text-decoration: none;
        color: var(--on-surface, #1c1b1f);
    }

    .username-link:hover {
        text-decoration: underline;
    }

    .comment-text {
        color: var(--on-surface, #1c1b1f);
        font-size: 0.95rem;
        line-height: 1.4;
        word-wrap: break-word;
    }

    a {
        text-decoration: none;
        color: inherit;
    }
</style>
