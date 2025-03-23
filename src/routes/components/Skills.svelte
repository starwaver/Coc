<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { SkillType } from '$lib/types';
    import SkillInput from './SkillInput.svelte';
    import { translations } from '$lib/i18n/translations';
    import { characterStore } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    import RollDiceModal from './Modals/DiceRoll/index.svelte';

    export let skill: SkillType & { displayName: string };
    export let isEditing: boolean;
    export let isCustom: boolean;

    const dispatch = createEventDispatcher();

    let newSkill: SkillType;
    let showDiceModal = false;

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

    function handleRoll(event: CustomEvent) {
        const roll = event.detail.total;
        const successLevel = event.detail.successLevel;
        const hasSucceeded = event.detail.hasSucceeded;
        
        // Update the skill's hasSucceeded property
        characterStore.update(character => {
            if (character && character.skills[skill.name.en]) {
                character.skills[skill.name.en].hasSucceeded = hasSucceeded;
            }
            return character;
        });
    }

    let lastRollResult = '';
    let showLastRoll = false;

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
        position: relative;
    }

    .skill-name {
        font-weight: bold;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        word-break: break-word;
        flex: 1;
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
        gap: 10px;
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
    }

    .delete-button:hover {
        background-color: #ff0000;
    }

    .roll-button {
        background: none;
        border: none;
        color: #00cc66;
        cursor: pointer;
        font-size: 1.2em;
        padding: 2px 8px;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .roll-button:hover {
        background-color: #2a2a2a;
        transform: scale(1.1);
    }

    .roll-result {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #2a2a2a;
        color: #00cc66;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.9em;
        opacity: 1;
        transition: opacity 0.3s;
        white-space: nowrap;
        z-index: 10;
    }

    .roll-result.fade-out {
        opacity: 0;
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
        <div class="skill-name">
            {skill.displayName}
            {#if !isEditing}
                <button 
                    class="roll-button"
                    on:click={() => showDiceModal = true}
                    title={t.rollSkill}
                >
                    🎲
                </button>
            {/if}
        </div>
        {#if isEditing && isCustom}
            <button class="delete-button" on:click={() => dispatch('deleteSkill')}>X</button>
        {/if}
    </div>

    {#if isEditing && newSkill}
        <div>
            <SkillInput label={t.basePoints} bind:value={newSkill.basePoint} readonly={!isCustom} />
            <SkillInput label={t.occupationPoints} bind:value={newSkill.occupationPoint} />
            <SkillInput label={t.interestPoints} bind:value={newSkill.interestPoint} />
            <SkillInput label={t.growthPoints} bind:value={newSkill.growthPoint} />
            <div class="skill-value">{newTotal}</div>
            <div class="skill-additional">{Math.floor(newTotal / 2)} | {Math.floor(newTotal / 5)}</div>
        </div>
    {:else}
        <div class="skill-value">{total}</div>
        <div class="skill-additional">{Math.floor(total / 2)} | {Math.floor(total / 5)}</div>
    {/if}
</div>

<RollDiceModal 
    bind:showModal={showDiceModal}
    defaultDice="1d100"
    multiplyResult={1}
    addToResult={0}
    skillValue={total}
    on:close={() => showDiceModal = false}
    on:roll={handleRoll}
/>
