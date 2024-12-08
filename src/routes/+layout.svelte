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

<nav class="navbar">
    <div class="navbar-content">
        <div class="language-container">
            <select bind:value={$languageStore} class="language-select">
                <option value="en">English</option>
                <option value="cn">中文</option>
            </select>
        </div>
        <div class="character-selector">
            <select 
              value={$currentCharacterIndex} 
              on:change={switchCharacter}
              class="character-select"
            >
              {#each $charactersStore as character, i}
                <option value={i}>{character.name}</option>
              {/each}
            </select>
            {#if $charactersStore.length > 0}
              <button 
                class="delete-button" 
                on:click={() => deleteCharacter($currentCharacterIndex)}
                title={t.deleteCharacter}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            {/if}
        </div>
        <div class="character-actions">
            <button class="action-button" on:click={createNewCharacter}>
                {t.createNewCharacter}
            </button>
            <label class="action-button" for="import-file">
                {t.importCharacter}
            </label>
            <input
                id="import-file"
                class="file-input"
                type="file"
                accept=".json"
                on:change={importCharacter}
            />
            <button class="action-button" on:click={exportCharacter}>
                {t.exportCharacter}
            </button>
        </div>
    </div>
</nav>

{#if showError}
  <div class="error-message">
    {errorMessage}
  </div>
{/if}

{#if showScrollButton}
  <button 
    class="scroll-to-top" 
    on:click={scrollToTop}
    aria-label="Scroll to top"
    transition:fade={{ duration: 300 }}
  >
    <FontAwesomeIcon icon={faArrowUp} />
  </button>
{/if}

<main>
  <slot />
</main>

<style>
  .navbar {
    background-color: #3a3a3a;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .navbar-content {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .language-container {
    flex: 0 1 auto;
  }

  .language-select {
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #4a4a4a;
    color: #f0f0f0;
    border: 1px solid #f0f0f0;
    cursor: pointer;
    width: 100px;
  }

  .character-selector {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 200px;
  }

  .character-select {
    flex: 1;
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #4a4a4a;
    color: #f0f0f0;
    border: 1px solid #f0f0f0;
    cursor: pointer;
  }

  .character-actions {
    flex: 1 1 auto;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .action-button {
    background-color: #4a4a4a;
    color: #f0f0f0;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    white-space: nowrap;
  }

  .delete-button {
    background-color: #cc0000;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
  }

  .file-input {
    display: none;
  }

  @media (max-width: 768px) {
    .navbar-content {
      flex-direction: column;
      align-items: stretch;
    }

    .language-container {
      order: 1;
    }

    .character-selector {
      order: 2;
      width: 100%;
    }

    .character-actions {
      order: 3;
      justify-content: center;
      width: 100%;
    }

    .language-select {
      width: 100%;
    }

    .action-button {
      flex: 1 1 auto;
      text-align: center;
      min-width: 120px;
    }
  }

  @media (max-width: 480px) {
    .character-actions {
      flex-direction: column;
    }

    .action-button {
      width: 100%;
    }

    .navbar {
      padding: 5px;
    }
  }

  .error-message {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #ff4444;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .scroll-to-top {
    position: fixed;
    bottom: 50px;
    right: 50px;
    background-color: #4a4a4a;
    color: #f0f0f0;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    font-size: 16px;
  }

  .scroll-to-top:hover {
    background-color: #666666;
  }

  @media (max-width: 768px) {
    .scroll-to-top {
      bottom: 50px;
      right: 50px;
    }
  }
</style>
