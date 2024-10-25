<script lang="ts">
  import { characterStore } from '$lib/stores/characterStore';
  import { languageStore } from '$lib/stores/languageStore';
  import { translations } from '$lib/i18n/translations';
  import type { BackstoryType } from '$lib/types';

  export let isEditing = false;

  // Make t reactive to language changes
  $: t = translations[$languageStore];

  // Force re-render when language changes
  $: currentLanguage = $languageStore;

  function getTranslation(key: string): string {
    return t[key as keyof typeof t] || key;
  }

  // Create a reactive statement for backstory
  $: backstory = $characterStore?.backstory || {}

  let editedBackstory: Record<string, string> = {};

  // This function will only run when isEditing changes
  $: updateEditedBackstory(isEditing);

  function updateEditedBackstory(editing: boolean) {
    if (editing) {
      editedBackstory = JSON.parse(JSON.stringify(backstory));
    }
  }

  export function saveEdits() {
    characterStore.update(character => {
      if (character) {
        character.backstory = editedBackstory as BackstoryType;
      }
      return character;
    });
  }
</script>

<div class="backstory-container">
  {#key currentLanguage}
    {#if Object.keys(backstory).length > 0}
      {#each Object.entries(backstory) as [key, value]}
        <div class="backstory-item">
          <h3>{getTranslation(key)}</h3>
          {#if isEditing}
            <textarea
              bind:value={editedBackstory[key]}
              rows="3"
              placeholder={t.enterInformation}
            ></textarea>
          {:else}
            <p>{value || ''}</p>
          {/if}
        </div>
      {/each}
    {:else}
      <p>{t.loadingCharacterData}</p>
    {/if}
  {/key}
</div>

<style>
  .backstory-container {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    margin-bottom: 20px;
    padding: 10px;
    background-color: #3a3a3a;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  }

  .backstory-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .backstory-item h3 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #00cc66;
  }

  .backstory-item p {
    margin: 0;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
  }

  .backstory-item {
    width: 100%;
  }
</style>
