<script lang="ts">
    let {url, text} : {url: string, text:string} = $props();
</script>

<a href="{url}">{text}</a>

<style>
    a {
        background-color: #04AA6D; /* Green background */
    border: none; /* Remove default border */
    color: white; /* White text */
    padding: 15px 32px; /* Space inside button */
    text-align: center; /* Center text */
    text-decoration: none; /* Remove underline */
    display: inline-block;
    font-size: 16px;
    border-radius: 8px; /* Rounded corners */
    cursor: pointer; /* Pointer on hover */
    transition: background-color 0.3s ease; /* Smooth hover effect */
    }
a:hover {
background-color: #028a57; 
    }
</style>