<script lang="ts">
    import Button from "./Button.svelte";
</script>

<header>
    <h1>Photo Sharing</h1>
    <nav>
        <Button url="/upload" text="Prześlij zdjęcie"/>
        <Button url="/home" text="Strona Gówna"/>
        <Button url="/search" text="Szukaj"/>
        <Button url="/settings" text="Ustawienia"/>
    </nav>
</header>

<style>
    header {
        width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
</style>