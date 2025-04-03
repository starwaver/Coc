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

<div class="min-h-screen bg-base-200">
  {#if $characterStore}
    <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto my-8 p-6">
      <CharacterHeader />
      
      <!-- Attributes Section -->
      <section id="attributes" class="card bg-base-200 shadow-md mb-6">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 class="card-title text-2xl">{t.attributes}</h2>
            <div class="flex items-center gap-2">
              {#if $isEditingAttributes}
                <button class="btn btn-primary" on:click={() => toggleAttributesEditMode(true)}>
                  {t.save}
                </button>
                <button class="btn btn-error" on:click={cancelAttributesEdit}>
                  {t.cancel}
                </button>
              {:else}
                <button class="btn btn-primary" on:click={() => toggleAttributesEditMode(true)}>
                  {t.editAttributes}
                </button>
              {/if}
            </div>
            <div class="text-sm">
              {t.totalAttributePoints}: {$totalAttributePoints}
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {#each sortedAttributeKeys as key}
              <Attribute 
                attribute={{ name: key.toLowerCase(), value: $characterStore.attributes[key] }} 
                on:updateValue={updateAttributeValue}
                isEditing={$isEditingAttributes}
              />
            {/each}
          </div>
        </div>
      </section>

      <!-- Derived Attributes Section -->
      <section id="derived-attributes" class="card bg-base-200 shadow-md mb-6">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">{t.derivedAttributes}</h2>
          <DerivedAttributes />
        </div>
      </section>

      <!-- Backstory Section -->
      <section id="backstory" class="card bg-base-200 shadow-md mb-6">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 class="card-title text-2xl">{t.backstory}</h2>
            <div class="flex items-center gap-2">
              {#if $isEditingBackstory}
                <button class="btn btn-primary" on:click={() => saveBackstoryEdits()}>
                  {t.save}
                </button>
                <button class="btn btn-error" on:click={() => cancelBackstoryEdits()}>
                  {t.cancel}
                </button>
              {:else}
                <button class="btn btn-primary" on:click={() => startEditingBackstory()}>
                  {t.editBackstory}
                </button>
              {/if}
              <button 
                class="btn btn-ghost btn-circle"
                on:click={() => isBackstoryVisible = !isBackstoryVisible}
              >
                <svg class="w-6 h-6 transform transition-transform {isBackstoryVisible ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div class="transition-all duration-300 ease-in-out {isBackstoryVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}">
            <Backstory bind:this={backstoryComponent} isEditing={$isEditingBackstory} />
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section id="skills" class="card bg-base-200 shadow-md mb-6">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 class="card-title text-2xl">{t.skills}</h2>
            <div class="flex items-center gap-2">
              {#if $isEditingSkills}
                <button class="btn btn-primary" on:click={() => toggleSkillsEditMode(true)}>
                  {t.save}
                </button>
                <button class="btn btn-error" on:click={cancelSkillsEdit}>
                  {t.cancel}
                </button>
                <div class="text-sm">
                  <div>{t.totalOccupationPoints}: {$skillPointTotals.occupationTotal}</div>
                  <div>{t.totalInterestPoints}: {$skillPointTotals.interestTotal}</div>
                </div>
              {:else}
                <button class="btn btn-primary" on:click={() => toggleSkillsEditMode(true)}>
                  {t.editSkills}
                </button>
              {/if}
            </div>
          </div>
          <div class="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              class="input input-bordered flex-1 min-w-[200px]"
              placeholder={t.searchSkills}
              bind:value={$searchQuery}
            />
            <label class="label cursor-pointer gap-2">
              <input type="checkbox" class="checkbox" bind:checked={$showOccupationSkills}>
              <span class="label-text">{t.filterOccupationSkills}</span>
            </label>
            <label class="label cursor-pointer gap-2">
              <input type="checkbox" class="checkbox" bind:checked={$showInterestSkills}>
              <span class="label-text">{t.filterInterestSkills}</span>
            </label>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </section>

      <!-- Inventory Section -->
      <section id="inventory" class="card bg-base-200 shadow-md">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 class="card-title text-2xl">{t.inventory}</h2>
            <div class="flex items-center gap-2">
              {#if $isEditingInventory}
                <button class="btn btn-primary" on:click={() => toggleInventoryEditMode(true)}>
                  {t.save}
                </button>
                <button class="btn btn-error" on:click={cancelInventoryEdit}>
                  {t.cancel}
                </button>
              {:else}
                <button class="btn btn-primary" on:click={() => toggleInventoryEditMode(true)}>
                  {t.editInventory}
                </button>
              {/if}
            </div>
          </div>
          <Inventory bind:this={inventoryComponent} isEditing={$isEditingInventory} />
        </div>
      </section>
    </div>
  {:else}
    <div class="flex justify-center items-center min-h-screen">
      <p class="text-lg">{t.loadingCharacterData}</p>
    </div>
  {/if}
</div>




