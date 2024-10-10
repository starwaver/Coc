<script lang="ts">
  import Attribute from './Attribute.svelte';
  import DerivedAttributes from './DerivedAttributes.svelte'
  import { characterStore, initializeCharacter } from '$lib/stores/characterStore';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import type { AttributeType } from '$lib/types';

  onMount(() => {
    initializeCharacter();
  });

  function updateAttributeValue(event: CustomEvent<{ name: keyof AttributeType; value: number }>): void {
    characterStore.update(character => {
      if (character && character.attributes) {
        character.attributes[event.detail.name] = event.detail.value;
      }
      return character;
    });
  }
</script>


<style>
  .main-dashboard {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #7c7c7c;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    color: #f0f0f0;
  }

  .character-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .character-portrait {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 4px solid #f0f0f0;
  }

  .character-name {
    font-size: 2em;
    margin-top: 10px;
  }

  .section {
    margin-bottom: 20px;
  }

  .attributes-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #666;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  .derived-attributes-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #444;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  h2 {
    border-bottom: 2px solid #444;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
</style>

{#if $characterStore}
  <div class="main-dashboard">
    <!-- Main Dashboard -->
    <div class="character-header">
      <img src={$characterStore.image} alt="Character Portrait" class="character-portrait">
      <h1 class="character-name">{$characterStore.name}</h1>
    </div>

    <!-- Attributes Section -->
    <section id="attributes" class="section">
      <h2>Attributes</h2>
      <div class="attributes-container">
        {#each Object.entries($characterStore.attributes) as [key, value]}
          <Attribute attribute={{ name: key.toUpperCase(), value }} on:updateValue={updateAttributeValue} />
        {/each}
      </div>
    </section>

    <!-- Derived Attributes Section -->
    <DerivedAttributes />
  </div>
{:else}
  <p>Loading character data...</p>
{/if}