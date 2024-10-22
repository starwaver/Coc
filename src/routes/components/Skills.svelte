<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { SkillType } from '$lib/types';
    import SkillInput from './SkillInput.svelte';
    import { translations } from '$lib/i18n/translations';
    import { characterStore } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    export let skill: SkillType & { displayName: string };
    export let isEditing: boolean;
    export let isCustom: boolean;

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

    // Add this derived store
    $: t = $languageStore ? translations[$languageStore] : translations.en;
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

  .delete-button {
    background-color: #cc0000;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    margin-left: 5px;
  }

  .delete-button:hover {
    background-color: #ff0000;
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
        {#if isEditing && isCustom}
            <button class="delete-button" on:click={() => dispatch('deleteSkill')}>X</button>
        {/if}
    </div>

    {#if isEditing && newSkill}
        <div>
            <SkillInput label={t.base} bind:value={newSkill.basePoint} readonly={!isCustom} />
            <SkillInput label={t.occupation} bind:value={newSkill.occupationPoint} />
            <SkillInput label={t.interest} bind:value={newSkill.interestPoint} />
            <SkillInput label={t.growth} bind:value={newSkill.growthPoint} />
            <div class="skill-value">{newTotal}</div>
            <div class="skill-additional">{Math.floor(newTotal / 2)} | {Math.floor(newTotal / 5)}</div>
        </div>
    {:else}
        <div class="skill-value">{total}</div>
        <div class="skill-additional">{Math.floor(total / 2)} | {Math.floor(total / 5)}</div>
    {/if}
</div>
