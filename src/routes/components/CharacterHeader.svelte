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
</script>

<div class="flex justify-center items-center w-full m-6">
  <div class="flex flex-row justify-center items-center w-full max-w-4xl gap-4 align-middle">
    <div class="w-64 h-full">
        {#if isEditingImage}
          <input
            type="text"
            bind:value={editedImageUrl}
            class="input"
            placeholder={t.enterImageUrl}
          />
          <div class="flex justify-between w-full mt-6">
            <button class="btn btn-primary btn-sm" on:click={saveImageUrl}>
              {t.save}
            </button>
            <button class="btn btn-secondary btn-sm" on:click={cancelEditImage}>
              {t.cancel}
            </button>
          </div>
        {:else}
        <button class="inline-block" on:dblclick={startEditingImage}>
          <div class="avatar">
            <div class="ring-primary ring-offset-base-100 w-64 rounded-full ring ring-offset-2">
              <img src={$characterStore?.image ?? ''} alt="Character Portrait"/>
            </div>
          </div>
        </button>
        {/if}
    </div>
    <div class="join-vertical">
      <table class="table-fixed">
        <tbody>
          <tr class="align-top">
            <td class="w-40">{t.characterDetails}</td>
            <td class="w-40 h-12"> 
              {#if !isEditingDetails}
                <button class="btn btn-primary btn-sm" on:click={startEditingDetails}>{t.edit}</button>
              {:else}
                <div class="w-full h-full flex flex-row justify-between">
                  <button class="btn btn-primary btn-sm" on:click={saveDetails}>{t.save}</button>
                  <button class="btn btn-secondary btn-sm" on:click={cancelEditDetails}>{t.cancel}</button>
                </div>
              {/if}
            </td>
          </tr>

          <tr class="h-8">
            <td>{t.name}:</td>
            <td>
              {#if isEditingDetails}
                <input class="input h-11/12 w-full" type="text" bind:value={editedDetails.name}>
              {:else}
                {$characterStore?.name ?? ''}
              {/if}
            </td>
          </tr>
          
          <tr class="h-8">
            <td>{t.age}:</td>
            <td>
              {#if isEditingDetails}
                <input class="input h-11/12 w-full" type="number" bind:value={editedDetails.age} min=0>
              {:else}
                {$characterStore?.age ?? ''}
              {/if}
            </td>
          </tr>
          
          <tr class="h-8">
            <td>{t.gender}:</td>
            <td>
              {#if isEditingDetails}
                <select class="select w-full h-11/12" bind:value={editedDetails.gender}>
                  <option value={t.male}>{t.male}</option>
                  <option value={t.female}>{t.female}</option>
                  <option value={t.other}>{t.other}</option>
                </select>
              {:else}
                {$characterStore?.gender ?? ''}
              {/if}
            </td>
          </tr>

          <tr class="h-8">
            <td>{t.playerName}:</td>
            <td>
              {#if isEditingDetails}
                <input class="input w-full h-11/12" type="text" bind:value={editedDetails.playerName}>
              {:else}
                {$characterStore?.playerName ?? ''}
              {/if}
            </td>
          </tr>

          <tr class="h-8">
            <td>{t.occupation}:</td>
            <td>
              {#if isEditingDetails}
                
                <!-- <div class="join items-center justify-between w-full h-11/12">
                  {editedDetails.occupation}
                  <button class="btn btn-primary h-full" on:click={openOccupationModal}>{t.select}</button>
                  <dialog id="my_modal_1" class="modal" bind:this={occupationModal}>
                    <div class="modal-box">
                      <h3 class="text-lg font-bold">Select a job</h3>
                      <div class="join join-vertical w-full">
                        <div class="collapse collapse-arrow join-item border-base-300 border">
                          <input type="radio" name="my-accordion-4" on:change={() => editedDetails.occupation = "Lawyer"} />
                          <div class="collapse-title font-semibold">Lawyer</div>
                          <div class="collapse-content text-sm">This is the job of a lawyer.</div>
                        </div>
                        <div class="collapse collapse-arrow join-item border-base-300 border">
                          <input type="radio" name="my-accordion-4" on:change={() => editedDetails.occupation = "Educator"} />
                          <div class="collapse-title font-semibold">Educator</div>
                          <div class="collapse-content text-sm">This is the job of an educator.</div>
                        </div>
                        <div class="collapse collapse-arrow join-item border-base-300 border">
                          <input type="radio" name="my-accordion-4" on:change={() => editedDetails.occupation = "Accountant"} />
                          <div class="collapse-title font-semibold">Accountant</div>
                          <div class="collapse-content text-sm">This is the job of an accountant</div>
                        </div>
                        <div class="collapse collapse-arrow join-item border-base-300 border">
                          <input type="radio" name="my-accordion-4" on:change={() => editedDetails.occupation = "Enter an occupation"} />
                          <div class="collapse-title font-semibold">Accountant</div>
                          <input class="input w-full h-11/12" type="text" bind:value={editedDetails.occupation}>
                        </div>
                      </div>
                      <div class="modal-action">
                        <form method="dialog">
                          <button class="btn btn-primary">Confirm</button>
                        </form>
                      </div>
                    </div>
                  </dialog>
                </div> -->
                <OccupationSelectionModal bind:selectedOccupation={editedDetails.occupation}></OccupationSelectionModal>
              {:else}
                {$characterStore?.occupation ?? ''}
              {/if}
            </td>
          </tr>

          <tr class="h-8">
            <td>{t.birthplace}:</td>
            <td>
              {#if isEditingDetails}
                <input class="input w-full h-11/12" type="text" bind:value={editedDetails.birthplace}>
              {:else}
                {$characterStore?.birthplace ?? ''}
              {/if}
            </td>
          </tr>

          <tr class="h-8">
            <td>{t.residence}:</td>
            <td>
              {#if isEditingDetails}
                <input class="input w-full h-11/12" type="text" bind:value={editedDetails.residence}>
              {:else}
                {$characterStore?.residence ?? ''}
              {/if}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
</style>
