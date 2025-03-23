<script lang="ts">
  import { characterStore, updateCharacterData } from '$lib/stores/characterStore';
  import { translations} from '$lib/i18n/translations';
  import { languageStore } from '$lib/stores/languageStore';
  import OccupationSelectionModal from './Modals/OccupationSelectionModal.svelte';
    
  $: currentLanguage = $languageStore;

  $: t = translations[currentLanguage];

  let isEditingName = false;
  let editedName = '';
  let isEditingImage = false;
  let editedImageUrl = '';

  let isEditingDetails = false;
  let editedDetails = {
    name: '',
    age: '',
    gender: '',
    playerName: '',
    occupation: '',
    birthplace: '',
    residence: ''
  };

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
      name: $characterStore?.name ?? '',
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
        character.name = editedDetails.name || t.placeholderCharacterName;
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

  let occupationModal: HTMLDialogElement | null = null;

  function openOccupationModal() {
    occupationModal?.showModal();
  }

  function handleOccupationUpdate(event: CustomEvent<{ occupation: string }>) {
    editedDetails.occupation = event.detail.occupation;
  }

  function closeOccupationModal() {
    occupationModal?.close();
  }

  let isOccupationModalOpen = false;
</script>

<div class="hero min-h-[600px] bg-base-200 rounded-box shadow-xl m-2 sm:m-6">
  <div class="hero-content flex-col lg:flex-row gap-8 p-4 sm:p-8">
    <!-- Character Image Section -->
    <div class="w-48 sm:w-64 h-full">
      {#if isEditingImage}
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="form-control w-full">
              <label class="label" for="character-image-url">
                <span class="label-text font-medium">{t.enterImageUrl}</span>
              </label>
              <input
                id="character-image-url"
                type="text"
                bind:value={editedImageUrl}
                class="input input-bordered w-full"
                placeholder="https://example.com/image.jpg"
              />
              <div class="flex justify-between w-full mt-4">
                <button class="btn btn-primary btn-sm" on:click={saveImageUrl}>
                  {t.save}
                </button>
                <button class="btn btn-ghost btn-sm" on:click={cancelEditImage}>
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <button class="group" on:dblclick={startEditingImage}>
          <div class="avatar">
            <div class="w-48 sm:w-64 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 transition-all duration-300 group-hover:ring-offset-4">
              <img 
                src={$characterStore?.image ?? ''} 
                alt={`${$characterStore?.name || t.placeholderCharacterName} ${t.characterPortrait}`} 
                class="object-cover"
              />
            </div>
          </div>
          <div class="tooltip tooltip-bottom absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-base-300 text-base-content text-xs px-2 py-1 rounded-full">
            {t.doubleClickToEdit}
          </div>
        </button>
      {/if}
    </div>

    <!-- Character Details Section -->
    <div class="w-full max-w-2xl">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="card-title text-2xl font-bold">{t.characterDetails}</h2>
              <p class="text-base-content/70">{t.editCharacterInformation}</p>
            </div>
            {#if !isEditingDetails}
              <button class="btn btn-primary" on:click={startEditingDetails} aria-label={t.edit}>
                <i class="fa-solid fa-pen-to-square mr-2"></i>
                {t.edit}
              </button>
            {:else}
              <div class="flex gap-2">
                <button class="btn btn-primary" on:click={saveDetails} aria-label={t.save}>
                  <i class="fa-solid fa-check mr-2"></i>
                  {t.save}
                </button>
                <button class="btn btn-ghost" on:click={cancelEditDetails} aria-label={t.cancel}>
                  <i class="fa-solid fa-xmark mr-2"></i>
                  {t.cancel}
                </button>
              </div>
            {/if}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="character-name">
                <span class="label-text font-medium">{t.name}</span>
              </label>
              {#if isEditingDetails}
                <input id="character-name" class="input input-bordered" type="text" bind:value={editedDetails.name}>
              {:else}
                <div class="input input-bordered bg-base-200">{$characterStore?.name ?? ''}</div>
              {/if}
            </div>

            <div class="form-control">
              <label class="label" for="character-age">
                <span class="label-text font-medium">{t.age}</span>
              </label>
              {#if isEditingDetails}
                <input id="character-age" class="input input-bordered" type="number" bind:value={editedDetails.age} min=0>
              {:else}
                <div class="input input-bordered bg-base-200">{$characterStore?.age ?? ''}</div>
              {/if}
            </div>

            <div class="form-control">
              <label class="label" for="character-gender">
                <span class="label-text font-medium">{t.gender}</span>
              </label>
              {#if isEditingDetails}
                <select id="character-gender" class="select select-bordered w-full" bind:value={editedDetails.gender}>
                  <option value={t.male}>{t.male}</option>
                  <option value={t.female}>{t.female}</option>
                  <option value={t.other}>{t.other}</option>
                </select>
              {:else}
                <div class="input input-bordered bg-base-200">{$characterStore?.gender ?? ''}</div>
              {/if}
            </div>

            <div class="form-control">
              <label class="label" for="character-player-name">
                <span class="label-text font-medium">{t.playerName}</span>
              </label>
              {#if isEditingDetails}
                <input id="character-player-name" class="input input-bordered" type="text" bind:value={editedDetails.playerName}>
              {:else}
                <div class="input input-bordered bg-base-200">{$characterStore?.playerName ?? ''}</div>
              {/if}
            </div>

            <div class="form-control md:col-span-2">
              <label class="label" for="character-occupation">
                <span class="label-text font-medium">{t.occupation}</span>
              </label>
              {#if isEditingDetails}
                <div class="flex items-center gap-2">
                  <input 
                    id="character-occupation"
                    type="text" 
                    class="input input-bordered w-full focus:input-primary" 
                    value={editedDetails.occupation || t.occupation}
                    readonly 
                  />
                  <button 
                    class="btn btn-primary" 
                    on:click={() => isOccupationModalOpen = true}
                  >
                    <i class="fa-solid fa-user-plus mr-1"></i>
                    {t.select}
                  </button>
                </div>
                <OccupationSelectionModal 
                  bind:selectedOccupation={editedDetails.occupation}
                  bind:isOpen={isOccupationModalOpen}
                  on:select={({ detail }) => editedDetails.occupation = detail.occupation}
                />
              {:else}
                <div class="input input-bordered bg-base-200">{$characterStore?.occupation ?? ''}</div>
              {/if}
            </div>

            <div class="form-control md:col-span-2">
              <label class="label" for="character-birthplace">
                <span class="label-text font-medium">{t.birthplace}</span>
              </label>
              {#if isEditingDetails}
                <input id="character-birthplace" class="input input-bordered" type="text" bind:value={editedDetails.birthplace}>
              {:else}
                <div class="input input-bordered bg-base-200">{$characterStore?.birthplace ?? ''}</div>
              {/if}
            </div>

            <div class="form-control md:col-span-2">
              <label class="label" for="character-residence">
                <span class="label-text font-medium">{t.residence}</span>
              </label>
              {#if isEditingDetails}
                <input id="character-residence" class="input input-bordered" type="text" bind:value={editedDetails.residence}>
              {:else}
                <div class="input input-bordered bg-base-200">{$characterStore?.residence ?? ''}</div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
