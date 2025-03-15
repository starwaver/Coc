<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { faDice } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { rollDice } from '$lib/utils';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import RollDiceModal from './Modals/RollDiceModal.svelte';
    
    export let attribute: { name: string; value: number };
    export let isEditing: boolean;
  
    const dispatch = createEventDispatcher();
  
    let newValue = attribute.value;
    let showDiceModal = false;
  
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

  $: diceConfig = getDiceConfig();
</script>
  
<div class="attribute">
  <span class="attribute-name">
    {t[attributeKey]}
  </span>
  {#if isEditing}
    <div class="input-group">
      <input 
        type="number" 
        bind:value={newValue} 
        on:change={updateValue}
        class="attribute-input" 
      />
      <button 
        class="attribute-button"
        on:click={() => showDiceModal = true}
      >
        <FontAwesomeIcon icon={faDice} />
      </button>
    </div>
    <span class="attribute-calculation">{getCalculationMethod()}</span>
  {:else}
    <span class="attribute-value">{attribute.value}</span>
  {/if}
  <div class="attribute-reference">
    <span class="attribute-half">{Math.floor(attribute.value / 2)}</span> | 
    <span class="attribute-fifth">{Math.floor(attribute.value / 5)}</span>
  </div>
</div>

<RollDiceModal 
  bind:showModal={showDiceModal}
  defaultDice={diceConfig.dice}
  multiplyResult={diceConfig.multiply}
  addToResult={diceConfig.add}
  on:close={() => showDiceModal = false}
  on:roll={handleRoll}
/>
  
<style>
  .attribute {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    background-color: #3a3a3a;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }
  
  .attribute-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .attribute-value {
    font-size: 1.2em;
    color: #00cc66;
  }
  
  .attribute-input {
    font-size: 1.2em;
    color: #00cc66;
    background-color: #2a2a2a;
    border: none;
    border-bottom: 2px solid #00cc66;
    margin-bottom: 0;
    padding: 5px;
    max-width: 100px;
  }

  .attribute-button {
    background-color: #00cc66;
    color: #fff;
    border: none;
    padding: 5px 10px;
    border-radius: 0px;
    cursor: pointer;
    font-size: 1em;
  }

  .attribute-button:hover {
    background-color: #00b359;
  }
  
  .attribute-reference {
    font-size: 0.9em;
    color: #cccccc;
    margin-top: 5px;
  }
  
  .attribute-calculation {
    font-size: 0.8em;
    color: #999;
    margin-top: 2px;
    font-style: italic;
  }

  .input-group {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 5px;
  }
</style>