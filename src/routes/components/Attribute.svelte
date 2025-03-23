<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { faDiceSix } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { rollDice } from '$lib/utils';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import RollDiceModal from './Modals/DiceRoll/index.svelte';
    import { fade } from 'svelte/transition';
    
    export let attribute: { name: string; value: number };
    export let isEditing: boolean;
  
    const dispatch = createEventDispatcher();
  
    let newValue = attribute.value;
    let showDiceModal = false;
    let showSkillRollModal = false;
  
    $: if (!isEditing) {
      newValue = attribute.value;
    }

    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];
  
    function updateValue() {
      if (isEditing) {
        dispatch('updateValue', { name: attribute.name.toLowerCase(), value: newValue });
      }
    }

    // Reactive variable with type assertion
    $: attributeKey = attribute.name.toLowerCase() as TranslationKeys;
  
    // Add a function to get the calculation method for each attribute
    function getCalculationMethod(): string {
      switch (attributeKey) {
        case 'str':
        case 'con':
        case 'dex':
        case 'app':
        case 'pow':
        case 'luck':
          return '3D6 × 5';
        case 'siz':
        case 'int':
        case 'edu':
          return '(2D6 + 6) × 5';
        default:
          return 'Custom calculation';
      }
    }

    // Get the dice configuration for the current attribute
    function getDiceConfig() {
      switch (attributeKey) {
        case 'str':
        case 'con':
        case 'dex':
        case 'app':
        case 'pow':
        case 'luck':
          return { dice: '3d6', multiply: 5, add: 0 };
        case 'siz':
        case 'int':
        case 'edu':
          return { dice: '2d6', multiply: 5, add: 30 }; // 30 is equivalent to (6 × 5)
        default:
          return { dice: '3d6', multiply: 5, add: 0 };
      }
    }

    function handleRoll(event: CustomEvent<{ total: number }>) {
      newValue = event.detail.total;
      updateValue();
      showDiceModal = false;
    }

    function handleSkillRoll(event: CustomEvent) {
      dispatch('diceRolled', { 
        attribute: attribute.name,
        value: attribute.value,
        ...event.detail
      });
    }

    function getRandomAttributeValue(): number {
      switch (attributeKey) {
        case 'str':
        case 'con':
        case 'dex':
        case 'app':
        case 'pow':
        case 'luck':
          return rollDice('3d6').total * 5;
        case 'siz':
        case 'int':
        case 'edu':
          return (rollDice("2d6").total + 6) * 5;
        default:
          return 0;
      }
    }

    export function rollRandomAndUpdate() {
      newValue = getRandomAttributeValue();
      updateValue();
    }

    function openDiceModal() {
      showDiceModal = true;
    }

    function openSkillRollModal() {
      showSkillRollModal = true;
    }

    $: diceConfig = getDiceConfig();
</script>
  
<div 
  in:fade={{ duration: 300 }}
  class="relative overflow-hidden bg-slate-800 border border-slate-700 backdrop-blur-sm rounded-lg shadow-lg"
>
  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400 opacity-80"></div>
  
  <div class="p-5">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          {t[attributeKey]}
        </h2>
      </div>
      
      {#if isEditing}
        <div class="flex items-center gap-2">
          <input 
            type="number" 
            bind:value={newValue} 
            on:change={updateValue}
            class="w-20 text-xl font-bold text-blue-300 bg-slate-700 border-b-2 border-blue-400 px-2 py-1 rounded-md" 
          />
          <span class="block text-xs text-slate-400 mt-1 italic">{getCalculationMethod()}</span>
        </div>
        
      {:else}
        <div class="text-3xl font-bold text-blue-300 relative">
          {attribute.value}
        </div>
      {/if}
    </div>
    
    <div class="flex justify-between items-center">
      <div class="bg-slate-700 rounded-md flex divide-x divide-slate-600">
        <div class="px-2 py-1 text-center">
          <p class="text-base font-medium text-blue-300">{Math.floor(attribute.value / 2)}</p>
        </div>
        <div class="px-2 py-1 text-center">
          <p class="text-base font-medium text-blue-300">{Math.floor(attribute.value / 5)}</p>
        </div>
      </div>
      
      {#if !isEditing}
        <button 
          on:click={openSkillRollModal}
          class="rounded-full h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center text-white"
        >
          <FontAwesomeIcon icon={faDiceSix} class="h-4 w-4" />
          <span class="sr-only">Roll 1d100 for {t[attributeKey]}</span>
        </button>
      {/if}
    </div>
  </div>
</div>

<!-- Modal for attribute generation dice rolls -->
<RollDiceModal 
  bind:showModal={showDiceModal}
  defaultDice={diceConfig.dice}
  multiplyResult={diceConfig.multiply}
  addToResult={diceConfig.add}
  on:close={() => showDiceModal = false}
  on:roll={handleRoll}
/>

<!-- Modal for skill check rolls -->
<RollDiceModal 
  bind:showModal={showSkillRollModal}
  defaultDice="1d100"
  multiplyResult={1}
  addToResult={0}
  skillValue={attribute.value}
  on:close={() => showSkillRollModal = false}
  on:roll={handleSkillRoll}
/>