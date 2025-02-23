<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { faDice } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { gaussianRandom, clamp } from '$lib/utils';
    export let attribute: { name: string; value: number };
    export let isEditing: boolean;
  
    const dispatch = createEventDispatcher();
  
    let newValue = attribute.value;
  
    $: if (!isEditing) {
      newValue = attribute.value;
    }
  
    function updateValue() {
      if (isEditing) {
        dispatch('updateValue', { name: attribute.name.toLowerCase(), value: newValue });
      }
    }
  
    // Add a function to get the calculation method for each attribute
    function getCalculationMethod(attributeName: string): string {
      switch (attributeName.toLowerCase()) {
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

  function getRandomAttributeValue(): number {
    switch (attribute.name.toLowerCase()) {
      case 'str':
      case 'con':
      case 'dex':
      case 'app':
      case 'pow':
      case 'luck':
        return clamp(Math.round(gaussianRandom((90+15)/2, 25) / 5) * 5, 15, 90);
      case 'siz':
      case 'int':
      case 'edu':
        return clamp(Math.round(gaussianRandom((90+40)/2, 20) / 5) * 5, 40, 90);
      default:
        return 0;
    }
  }

  export function rollRandomAndUpdate() {
    newValue = getRandomAttributeValue();
    updateValue();
  }
</script>
  
<div class="attribute">
  <span class="attribute-name">{attribute.name}</span>
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
        on:click={() => {
          rollRandomAndUpdate()
      }}
      >
        <FontAwesomeIcon icon={faDice} />
      </button>
    </div>
    <span class="attribute-calculation">{getCalculationMethod(attribute.name)}</span>
  {:else}
    <span class="attribute-value">{attribute.value}</span>
  {/if}
  <div class="attribute-reference">
    <span class="attribute-half">{Math.floor(attribute.value / 2)}</span> | 
    <span class="attribute-fifth">{Math.floor(attribute.value / 5)}</span>
  </div>
</div>
  
<style>
  .attribute {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    background-color: #3a3a3a;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
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