<script lang="ts">
  import { characterStore, updateCharacterData } from '$lib/stores/characterStore';
  import { translations, type Language } from '$lib/i18n/translations';
  import { languageStore } from '$lib/stores/languageStore';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faMars, faVenus, faTransgender } from '@fortawesome/free-solid-svg-icons';
    
  export let currentLanguage: Language;

  $: t = translations[currentLanguage];

  let isEditingName = false;
  let editedName = '';
  let isEditingImage = false;
  let editedImageUrl = '';

  let isEditingDetails = false;
  let editedDetails = {
    age: '',
    gender: '',
    playerName: '',
    occupation: '',
    birthplace: '',
    residence: ''
  };

  function startEditingName() {
    editedName = $characterStore?.name ?? '';
    isEditingName = true;
  }

  function saveName() {
    characterStore.update(character => {
      if (character) {
        character.name = editedName;
        updateCharacterData(character);
      }
      return character;
    });
    isEditingName = false;
  }

  function cancelEditName() {
    isEditingName = false;
  }

  function startEditingImage() {
    editedImageUrl = $characterStore?.image ?? '';
    isEditingImage = true;
  }

  function saveImageUrl() {
    characterStore.update(character => {
      if (character) {
        character.image = editedImageUrl;
        updateCharacterData(character);
      }
      return character;
    });
    isEditingImage = false;
  }

  function cancelEditImage() {
    isEditingImage = false;
  }

  function startEditingDetails() {
    editedDetails = {
      age: $characterStore?.age?.toString() ?? '',
      gender: $characterStore?.gender ?? '',
      playerName: $characterStore?.playerName ?? '',
      occupation: $characterStore?.occupation ?? '',
      birthplace: $characterStore?.birthplace ?? '',
      residence: $characterStore?.residence ?? ''
    };
    isEditingDetails = true;
  }

  function saveDetails() {
    characterStore.update(character => {
      if (character) {
        character.age = parseInt(editedDetails.age) || 0;
        character.gender = editedDetails.gender;
        character.playerName = editedDetails.playerName;
        character.occupation = editedDetails.occupation;
        character.birthplace = editedDetails.birthplace;
        character.residence = editedDetails.residence;
        updateCharacterData(character);
      }
      return character;
    });
    isEditingDetails = false;
  }

  function cancelEditDetails() {
    isEditingDetails = false;
  }

  function getGenderIcon(gender: string) {
    switch (gender.toLowerCase()) {
      case 'male':
        return faMars;
      case 'female':
        return faVenus;
      default:
        return faTransgender;
    }
  }
</script>

<div class="character-header">
  <div class="character-info-container">
    <div class="character-portrait-name">
      <div class="character-portrait-container">
        <img src={$characterStore?.image ?? ''} alt="Character Portrait" class="character-portrait">
        {#if !isEditingImage}
          <button class="character-portrait-overlay" on:dblclick={startEditingImage}>
            <span class="upload-icon">🔗</span>
          </button>
        {/if}
      </div>
      {#if isEditingImage}
        <input
          type="text"
          bind:value={editedImageUrl}
          class="image-url-input"
          placeholder={t.enterImageUrl}
        />
        <div class="image-edit-buttons">
          <button class="image-edit-button" on:click={saveImageUrl}>
            {t.save}
          </button>
          <button class="image-edit-button cancel" on:click={cancelEditImage}>
            {t.cancel}
          </button>
        </div>
      {/if}
      <div class="name-container">
        {#if isEditingName}
          <input
            type="text"
            bind:value={editedName}
            class="name-input"
            on:blur={saveName}
            on:keydown={(e) => e.key === 'Enter' && saveName()}
            placeholder={t.enterCharacterName}
          />
        {:else}
          <h1 class="character-name" on:dblclick={startEditingName}>
            {$characterStore?.name ?? ''}
          </h1>
        {/if}
      </div>
    </div>
    <div class="character-details">
      <div class="details-header">
        <h3>{t.characterDetails}</h3>
        {#if isEditingDetails}
          <button class="edit-button" on:click={saveDetails}>{t.save}</button>
          <button class="edit-button cancel" on:click={cancelEditDetails}>{t.cancel}</button>
        {:else}
          <button class="edit-button" on:click={startEditingDetails}>{t.edit}</button>
        {/if}
      </div>
      {#if isEditingDetails}
        <div class="edit-details">
          <label>
            {t.age}: <input type="number" bind:value={editedDetails.age} min="0" max="120">
          </label>
          <label>
            {t.gender}: 
            <select bind:value={editedDetails.gender}>
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="other">{t.other}</option>
            </select>
          </label>
          <label>
            {t.playerName}: <input type="text" bind:value={editedDetails.playerName}>
          </label>
          <label>
            {t.occupation}: <input type="text" bind:value={editedDetails.occupation}>
          </label>
          <label>
            {t.birthplace}: <input type="text" bind:value={editedDetails.birthplace}>
          </label>
          <label>
            {t.residence}: <input type="text" bind:value={editedDetails.residence}>
          </label>
        </div>
      {:else}
        <p>{t.age}: {$characterStore?.age ?? ''}</p>
        <p>{t.gender}: <FontAwesomeIcon icon={getGenderIcon($characterStore?.gender ?? '')} /></p>
        <p>{t.playerName}: {$characterStore?.playerName ?? ''}</p>
        <p>{t.occupation}: {$characterStore?.occupation ?? ''}</p>
        <p>{t.birthplace}: {$characterStore?.birthplace ?? ''}</p>
        <p>{t.residence}: {$characterStore?.residence ?? ''}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .character-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
  }

  .character-info-container {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 800px;
    width: 100%;
  }

  .character-portrait-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 60px; /* Increased spacing */
  }

  .character-portrait-container {
    position: relative;
    width: 150px;
    height: 150px;
    margin-bottom: 20px;
  }

  .character-portrait {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid #f0f0f0;
    object-fit: cover;
  }

  .character-portrait-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    border: none;
    cursor: pointer;
    border-radius: 50%;
  }

  .character-name {
    font-size: 2.5em;
    margin: 15px 0 0 0; /* Adjusted margin */
    cursor: pointer;
    text-align: center;
    width: 100%; /* Ensure it takes full width of container */
    overflow-wrap: break-word; /* Allow long names to wrap */
  }

  .character-details {
    font-weight: bold;
    text-align: left; /* Align text to the left */
  }

  .character-details h3 {
    margin-right: 15px;
  }

  .character-details p {
    margin: 8px 0; /* Increased vertical spacing between details */
  }

  .name-container {
    width: 100%; /* Fixed width */
    height: 50px;
    margin: 0 auto; /* Center the container */
  }

  .name-input {
    font-size: 2.5em;
    width: 100%;
    text-align: center;
    padding: 5px;
    margin: 15px 0 0 0; /* Adjusted margin to match h1 */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
    box-sizing: border-box; /* Include padding and border in element's total width */
  }

  .details-header {
    display: flex;
    align-items: center;
  }

  .edit-button {
    background-color: #00cc66;
    color: #fff;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
  }

  .edit-button:hover {
    background-color: #00b359;
  }

  .edit-button.cancel {
    background-color: #cc0000;
    margin-left: 5px;
  }

  .edit-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .edit-details label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .edit-details input,
  .edit-details select {
    width: 60%;
    padding: 5px;
    border-radius: 3px;
    border: 1px solid #ccc;
    background-color: #2a2a2a;
    color: #fff;
  }
</style>
