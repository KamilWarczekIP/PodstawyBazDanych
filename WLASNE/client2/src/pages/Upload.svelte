<script lang="ts">
  import Button, { Icon, Label } from "@smui/button";
  import Card from "@smui/card";
  import Chip, { Set, Text } from "@smui/chips";
  import LinearProgress from '@smui/linear-progress';
  import Textfield from "@smui/textfield";
  import Cropper from 'svelte-easy-crop';
  import { API_URL } from "../api.svelte";

  let file: File | null = $state(null);
  let previewUrl = $state("");
  let isDragging = $state(false);
  let uploadProgress = $state(0);
  let uploading = $state(false);
  let errorMsg = $state("");
  let description: string = $state("");
  let converted: string | null = $state(null);
  let currentTag: string = $state("");
  let tagsList: string[] = $state([]);
  let crop = $state({ x: 0, y: 0 });
  let zoom = $state(1);
  let croppedAreaPixels: { x: number; y: number; width: number; height: number } | null = $state(null);

  function reset() {
    file = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = "";
    uploadProgress = 0;
    uploading = false;
    errorMsg = "";
    description = "";
    currentTag = "";
    tagsList = [];
    crop = { x: 0, y: 0 };
    zoom = 1;
    croppedAreaPixels = null;
  }

  function handleFile(selected: File | undefined) {
    try {
      if (!selected) return;

      if (!selected.type.startsWith("image/")) {
        errorMsg = "Proszę wybrać plik obrazu.";
        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      file = selected;
      previewUrl = URL.createObjectURL(selected);
      errorMsg = "";
      crop = { x: 0, y: 0 };
      zoom = 1;
      croppedAreaPixels = null;
    } catch (err) {
      console.error(err);
      errorMsg = "Błąd przetwarzania pliku.";
    }
  }

  function onFileInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const selected = target.files?.[0];
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
    const trimmed = currentTag.trim();
    if (trimmed !== "" && !tagsList.includes(trimmed) && tagsList.length < 5) {
      tagsList = [...tagsList, trimmed];
    }
    currentTag = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const selected = e.dataTransfer?.files?.[0];
    handleFile(selected);
  }

  function base64ToBlob(base64Data:string, contentType = '') {
    const byteCharacters = atob(base64Data.split(',')[1]); 
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
    byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
    }

  return new Blob(byteArrays, { type: contentType });
  };

  async function uploadImage() {
  
    if (!file) {
      errorMsg = "Brak pliku do przesłania";
      uploading = false;
      return;
    }

    if (!previewUrl || !croppedAreaPixels) {
      errorMsg = "Przyciąć zdjęcie do kwadratu przed przesłaniem.";
      uploading = false;
      return;
    }

    uploading = true;
    uploadProgress = 0;
    try {
      const image = new Image(croppedAreaPixels?.width  || 100,
              croppedAreaPixels?.height  || 100);
      image.crossOrigin = "anonymous";
      image.onerror = () => converted = null;
      
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      const url = URL.createObjectURL(file);
      image.onload = () => {
          URL.revokeObjectURL(url);
          new Promise<string| null>((resolve, reject) => {
            canvas.width = 800;
            canvas.height = 800;
            // canvas.style.visibility = "hidden";   
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(null)
              errorMsg = "Przeglądarka nie obsługuje obcinania zdjęć"
              return;
            }
            
            
            ctx.clearRect(0,0, 800,
              800)
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            console.log($state.snapshot(croppedAreaPixels))
            
            ctx.drawImage(
              image,
              croppedAreaPixels?.x  || 100,
              croppedAreaPixels?.y  || 100,
              croppedAreaPixels?.width  || 100,
              croppedAreaPixels?.height  || 100,
              0,
              0,
              800,
              800
            );
          
          resolve(canvas.toDataURL('image/jpeg', 1.0));

          }).then(val => {
            converted = val
            console.log(converted)
          if (converted == null) {
            errorMsg = "Nie udało się przygotować obrazu.";
            uploading = false;
            return;
          }

          document.body.removeChild(canvas);
      
          const form = new FormData();
          form.append("body", JSON.stringify({
            description,
            tags: tagsList,
          }));
          // document.getElementById("obr1").src = converted;
          form.append('photo_data', base64ToBlob(converted, "image/jpeg"), 'photo.jpg');
      
          let authToken = '';
          const loggedInInfo = localStorage.getItem("AUTH");
          if (loggedInInfo) {
            const auth = JSON.parse(loggedInInfo);
            authToken = auth.token || '';
          }
      
          const xhr = new XMLHttpRequest();
          xhr.open("POST", API_URL + "/photos", true);
          if (authToken) {
            xhr.setRequestHeader('Authorization', authToken);
          }
      
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              uploadProgress = Math.round((event.loaded / event.total) * 100);
            }
          };
      
          xhr.onload = () => {
            if (xhr.status === 201) {
              setTimeout(() => {
                reset();
              }, 1000);
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
          });
        
          
    };
    
    image.src = url;
  }catch(e)
  {
    reset();
    errorMsg = "Błąd sieci podczas przesyłania.";
  }
  }
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
  .dropzone {
    cursor: pointer;
    transition: 0.2s;
  }

  .dragging {
    border-color: #4a90e2;
    background: #eef6ff;
  }

  .crop-container {
    width: min(100%, 40rem);
    height: min(100vw, 40rem);
    max-height: 40rem;
    position: relative;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
  }

  .zoom-slider {
    width: 100%;
  }

  main {
    min-height: 100dvh;
    overflow-y: scroll;
    width: 100dvw;
    justify-content: center;
    align-items: center;
    padding-bottom: 10rem;
  }

  .upload-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 1200px;
  }

  .upload-row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .upload-row .content-area {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  @media (min-width: 900px) {
    .upload-row {
      flex-direction: row;
      align-items: flex-start;
    }

    .upload-row .content-area {
      width: 100%;
    }
  }
</style>
<img src="" id="obr1" alt="">
{#if errorMsg}
<h1 style="color: red;">{errorMsg}</h1>
{/if}

<main class="hbox">
  {#if previewUrl}
    <Card variant="raised" padded class="upload-layout" style="width: 90dvw; overflow-y:scroll;">
      <div class="upload-row">
        <div class="crop-container">
          <Cropper
            image={previewUrl}
            bind:crop
            bind:zoom
            aspect={1}
            cropShape="rect"
            showGrid={true}
            minZoom={1}
            maxZoom={3}
            on:cropcomplete={(e) => {
              croppedAreaPixels = e.detail.pixels;
            }}
          />
        </div>

        <div class="content-area">
          <Textfield
            type="text"
            bind:value={description}
            label="Opis"
            variant="outlined"
            style="width: 100%;"
          />

          <div class="hbox" style="flex-wrap: wrap; gap: 1rem; width: 100%;">
            <div style="flex: 1; min-width: 16rem;">
              <Textfield
                type="text"
                bind:value={currentTag}
                label="Tag"
                variant="outlined"
                style="width: 100%;"
              />
              <Button variant="outlined" onclick={addTag} disabled={uploading || currentTag.trim() === "" || tagsList.length >= 5}>
                <Label>Dodaj</Label>
                <Icon class="material-icons">add</Icon>
              </Button>
            </div>

            <div style="flex: 1; min-width: 16rem;">
              <Set chips={tagsList} nonInteractive>
                {#snippet chip(chip:string)}
                  <Chip {chip}>
                    <Text>#{chip}</Text>
                  </Chip>
                {/snippet}
              </Set>
            </div>
          </div>

          <Button variant="raised" onclick={uploadImage} disabled={uploading || description === ''}>
            <Label>Prześlij</Label>
            <Icon class="material-icons">upload</Icon>
          </Button>

          <LinearProgress {uploadProgress} {uploading} />
        </div>
      </div>
    </Card>
  {:else}
    <div
      class="dropzone"
      aria-label="Miejsce do upuszczania plików do przesłania"
      role="button"
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
      onclick={() => document.getElementById("file-input")?.click()}
    >
      <Card variant="raised" padded>
        <div class="hbox {isDragging ? 'dragging' : ''}" style="gap: 1rem; align-items: center; justify-content: center; padding: 2rem;">
          <svg style="cursor: pointer; width: 3rem; height: 3rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
            <path d="M7 9l5 -5l5 5" />
            <path d="M12 4l0 12" />
          </svg>
          <div class="vbox" style="gap: 0.75rem; align-items: center;">
            <Button variant="raised">
              <Label>Wybierz zdjęcie</Label>
            </Button>
            <Label>Lub upuść je w tym polu</Label>
          </div>
        </div>
      </Card>
    </div>
  {/if}
</main>

<input id="file-input" type="file" accept="image/*" onchange={onFileInput} hidden />
