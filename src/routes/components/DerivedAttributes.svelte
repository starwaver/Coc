<script lang="ts">
    import { characterStore } from '$lib/stores/characterStore';
    import type { DerivedAttributeType } from '$lib/types';

    let derivedAttributes: DerivedAttributeType | null = null;

    characterStore.subscribe(value => {
      if (value) {
        derivedAttributes = value.derivedAttributes;
      }
    });

    // Utility function to convert camelCase to uppercase with spaces
    function camelCaseToUpperSpace(key: string): string {
      return key.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
    }
</script>

<style>
    .derived-attributes-container {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 15px;
      margin-bottom: 20px;
      padding: 10px;
      background-color: #3a3a3a;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }
</style>

<div class="derived-attributes-container">
  {#if derivedAttributes}
    {#each Object.entries(derivedAttributes) as [key, value]}
      <div>
        <strong>{camelCaseToUpperSpace(key)}:</strong> {value}
      </div>
    {/each}
  {:else}
    <p>Loading derived attributes...</p>
  {/if}
</div>
