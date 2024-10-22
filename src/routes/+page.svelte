<script lang="ts">
  import Attribute from './components/Attribute.svelte';
  import DerivedAttributes from './components/DerivedAttributes.svelte';
  import Skill from './components/Skills.svelte';
  import { characterStore, localizedSkills, updateCharacterData } from '$lib/stores/characterStore';
  import { languageStore } from '$lib/stores/languageStore';
  
  import { onMount } from 'svelte';
  import type { AttributeType, SkillType} from '$lib/types';
  import { writable, derived } from 'svelte/store';
  import { translations, type Language } from '$lib/i18n/translations';
  import AddCustomSkill from './components/AddCustomSkill.svelte';
  import skillList from '$lib/skill_list.json';

  function updateAttributeValue(event: CustomEvent<{ name: keyof AttributeType; value: number }>): void {
    characterStore.update(character => {
      if (character) {
        if (character.attributes) {
          character.attributes[event.detail.name] = event.detail.value;
        }

        updateCharacterData(character);
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
      if (!value) {
        // Entering edit mode, initialize editedSkills with current skills
        characterStore.update(character => {
          if (character) {
            editedSkills.set(character.skills);
          }
          return character;
        });
      } else if (save) {
        characterStore.update(character => {
          if (character) {
            // Update character's skills with editedSkills
            character.skills = { ...$editedSkills };
          }
          return character;
        });
      }
      return !value;
    });
  }

  function cancelSkillsEdit() {
    toggleSkillsEditMode(false);
  }

  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];

  const isEditingAttributes = writable(false);

  function toggleAttributesEditMode(save: boolean = true) {
    isEditingAttributes.update(value => !value);
  }

  function cancelAttributesEdit() {
    toggleAttributesEditMode(false);
  }

  function addCustomSkill(event: CustomEvent<SkillType>) {
    const newSkill = event.detail;
    characterStore.update(character => {
      if (character) {
        character.skills[newSkill.name.en] = newSkill;
      }
      return character;
    });
  }

  function deleteCustomSkill(skillName: string) {
    characterStore.update(character => {
      if (character) {
        delete character.skills[skillName];
      }
      return character;
    });
    editedSkills.update(skills => {
      delete skills[skillName];
      return skills;
    });
  }

  let isEditingName = false;
  let editedName = '';

  function startEditingName() {
    editedName = $characterStore?.name ?? '';
    isEditingName = true;
  }

  function saveName() {
    characterStore.update(character => {
      if (character) {
        character.name = editedName;
        updateCharacterData(character);
      }
      return character;
    });
    isEditingName = false;
  }

  function cancelEditName() {
    isEditingName = false;
  }

  let isEditingImage = false;
  let editedImageUrl = '';

  function startEditingImage() {
    editedImageUrl = $characterStore?.image ?? '';
    isEditingImage = true;
  }

  function saveImageUrl() {
    characterStore.update(character => {
      if (character) {
        character.image = editedImageUrl;
        updateCharacterData(character);
      }
      return character;
    });
    isEditingImage = false;
  }

  function cancelEditImage() {
    isEditingImage = false;
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
    cursor: pointer;
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

  :global(.add-custom-skill) {
    margin-top: 20px;
  }

  .name-edit-container {
    display: flex;
    justify-content: center;
  }

  .name-input {
    font-size: 2em;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid #f0f0f0;
    color: #f0f0f0;
    text-align: center;
    width: 80%;
  }

  .image-url-input {
    width: 80%;
    padding: 5px;
    margin-top: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid #f0f0f0;
    border-radius: 5px;
    color: #f0f0f0;
  }

  .image-edit-buttons {
    margin-top: 10px;
  }

  .image-edit-button {
    background-color: #00cc66;
    color: #fff;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    margin: 0 5px;
  }

  .image-edit-button.cancel {
    background-color: #cc0000;
  }

  .character-portrait-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    border: none;
    cursor: pointer;
    border-radius: 50%;
  }

  .upload-icon {
    font-size: 2em;
    color: #fff;
  }
</style>

{#if $characterStore}
  <div class="main-dashboard">
    <!-- Main Dashboard -->
    <div class="character-header">
      <div class="character-portrait-container">
        <img src={$characterStore.image} alt="Character Portrait" class="character-portrait">
        {#if !isEditingImage}
          <button class="character-portrait-overlay" on:dblclick={startEditingImage}>
            <span class="upload-icon">🔗</span>
          </button>
        {/if}
      </div>
      {#if isEditingImage}
        <input
          type="text"
          bind:value={editedImageUrl}
          class="image-url-input"
          placeholder={t.enterImageUrl}
        />
        <div class="image-edit-buttons">
          <button class="image-edit-button" on:click={saveImageUrl}>
            {t.save}
          </button>
          <button class="image-edit-button cancel" on:click={cancelEditImage}>
            {t.cancel}
          </button>
        </div>
      {/if}
      <div class="name-edit-container">
        {#if isEditingName}
          <input
            type="text"
            bind:value={editedName}
            class="name-input"
            on:blur={saveName}
            on:keydown={(e) => e.key === 'Enter' && saveName()}
            placeholder={t.enterCharacterName}
          />
        {:else}
          <h1 class="character-name" on:dblclick={startEditingName}>
            {$characterStore.name}
          </h1>
        {/if}
      </div>
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
              displayName: skillData.name[currentLanguage] || skillData.name.en,
              hasSucceeded: $characterStore.skills[key].hasSucceeded
            }}
            on:updateValue={updateSkillValue}
            on:deleteSkill={(event) => deleteCustomSkill(key)}
            isEditing={$isEditingSkills}
            isCustom={!skillList.skills.some(s => s.name.en === key)}
          />
        {/each}
      </div>
      {#if $isEditingSkills}
        <AddCustomSkill on:addSkill={addCustomSkill} {currentLanguage} />
      {/if}
    </section>
  </div>
{:else}
  <p>{t.loadingCharacterData}</p>
{/if}
