<script lang="ts">
  import { characterStore } from '$lib/stores/characterStore';
  import { languageStore } from '$lib/stores/languageStore';
  import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
  import { HealthStatus, InsanityStatus } from '$lib/types';
  import { onMount } from 'svelte';
  
  // Current language and translations
  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];
  
  // Define the props
  export let label: string;
  export let value: number;     // Bindable current value
  export let max: number;       // Bindable max value
  export let icon: string;
  export let statusClass: string = '';
  export let barColor: string = 'bg-primary';
  export let onValueChange: ((newValue: number) => void) | null = null;  // Optional callback for additional side effects
  
  // Calculate percentage for progress bars
  $: percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  // Modal state
  let modalElement: HTMLDialogElement;
  let tempValue = value;
  let tempStatus: HealthStatus | InsanityStatus | null = null;
  
  // Watch for changes to value from parent
  $: tempValue = value; // Always keep in sync when not shown
  
  function openModal() {
    tempValue = value;
    // Set initial status based on current character state
    if (label === 'HP') {
      tempStatus = $characterStore?.derivedAttributes?.healthStatus ?? HealthStatus.Normal;
    } else if (label === 'SAN') {
      tempStatus = $characterStore?.derivedAttributes?.insanityStatus ?? InsanityStatus.Normal;
    } else {
      tempStatus = null; // MP doesn't have status
    }
    
    if (modalElement) {
      modalElement.showModal();
    }
  }
  
  function saveChanges() {
    // Update value
    if (tempValue !== value) {
      value = tempValue;
      if (onValueChange) onValueChange(value);
    }
    
    // Update status if applicable
    if (tempStatus !== null && $characterStore) {
      characterStore.update(character => {
        if (!character) return character;
        
        if (label === 'HP' && tempStatus !== character.derivedAttributes.healthStatus) {
          character.derivedAttributes.healthStatus = tempStatus as HealthStatus;
        } else if (label === 'SAN' && tempStatus !== character.derivedAttributes.insanityStatus) {
          character.derivedAttributes.insanityStatus = tempStatus as InsanityStatus;
        }
        
        return character;
      });
    }
    
    if (modalElement) {
      modalElement.close();
    }
  }
  
  function increment() {
    if (value < max) {
      value += 1;
      if (onValueChange) onValueChange(value);
    }
  }

  function decrement() {
    if (value > 0) {
      value -= 1;
      if (onValueChange) onValueChange(value);
    }
  }
  
  // Add keyboard support for the Modal
  function handleModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveChanges();
    }
  }
</script>

<div class="flex flex-col items-center">
  <div 
    class="flex items-center gap-1 cursor-pointer hover:bg-base-200 rounded transition-colors" 
    on:click={openModal}
    on:keydown={e => e.key === 'Enter' && openModal()}
    role="button"
    tabindex="0"
    aria-label="{t?.editStatLabel?.replace('{stat}', label) || `Edit ${label} value and status`}"
  >
    <img src={icon} alt={label} class="w-8 h-8" />
    <span class="text-base font-bold w-10 text-center {statusClass}">{value}/{max}</span>
  </div>
  
  <!-- Progress bar -->
  <div class="w-full h-1 bg-base-300 rounded-full my-2">
    <div 
      class="h-full rounded-full {barColor}" 
      style="width: {percentage}%;"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax={max}
      aria-label="{t?.progressBarLabel?.replace('{stat}', label) || `${label} progress`}"
    >
    </div>
  </div>
  
  <div class="flex items-center bg-base-200 rounded-md px-1 py-0.5 space-x-1">
    <button 
      on:click={decrement} 
      disabled={value <= 0} 
      class="text-base font-bold px-2 rounded hover:bg-base-300 active:bg-base-300 disabled:opacity-20"
      aria-label="{t?.decreaseLabel?.replace('{stat}', label) || `Decrease ${label}`}"
    >-</button>
    <span class="text-base-content/30">|</span>
    <button 
      on:click={increment} 
      disabled={value >= max} 
      class="text-base font-bold px-2 rounded hover:bg-base-300 active:bg-base-300 disabled:opacity-20"
      aria-label="{t?.increaseLabel?.replace('{stat}', label) || `Increase ${label}`}"
    >+</button>
  </div>
</div>

<!-- DaisyUI Modal -->
<dialog id="modal-{label}" class="modal modal-bottom sm:modal-middle" bind:this={modalElement}>
  <div class="modal-box">
    <h3 id="modal-title-{label}" class="font-bold text-lg mb-3">{t?.editStatTitle?.replace('{stat}', label) || `Edit ${label}`}</h3>
    
    <!-- Value input -->
    <div class="form-control mb-4">
      <label class="label" for="value-input-{label}">
        <span class="label-text">{t?.valueLabel || 'Value'}</span>
      </label>
      <div class="flex gap-2 items-center">
        <input 
          id="value-input-{label}"
          type="number" 
          bind:value={tempValue} 
          min="0" 
          max={max} 
          class="input input-bordered w-full" 
        />
        <span class="text-sm text-base-content/60">/ {max}</span>
      </div>
    </div>
    
    <!-- Status selection (if applicable) -->
    {#if label === 'HP'}
      <div class="form-control mb-4">
        <label class="label" for="status-select-{label}">
          <span class="label-text">{t?.healthStatusLabel || 'Health Status'}</span>
        </label>
        <select 
          id="status-select-{label}"
          class="select select-bordered w-full" 
          bind:value={tempStatus}
        >
          <option value={HealthStatus.Normal}>{t?.normal || 'Normal'}</option>
          <option value={HealthStatus.MajorWound}>{t?.majorWound || 'Major Wound'}</option>
          <option value={HealthStatus.Unconscious}>{t?.unconscious || 'Unconscious'}</option>
          <option value={HealthStatus.Dying}>{t?.dying || 'Dying'}</option>
          <option value={HealthStatus.Dead}>{t?.dead || 'Dead'}</option>
        </select>
      </div>
    {:else if label === 'SAN'}
      <div class="form-control mb-4">
        <label class="label" for="status-select-{label}">
          <span class="label-text">{t?.mentalStatusLabel || 'Mental Status'}</span>
        </label>
        <select 
          id="status-select-{label}"
          class="select select-bordered w-full" 
          bind:value={tempStatus}
        >
          <option value={InsanityStatus.Normal}>{t?.normal || 'Normal'}</option>
          <option value={InsanityStatus.TemporaryInsanity}>{t?.temporaryInsanity || 'Temporary Insanity'}</option>
          <option value={InsanityStatus.IndefiniteInsanity}>{t?.indefiniteInsanity || 'Indefinite Insanity'}</option>
        </select>
      </div>
    {/if}
    
    <div class="modal-action">
      <form method="dialog" class="flex gap-2" on:submit|preventDefault={saveChanges}>
        <button type="submit" class="btn btn-primary">{t?.save || 'Save'}</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button aria-label={`Close ${label} edit modal`}>
      {t?.close || 'close'}
    </button>
  </form>
</dialog>