<script lang="ts">
    import Button, { Icon, Label } from "@smui/button";
    import Card from "@smui/card";
    import Chip, { Set, Text } from "@smui/chips";
    
  import LinearProgress from '@smui/linear-progress';
    import Textfield, { Input } from "@smui/textfield";
    import HelperText from "@smui/textfield/helper-text";
    import { API_URL } from "../api.svelte";


  let file:File|null = $state(null);
  let previewUrl = $state("");
  let isDragging = $state(false);
  let uploadProgress = $state(0);
  let uploading = $state(false);
  let errorMsg = $state("");
  let description: string = $state("");
  let currentTag: string = $state("");
  let tagsList: string[] = $state([]);

  function reset() {
    file = null;
    previewUrl = "";
    uploadProgress = 0;
    uploading = false;
    errorMsg = "";
  }

  function handleFile(selected: File) {
    try {
      if (!selected) return;

      if (!selected.type.startsWith("image/")) {
        errorMsg = "Please select an image file.";
        return;
      }

      file = selected;
      previewUrl = URL.createObjectURL(selected);
      errorMsg = "";
    } catch (err) {
      console.error(err);
      errorMsg = "Error processing file.";
    }
  }

  function onFileInput(e:any) {
    const selected = e.target.files?.[0];
    handleFile(selected);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function onDragLeave() {
    isDragging = false;
  }
   function addTag() {
    if(tagsList.find((s) => {return s == currentTag}) == undefined)
        if(currentTag !== "")
            tagsList.push(currentTag);
    currentTag = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;

    const selected = e.dataTransfer?.files?.[0];
    if(selected == null)
        return;
    handleFile(selected);
  }

  function uploadImage() {
    if (!file) {
      errorMsg = "Brak pliku do przesłania";
      return;
    }

    uploading = true;
    uploadProgress = 0;

    const form = new FormData();
    form.append("body", JSON.stringify({
        description: description,
        tags: tagsList
    }));
    form.append('photo_data', file, "img.jpg");

    let auth;
    let loggedInInfo = localStorage.getItem("AUTH");
    if(loggedInInfo != null) {
        auth = JSON.parse(loggedInInfo);
    }

    const xhr = new XMLHttpRequest();

    xhr.open("POST", API_URL + "/photos", true);

    xhr.setRequestHeader('Authorization', auth.token);

    // Update progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        uploadProgress = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201) {
        setTimeout(() => {
            reset();
        }, 2000)
      } else {
        errorMsg = "Przesyłanie zdjęcia nie powiodło się.";
        uploading = false;
      }
    };

    xhr.onerror = () => {
      uploading = false;
      errorMsg = "Błąd sieci podczas przesyłania.";
    };
    xhr.send(form);
  }
</script>

<style>
  .dropzone {
    cursor: pointer;
    transition: 0.2s;
  }
  .dragging {
    border-color: #4a90e2;
    background: #eef6ff;
  }
  .preview {
    width: clamp(10rem, 100%, 40rem);
    border-radius: 6px;
    aspect-ratio: 1;
  }
    main {
    height: 100dvh;
    width: 100dvw;
    justify-content: center;
    align-items: center;
}
</style>


{#if errorMsg}
<p style="color: red">{errorMsg}</p>
{/if}



  
  
  <main class="hbox">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    {#if previewUrl}
    <Card variant="raised" padded>
        <div class="{ window.innerWidth > 700 ? 'vbox' : 'hbox'}" style="align-items: center;">
            <img class="preview" src={previewUrl} alt="Preview" />
            <div class="hpad"></div>
            <div class="hbox" style="align-items: center; justify-content:center; width: 100%; gap:2rem;">
                <Textfield
                    type="text"
                    bind:value ={description}
                    label="Opis"
                    variant="outlined"
                    style="width: 80%;"
                >
                </Textfield>
                <div class="hbox">
                        <Set chips={tagsList} nonInteractive>
                        {#snippet chip(chip:string)}
                            <Chip {chip}>
                            <Text>#{chip}</Text>
                            </Chip>
                        {/snippet}
                        </Set>
                </div>
                <div class="vbox" style="gap:1rem; justify-content: center; align-items:center;">

                    <Textfield
                    type="text"
                    bind:value ={currentTag}
                    label="Tag"
                    variant="outlined">
                </Textfield>
                <Button variant="outlined" onclick={addTag} disabled={uploading || currentTag == "" || tagsList.length > 3}>
                    <Label>
                        Dodaj
                    </Label>
                    <Icon class="material-icons">
                        add
                    </Icon>
                </Button>
            </div>
                
                <Button variant="raised" onclick={uploadImage} disabled={uploading}>
                    <Label>
                        Prześlij
                    </Label>
                    <Icon class="material-icons">
                        upload
                    </Icon>
                </Button>
            </div>
        </div>
        <div class="hpad"></div>
        <LinearProgress {uploadProgress} {uploading} />
    </Card>
     {:else}
     <div
       class="dropzone}"
       aria-label="Miejsce do upuszcznaia plików do przesłania"
       role="form"
       ondragover={onDragOver}
       ondragleave={onDragLeave}
       ondrop={onDrop}
       onclick={() => document.getElementById("file-input")?.click()}
     >
       <Card variant="raised" padded>
       <div class="hbox {isDragging ? 'dragging' : ''}">

        <svg style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-upload"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>
        <Button variant="raised">
            <Label>Wybierz zdjęcie do przesłania</Label>    
        </Button>
        <Label>Lub upuść je w tym polu</Label>
    </div>
       </Card>
     </div>
     {/if}
</main>
<input id="file-input" type="file" accept="image/*" onchange={onFileInput} hidden />