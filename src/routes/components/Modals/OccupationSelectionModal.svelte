<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { translations} from '$lib/i18n/translations';
  import { languageStore } from '$lib/stores/languageStore';
  import occupationList from '$lib/occupation_list.json';
  
  $: currentLanguage = $languageStore;

  $: t = translations[currentLanguage];

  export let selectedOccupation: string = '';

  const dispatch = createEventDispatcher();

  const occupations = occupationList.occupations;

  let occupationModal: HTMLDialogElement | null = null;

  function openOccupationModal() {
    occupationModal?.showModal();
  }

  export function getLocalizedOccupation(occKey: string) {
    // Normalize the search key for English comparisons (case-insensitive)
    const searchKey = occKey.trim().toLowerCase();

    const occInfo = occupationList.occupations.find(occ => {
      return occ.name.en.trim().toLowerCase() === searchKey || occ.name.cn.trim() === occKey;
    });

    if (!occInfo) {
      return {
        name: { en: occKey, cn: '未知职业' },
        minimum_credit_rating: 0,
        maximum_credit_rating: 0,
        description: { en: '', cn: '' },
        attributes: [],
        skills: []
      };
    }

    // Return a clone of the occupation info to avoid direct mutations.
    return { ...occInfo };
  }
</script>

<div class="join items-center justify-between w-full h-11/12">
  {selectedOccupation}
  <button class="btn btn-primary h-full" on:click={openOccupationModal}>Select</button>
  <dialog id="my_modal_1" class="modal" bind:this={occupationModal}>
    <div class="modal-box">
      <h3 class="text-lg font-bold">Select a job</h3>
      <div class="join join-vertical w-full">
        {#each occupations as occupation}
          <div class="collapse collapse-arrow join-item border-base-300 border">
            <input type="radio" name="my-accordion-4" on:change={() => selectedOccupation = occupation.name[currentLanguage]} />
            <div class="collapse-title font-semibold">{occupation.name[currentLanguage]}</div>
            <div class="collapse-content bg-accent text-sm text-black">{occupation.description[currentLanguage]}</div>
          </div>
        {/each}
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</div>
