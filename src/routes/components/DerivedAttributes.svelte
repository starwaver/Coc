<script lang="ts">
    import { derived, writable } from 'svelte/store';
    import { characterStore } from '$lib/stores/characterStore';
    import type { CharacterType } from '$lib/types';
  
    const character = writable<CharacterType | null>(null);
  
    characterStore.subscribe(value => {
      if (value) {
        character.set(value);
      }
    });
  
    const derivedAttributes = derived(character, $character => {
      if (!$character || !$character.attributes) {
        return null;
      }
  
      const attributes = $character.attributes;
      return {
        hp: Math.floor((attributes.con + attributes.siz) / 10),
        san: attributes.pow,
        mp: Math.floor(attributes.pow / 5),
        db: calculateDamageBonus(attributes.str, attributes.siz),
        build: calculateBuild(attributes.str, attributes.siz),
        move: calculateMove(attributes.dex, attributes.str, attributes.siz),
      };
    });
  
    function calculateDamageBonus(str: number, siz: number): string {
      const combined = str + siz;
      if (combined <= 64) return "-2";
      else if (combined <= 84) return "-1";
      else if (combined <= 124) return "0";
      else if (combined <= 164) return "+1D4";
      else if (combined <= 204) return "+1D6";
      else if (combined <= 284) return "+2D6";
      else if (combined <= 364) return "+3D6";
      else if (combined <= 444) return "+4D6";
      else return "+5D6";
    }
  
    function calculateBuild(str: number, siz: number): number {
      const combined = str + siz;
      if (combined <= 64) return -2;
      else if (combined <= 84) return -1;
      else if (combined <= 124) return 0;
      else if (combined <= 164) return 1;
      else if (combined <= 204) return 2;
      else if (combined <= 284) return 3;
      else if (combined <= 364) return 4;
      else if (combined <= 444) return 5;
      else return 6;
    }
  
    function calculateMove(dex: number, str: number, siz: number): number {
      if (dex < siz && str < siz) return 7;
      else if (dex > siz && str > siz) return 9;
      else return 8;
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
  {#if $derivedAttributes}
    {#each Object.entries($derivedAttributes) as [key, value]}
      <div>
        <strong>{key.toUpperCase()}:</strong> {value}
      </div>
    {/each}
  {:else}
    <p>Loading derived attributes...</p>
  {/if}
</div>
