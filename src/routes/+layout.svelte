<script lang="ts">
  import { languageStore, characterStore, initializeCharacter } from '$lib/stores/characterStore';
  import { translations, type Language } from '$lib/i18n/translations';

  function changeLanguage(lang: string) {
    languageStore.set(lang as Language);
  }

  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];

  function createNewCharacter() {
    initializeCharacter();
  }

  async function importCharacter(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      initializeCharacter(jsonData); // Pass the JSON data to initializeCharacter
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
</script>

<nav class="navbar">
    <div class="language-container">
        <select bind:value={$languageStore} on:change={() => changeLanguage($languageStore)} class="language-select">
            <option value="en">English</option>
            <option value="cn">中文</option>
            <!-- Add more language options as needed -->
        </select>
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
</nav>
<main>
  <slot />
</main>

<style>
  .navbar {
    background-color: #3a3a3a;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .language-container {
    margin-right: auto; /* Aligns language select to the left */
  }

  .language-select {
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #4a4a4a;
    color: #f0f0f0;
    border: 1px solid #f0f0f0;
    cursor: pointer;
  }

  .language-select:hover {
    background-color: #5a5a5a;
  }

  .character-actions {
    display: flex;
    gap: 10px; /* Add gap between buttons */
  }

  .action-button {
    background-color: #4a4a4a;
    color: #f0f0f0;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease; /* Smooth transition for hover effect */
  }

  .action-button:hover {
    background-color: #5a5a5a;
  }

  .file-input {
    display: none;
  }
</style>
