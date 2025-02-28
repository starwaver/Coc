<script lang="ts">
  import CharacterHeader from './components/CharacterHeader.svelte';
  import Attribute from './components/Attribute.svelte';
  import DerivedAttributes from './components/DerivedAttributes.svelte';
  import Skill from './components/Skills.svelte';
  import Backstory from './components/Backstory.svelte';
  import { characterStore, localizedSkills, updateCharacterData } from '$lib/stores/characterStore';
  import { languageStore } from '$lib/stores/languageStore';
  
  import type { AttributeType, SkillType, InventoryType} from '$lib/types';
  import { writable, derived } from 'svelte/store';
  import { translations, type Language } from '$lib/i18n/translations';
  import AddCustomSkill from './components/AddCustomSkill.svelte';
  import skillList from '$lib/skill_list.json';
  import Inventory from './components/Inventory.svelte';


  // Define the attribute order
  const attributeOrder: Array<keyof AttributeType> = ['str', 'dex', 'int', 'con', 'app', 'pow', 'siz', 'edu', 'luck'];

  // Reactive variable for sorted attribute keys
  let sortedAttributeKeys: Array<keyof AttributeType> = [];

  // Update sortedAttributeKeys whenever characterStore changes
  $: if ($characterStore && $characterStore.attributes) {
    sortedAttributeKeys = Object.keys($characterStore.attributes)
      .sort((a, b) => {
        const aKey = a as keyof AttributeType;
        const bKey = b as keyof AttributeType;
        return attributeOrder.indexOf(aKey) - attributeOrder.indexOf(bKey);
      }) as Array<keyof AttributeType>;
  }

  $: totalAttributePoints = derived(characterStore, ($characterStore) => {
    if (!$characterStore?.attributes) return 0;
    
    return Object.entries($characterStore.attributes)
      .reduce((total, [key, value]) => {
        return key !== 'luck' ? total + value : total;
      }, 0);
  });

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
    const skillName = event.detail.name.en;
    console.log(`Updating skill: ${skillName}`, event.detail);
    editedSkills.update(skills => ({
      ...skills,
      [skillName]: event.detail
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
            // Create a deep copy to prevent unintended mutations
            const skillsCopy = JSON.parse(JSON.stringify(character.skills));
            editedSkills.set(skillsCopy);
          }
          return character;
        });
      } else if (save) {
        characterStore.update(character => {
          if (character) {
            // Update character's skills with editedSkills
            character.skills = { ...$editedSkills };
            updateCharacterData(character);
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

  const showOccupationSkills = writable(false);
  const showInterestSkills = writable(false);

  const searchQuery = writable('');

  $: filteredSkills = derived(
  [localizedSkills, editedSkills, showOccupationSkills, showInterestSkills, searchQuery],
  ([
    $localizedSkills, 
    $editedSkills, 
    $showOccupationSkills, 
    $showInterestSkills, 
    $searchQuery
  ]) => {
    if (!$localizedSkills) return {};
    
    // Merge editedSkills into localizedSkills
    const mergedSkills = { ...$localizedSkills, ...$editedSkills };
    
    return Object.fromEntries(
      Object.entries(mergedSkills).filter(([key, skill]) => {
        // If there's a search query, only use that filter
        if ($searchQuery) {
          const searchLower = $searchQuery.toLowerCase();
          return Object.values(skill.name).some(name => 
            name.toLowerCase().includes(searchLower)
          );
        }
        
        // Otherwise, use occupation/interest filters
        if ($showOccupationSkills || $showInterestSkills) {
          if ($showOccupationSkills && skill.occupationPoint > 0) return true;
          if ($showInterestSkills && skill.interestPoint > 0) return true;
          return false;
        }
        
        return true;
      })
    );
  }
);

  const isEditingBackstory = writable(false);
  let backstoryComponent: Backstory;

  function startEditingBackstory() {
    isEditingBackstory.set(true);
  }

  function saveBackstoryEdits() {
    backstoryComponent.saveEdits();
    isEditingBackstory.set(false);
  }

  function cancelBackstoryEdits() {
    isEditingBackstory.set(false);
  }

  // Add this new line
  let isBackstoryVisible = true;

  const isEditingInventory = writable(false);
  let inventoryComponent: Inventory;
  let editedInventory: InventoryType;

  function toggleInventoryEditMode(save: boolean = true) {
    isEditingInventory.update(value => {
      if (!value) {
        inventoryComponent.startEditing();
      } else if (save) {
        inventoryComponent.saveEdits();
      } else {
        inventoryComponent.cancelEdits();
      }
      return !value;
    });
  }

  function cancelInventoryEdit() {
    toggleInventoryEditMode(false);
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
    overflow: wrap;
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

  /* Add these new styles */
  .dropdown-icon {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 10px;
    font-size: 0.8em;
    transition: transform 0.3s ease;
    padding: 0;
    color: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .dropdown-icon:hover,
  .dropdown-icon:focus {
    outline: none;
    text-decoration: none;
  }

  .dropdown-icon.open {
    transform: rotate(-90deg);
  }

  .backstory-content {
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
    opacity: 1;
    overflow: hidden;
  }

  .backstory-content.hidden {
    max-height: 0;
    opacity: 0;
  }

  /* Add/update these styles */
  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-left: auto;
  }

  .filter-controls label {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    font-size: 0.9em;
  }

  .search-input {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 0.9em;
    min-width: 150px;
  }

  @media (max-width: 768px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .filter-controls {
      width: 100%;
      margin-left: 0;
    }

    .point-totals {
      margin-left: 0;
      width: 100%;
    }

    .section-container {
      grid-template-columns: repeat(2, 1fr);
    }

    .search-input {
      width: 100%;
      min-width: unset;
    }
  }

  @media (max-width: 360px) {
    .section-container {
      grid-template-columns: 1fr;
    }

    .filter-controls label {
      font-size: 0.8em;
    }
  }
</style>

{#if $characterStore}
  <div class="main-dashboard">
    <CharacterHeader />
    
    <!-- Attributes Section -->
    <section id="attributes" class="section">
      <div class="section-header">
        <h2>{t.attributes}</h2>
        <div>
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
        <div class="point-totals">
          {t.totalAttributePoints}: {$totalAttributePoints}
        </div>
      </div>
      <div class="section-container">
        {#each sortedAttributeKeys as key}
          <Attribute 
            attribute={{ name: key.toLowerCase(), value: $characterStore.attributes[key] }} 
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

    <!-- Backstory Section -->
    <section id="backstory" class="section">
      <div class="section-header">
        <h2>{t.backstory}</h2>
        <div>
          {#if $isEditingBackstory}
            <button class="section-button" on:click={() => saveBackstoryEdits()}>
              {t.save}
            </button>
            <button class="section-button cancel-button" on:click={() => cancelBackstoryEdits()}>
              {t.cancel}
            </button>
          {:else}
            <button class="section-button" on:click={() => startEditingBackstory()}>
            {t.editBackstory}
            </button>
          {/if}
        </div>
        <!-- Update this span for the left/down facing icon -->
        <button 
          class="dropdown-icon {isBackstoryVisible ? 'open' : ''}"
          on:click={() => isBackstoryVisible = !isBackstoryVisible}
        >
          ◀
        </button>
      </div>
      <div class="backstory-content {isBackstoryVisible ? '' : 'hidden'}">
        <Backstory bind:this={backstoryComponent} isEditing={$isEditingBackstory} />
      </div>
    </section>

    <!-- Skills Section -->
    <section id="skills" class="section">
      <div class="section-header">
        <h2>{t.skills}</h2>
        <div>
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
        <div class="filter-controls">
          <input
            type="text"
            class="search-input"
            placeholder={t.searchSkills}
            bind:value={$searchQuery}
          />
          <label>
            <input type="checkbox" bind:checked={$showOccupationSkills}>
            {t.filterOccupationSkills}
          </label>
          <label>
            <input type="checkbox" bind:checked={$showInterestSkills}>
            {t.filterInterestSkills}
          </label>
        </div>
      </div>
      <div class="section-container">
        {#each Object.entries($filteredSkills) as [key, skillData] (key)}
          <Skill 
            skill={{
              ...skillData,
              ...($editedSkills[key] || {}),
              displayName: skillData.name[currentLanguage] || skillData.name.en,
              hasSucceeded: $characterStore.skills[key]?.hasSucceeded || false
            }}
            on:updateValue={updateSkillValue}
            on:deleteSkill={() => deleteCustomSkill(key)}
            isEditing={$isEditingSkills}
            isCustom={!skillList.skills.some(s => s.name.en === key)}
          />
        {/each}
      </div>
      {#if $isEditingSkills}
        <AddCustomSkill on:addSkill={addCustomSkill} {currentLanguage} />
      {/if}
    </section>

    <!-- Inventory Section -->
    <section id="inventory" class="section">
      <div class="section-header">
        <h2>{t.inventory}</h2>
        <div>
          {#if $isEditingInventory}
            <button class="section-button" on:click={() => toggleInventoryEditMode(true)}>
              {t.save}
            </button>
            <button class="section-button cancel-button" on:click={cancelInventoryEdit}>
              {t.cancel}
            </button>
          {:else}
            <button class="section-button" on:click={() => toggleInventoryEditMode(true)}>
              {t.editInventory}
            </button>
          {/if}
        </div>
      </div>
      <Inventory bind:this={inventoryComponent} isEditing={$isEditingInventory} />
    </section>
  </div>
{:else}
  <p>{t.loadingCharacterData}</p>
{/if}




