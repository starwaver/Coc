<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { SkillType } from '$lib/types';
    import SkillInput from './SkillInput.svelte';
    import { translations, type Language } from '$lib/i18n/translations';
    import { characterStore } from '$lib/stores/characterStore';

    export let skill: SkillType & { displayName: string };
    export let isEditing: boolean;
    export let currentLanguage: Language;

    const dispatch = createEventDispatcher();

    let newSkill: SkillType;

    onMount(() => {
        newSkill = { ...skill };
    });

    $: if (isEditing && newSkill) {
        dispatch('updateValue', newSkill);
    }

    $: total = calculateTotal(skill);
    $: newTotal = newSkill ? calculateTotal(newSkill) : total;

    function calculateTotal(s: SkillType) {
        return s.basePoint + s.occupationPoint + s.interestPoint + s.growthPoint;
    }

    function toggleSucceeded() {
        characterStore.update(character => {
            if (character && character.skills[skill.name.en]) {
                character.skills[skill.name.en].hasSucceeded = !character.skills[skill.name.en].hasSucceeded;
            }
            return character;
        });
    }
</script>

<style>
  .skill-box {
    background-color: #3a3a3a;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .skill-name {
    font-weight: bold;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    word-break: break-word;
  }

  .skill-value {
    font-size: 1.2em;
    color: #00cc66;
    margin-bottom: 5px;
  }

  .skill-additional {
    font-size: 0.9em;
    color: #cccccc;
    margin-top: 5px;
  }

  .skill-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .success-checkbox {
    margin-right: 10px;
  }
</style>

<div class="skill-box">
    <div class="skill-header">
        <input 
            type="checkbox" 
            class="success-checkbox" 
            checked={skill.hasSucceeded} 
            on:change={toggleSucceeded}
        />
        <div class="skill-name">{skill.displayName}</div>
    </div>

  {#if isEditing && newSkill}
    <div>
      <SkillInput label="base" bind:value={newSkill.basePoint} {currentLanguage} readonly />
      <SkillInput label="occupation" bind:value={newSkill.occupationPoint} {currentLanguage} />
      <SkillInput label="interest" bind:value={newSkill.interestPoint} {currentLanguage} />
      <SkillInput label="growth" bind:value={newSkill.growthPoint} {currentLanguage} />
      <div class="skill-value">{newTotal}</div>
      <div class="skill-additional">{Math.floor(newTotal / 2)} | {Math.floor(newTotal / 5)}</div>
    </div>
  {:else}
    <div class="skill-value">{total}</div>
    <div class="skill-additional">{Math.floor(total / 2)} | {Math.floor(total / 5)}</div>
  {/if}
</div>
