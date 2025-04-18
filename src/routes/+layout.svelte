<script lang="ts">
  import { onMount } from 'svelte';
  import { characterStore, initializeCharacter, clearCharacterStorage } from '$lib/stores/characterStore';
  import { charactersStore, currentCharacterIndex, loadCharacters, removeCharacter, StorageError, MAX_CHARACTERS } from '$lib/stores/multiCharacterStore';
  import { languageStore } from '$lib/stores/languageStore';
  import { translations, type Language } from '$lib/i18n/translations';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faTrash, faArrowUp } from '@fortawesome/free-solid-svg-icons';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';
  import "../app.css";

  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];

  let errorMessage = '';
  let showError = false;
  let showScrollButton = false;
  let scrollTimeout: ReturnType<typeof setTimeout>;

  onMount(() => {
    loadCharacters();
    if ($charactersStore.length === 0) {
      initializeCharacter();
    } else {
      characterStore.set($charactersStore[$currentCharacterIndex]);
    }

    if (browser) {
      window.addEventListener('scroll', () => {
        // Clear any existing timeout
        clearTimeout(scrollTimeout);
        
        // Show the button
        showScrollButton = window.scrollY > 200;
        
        // Set timeout to hide the button after 1 second
        scrollTimeout = setTimeout(() => {
          showScrollButton = false;
        }, 1000);
      });
    }
  });

  function switchCharacter(event: Event) {
    const select = event.target as HTMLSelectElement;
    const index = parseInt(select.value);
    currentCharacterIndex.set(index);
    characterStore.set($charactersStore[index]);
  }

  function createNewCharacter() {
    try {
      if ($charactersStore.length >= MAX_CHARACTERS) {
        throw new StorageError('Maximum character limit reached. Please delete some characters first.');
      }
      
      if (confirm(t.confirmNewCharacter)) {
        initializeCharacter(undefined, true);
        const newIndex = $charactersStore.length - 1;
        currentCharacterIndex.set(newIndex);
        characterStore.set($charactersStore[newIndex]);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        errorMessage = error.message;
        showError = true;
        setTimeout(() => showError = false, 5000); // Hide after 5 seconds
      }
      console.error('Error creating character:', error);
    }
  }

  function deleteCharacter(index: number) {
    if (confirm(t.confirmDeleteCharacter)) {
      try {
        removeCharacter(index);
        if ($charactersStore.length > 0) {
          const newIndex = Math.min(index, $charactersStore.length - 1);
          currentCharacterIndex.set(newIndex);
          characterStore.set($charactersStore[newIndex]);
        } else {
          // If no characters remain, create a new one
          initializeCharacter(undefined, true);
          currentCharacterIndex.set(0);
          characterStore.set($charactersStore[0]);
        }
      } catch (error) {
        errorMessage = error instanceof StorageError ? error.message : 'Failed to delete character';
        showError = true;
        setTimeout(() => showError = false, 5000);
      }
    }
  }

  async function importCharacter(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        initializeCharacter(jsonData);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
      }
    }
  }

  function exportCharacter() {
    if ($characterStore) {
      const jsonString = JSON.stringify($characterStore, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${$characterStore.name || 'character'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</svelte:head>

<div class="drawer">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- Navbar -->
    <nav class="bg-neutral text-neutral-content p-3 w-full">
      <div class="container mx-auto flex flex-wrap gap-3 justify-between items-center">
        <!-- Burger menu button for mobile -->
        <div class="flex-none md:hidden">
          <label for="my-drawer" class="btn btn-square btn-ghost drawer-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        </div>

        <!-- Language selector - always visible -->
        <div class="flex-none">
          <select bind:value={$languageStore} class="select select-bordered select-sm">
            <option value="en">English</option>
            <option value="cn">中文</option>
          </select>
        </div>
        
        <!-- Character selector - hidden on mobile -->
        <div class="hidden md:flex flex-1 items-center gap-2 min-w-[200px]">
          <select 
            value={$currentCharacterIndex} 
            on:change={switchCharacter}
            class="select select-bordered w-full"
          >
            {#each $charactersStore as character, i}
              <option value={i}>{character.name}</option>
            {/each}
          </select>
          
          {#if $charactersStore.length > 0}
            <button 
              class="btn btn-error btn-sm" 
              on:click={() => deleteCharacter($currentCharacterIndex)}
              title={t.deleteCharacter}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          {/if}
        </div>
        
        <!-- Action buttons - hidden on mobile -->
        <div class="hidden md:flex md:flex-wrap gap-2 justify-end">
          <button class="btn btn-primary btn-sm" on:click={createNewCharacter}>
            {t.createNewCharacter}
          </button>
          
          <label class="btn btn-primary btn-sm" for="import-file">
            {t.importCharacter}
          </label>
          <input
            id="import-file"
            class="hidden"
            type="file"
            accept=".json"
            on:change={importCharacter}
          />
          
          <button class="btn btn-primary btn-sm" on:click={exportCharacter}>
            {t.exportCharacter}
          </button>
        </div>
      </div>
    </nav>

    {#if showError}
      <div class="toast toast-top toast-end z-50">
        <div class="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      </div>
    {/if}

    {#if showScrollButton}
      <button 
        class="btn btn-circle fixed bottom-12 right-12 z-50 bg-neutral text-neutral-content shadow-lg"
        on:click={scrollToTop}
        aria-label="Scroll to top"
        transition:fade={{ duration: 300 }}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    {/if}

    <main class="container mx-auto p-4">
      <slot />
    </main>
  </div>

  <!-- Drawer side for mobile menu -->
  <div class="drawer-side z-40">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <div class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
      <!-- Sidebar content -->
      <div class="mb-4 font-bold text-lg">{t.menu}</div>
      
      <!-- Character selector for mobile -->
      <div class="mb-6">
        <div class="font-medium mb-2">{t.selectCharacter}</div>
        <div class="flex flex-col gap-2">
          <select 
            value={$currentCharacterIndex} 
            on:change={switchCharacter}
            class="select select-bordered w-full"
          >
            {#each $charactersStore as character, i}
              <option value={i}>{character.name}</option>
            {/each}
          </select>
          
          {#if $charactersStore.length > 0}
            <button 
              class="btn btn-error btn-sm w-full" 
              on:click={() => deleteCharacter($currentCharacterIndex)}
            >
              <FontAwesomeIcon icon={faTrash} class="mr-2" />
              {t.deleteCharacter}
            </button>
          {/if}
        </div>
      </div>
      
      <!-- Actions for mobile -->
      <div class="flex flex-col gap-2">
        <button class="btn btn-primary w-full" on:click={createNewCharacter}>
          {t.createNewCharacter}
        </button>
        
        <label class="btn btn-primary w-full" for="import-file-mobile">
          {t.importCharacter}
        </label>
        <input
          id="import-file-mobile"
          class="hidden"
          type="file"
          accept=".json"
          on:change={importCharacter}
        />
        
        <button class="btn btn-primary w-full" on:click={exportCharacter}>
          {t.exportCharacter}
        </button>
      </div>
    </div>
  </div>
</div>
