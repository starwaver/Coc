<script lang="ts">
  import Attribute from './Attribute.svelte';
  import DerivedAttributes from './DerivedAttributes.svelte';
  import Skill from './Skills.svelte';
  import { characterStore, initializeCharacter, languageStore, localizedSkills } from '$lib/stores/characterStore';
  import { onMount } from 'svelte';
  import type { AttributeType, SkillType} from '$lib/types';
  import { writable, derived } from 'svelte/store';
  import { translations, type Language } from '$lib/i18n/translations';

  onMount(() => {
    initializeCharacter('./data/example_character.json');
  });

  function updateAttributeValue(event: CustomEvent<{ name: keyof AttributeType; value: number }>): void {
    characterStore.update(character => {
      if (character && character.attributes) {
        character.attributes[event.detail.name] = event.detail.value;
      }
      return character;
    });
  }

  function updateSkillValue(event: CustomEvent<SkillType>): void {
    editedSkills.update(skills => ({
      ...skills,
      [event.detail.name.en]: event.detail
    }));
  }

  const isEditingSkills = writable(false);
  const editedSkills = writable<Record<string, SkillType>>({});

  $: skillPointTotals = derived([characterStore, editedSkills], ([$characterStore, $editedSkills]) => {
    if (!$characterStore) return { occupationTotal: 0, interestTotal: 0 };
    
    return Object.values($characterStore.skills).reduce(
      (acc, skill) => {
        const editedSkill = $editedSkills[skill.name.en] || skill;
        acc.occupationTotal += editedSkill.occupationPoint;
        acc.interestTotal += editedSkill.interestPoint;
        return acc;
      },
      { occupationTotal: 0, interestTotal: 0 }
    );
  });

  function toggleSkillsEditMode(save: boolean = true) {
    isEditingSkills.update(value => {
      if (value && save) {
        // Save edited skills to characterStore
        characterStore.update(character => {
          if (character) {
            Object.values($editedSkills).forEach(skill => {
              character.skills[skill.name.en] = skill;
            });
          }
          return character;
        });
      }
      editedSkills.set({});
      return !value;
    });
  }

  function cancelSkillsEdit() {
    toggleSkillsEditMode(false);
  }

  // Add this function to handle language change
  function changeLanguage(lang: string) {
    languageStore.set(lang as Language);
  }

  // Add this derived store to get the current language
  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];

  const isEditingAttributes = writable(false);

  function toggleAttributesEditMode(save: boolean = true) {
    isEditingAttributes.update(value => {
      if (value && save) {
        // Save logic here if needed
      }
      return !value;
    });
  }

  function cancelAttributesEdit() {
    toggleAttributesEditMode(false);
  }
</script>

<style>
  .main-dashboard {
    position: relative;
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

  .section-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
    margin-bottom: 20px;
    padding: 0px;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #444;
    padding-bottom: 10px;
  }

  .section-header h2 {
    margin: 0;
    margin-right: 15px;
  }

  .section-button {
    background-color: #00cc66;
    color: #fff;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
  }

  .section-button:hover {
    background-color: #00b359;
  }

  .point-totals {
    font-size: 0.9em;
    margin-left: 15px;
  }

  .cancel-button {
    background-color: #cc0000;
    margin-left: 10px;
  }

  .cancel-button:hover {
    background-color: #b30000;
  }

  .language-selector {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .language-select {
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #3a3a3a;
    color: #f0f0f0;
    border: 1px solid #f0f0f0;
    cursor: pointer;
  }

  .language-select:hover {
    background-color: #4a4a4a;
  }
</style>

<!-- Add the language selector at the top of the template, outside the main-dashboard div -->
<div class="language-selector">
  <select bind:value={$languageStore} on:change={() => changeLanguage($languageStore)} class="language-select">
    <option value="en">English</option>
    <option value="cn">中文</option>
    <!-- Add more language options as needed -->
  </select>
</div>

{#if $characterStore}
  <div class="main-dashboard">
    <!-- Main Dashboard -->
    <div class="character-header">
      <img src={$characterStore.image} alt="Character Portrait" class="character-portrait">
      <h1 class="character-name">{$characterStore.name}</h1>
    </div>

    <!-- Attributes Section -->
    <section id="attributes" class="section">
      <div class="section-header">
        <h2>{t.attributes}</h2>
        {#if $isEditingAttributes}
          <button class="section-button" on:click={() => toggleAttributesEditMode(true)}>
            {t.save}
          </button>
          <button class="section-button cancel-button" on:click={cancelAttributesEdit}>
            {t.cancel}
          </button>
        {:else}
          <button class="section-button" on:click={() => toggleAttributesEditMode(true)}>
            {t.editAttributes}
          </button>
        {/if}
      </div>
      <div class="section-container">
        {#each Object.entries($characterStore.attributes) as [key, value]}
          <Attribute 
            attribute={{ name: key.toUpperCase(), value }} 
            on:updateValue={updateAttributeValue}
            isEditing={$isEditingAttributes}
          />
        {/each}
      </div>
    </section>

    <!-- Derived Attributes Section -->
    <section id="derived-attributes" class="section">
      <div class="section-header">
        <h2>{t.derivedAttributes}</h2>
      </div>
      <DerivedAttributes />
    </section>

    <!-- Skills Section -->
    <section id="skills" class="section">
      <div class="section-header">
        <h2>{t.skills}</h2>
        {#if $isEditingSkills}
          <button class="section-button" on:click={() => toggleSkillsEditMode(true)}>
            {t.save}
          </button>
          <button class="section-button cancel-button" on:click={cancelSkillsEdit}>
            {t.cancel}
          </button>
          <div class="point-totals">
            <div>{t.totalOccupationPoints}: {$skillPointTotals.occupationTotal}</div>
            <div>{t.totalInterestPoints}: {$skillPointTotals.interestTotal}</div>
          </div>
        {:else}
          <button class="section-button" on:click={() => toggleSkillsEditMode(true)}>
            {t.editSkills}
          </button>
        {/if}
      </div>
      <div class="section-container">
        {#each Object.entries($localizedSkills) as [key, skillData]}
          <Skill 
            skill={{
              ...skillData,
              displayName: skillData.name[currentLanguage] || skillData.name.en
            }}
            on:updateValue={updateSkillValue}
            isEditing={$isEditingSkills}
            {currentLanguage}
          />
        {/each}
      </div>
    </section>
  </div>
{:else}
  <p>Loading character data...</p>
{/if}
