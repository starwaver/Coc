<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SkillType } from '$lib/types';

    export let skill: SkillType;

    const dispatch = createEventDispatcher();

    let isEditing = false;
    let newSkill = { ...skill }; 

    function toggleEdit() {
      isEditing = !isEditing;

      if (!isEditing) {
        skill = { ...newSkill };
        dispatch('updateValue', skill);
      } else {
        newSkill = { ...skill };
      }
    }

    function cancelEdit() {
      isEditing = false;
      newSkill = { ...skill };
    }

    $: total = calculateTotal(skill);
    $: newTotal = calculateTotal(newSkill);

    function calculateTotal(s: SkillType) {
      return s.basePoint + s.occupationPoint + s.interestPoint + s.growthPoint;
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
    margin-bottom: 10px;
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

  input[type="number"] {
    font-size: 1em;
    color: #00cc66;
    background-color: #2a2a2a;
    border: none;
    border-bottom: 2px solid #00cc66;
    margin-bottom: 5px;
    padding: 5px;
    max-width: 80px;
  }

  .edit-button {
    background: none;
    border: none;
    color: #00cc66;
    cursor: pointer;
    font-size: 1em;
  }

  .cancel-button {
    background: none;
    border: none;
    color: #cc0000;
    cursor: pointer;
    font-size: 1em;
    margin-left: 10px;
  }
</style>

<div class="skill-box">
  <div class="skill-name">{skill.name}
    <button class="edit-button" on:click={toggleEdit}>{isEditing ? 'Save' : '✏️'}</button>
    {#if isEditing}
      <button class="cancel-button" on:click={cancelEdit}>Cancel</button>
    {/if}
  </div>

  {#if isEditing}
    <div>
      <div>Base: {newSkill.basePoint}</div>
      <div>Occupation: <input id="occupationValue" type="number" bind:value={newSkill.occupationPoint} /></div>
      <div>Interest: <input id="interestValue" type="number" bind:value={newSkill.interestPoint} /></div>
      <div>Growth: <input id="growthValue" type="number" bind:value={newSkill.growthPoint} /></div>
      <div class="skill-value">{newTotal}</div>
    </div>
  {:else}
    <div class="skill-value">{total}</div>
  {/if}

  <div class="skill-additional">{Math.floor(total / 2)} | {Math.floor(total / 5)}</div>
</div>
