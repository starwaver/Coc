<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import GenericModal from './GenericModal.svelte';
  import { languageStore } from '$lib/stores/languageStore';
  import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
  import type { SkillType } from '$lib/types';
  import skillList from '$lib/skill_list.json';
  
  const dispatch = createEventDispatcher();
  
  // Type for Attribute
  type AttributeType = {
    name: string;
    value: number;
    description?: string;
  };
  
  // Reference to the GenericModal component
  let modal: { show: () => void; hide: () => void; };
  
  // Current language and translations
  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];
  
  /* ————————— props ————————— */
  export let isOpen = false;
  
  // Skill props
  export let skillName = '';
  export let skill: SkillType | null = null;
  
  // Attribute props
  export let attributeName = '';
  export let attributeValue = 0;
  export let attributeDescription = '';
  export let attribute: AttributeType | null = null;
  
  // Determine if we're displaying a skill or attribute
  $: isSkill = !!skill || (!!skillName && !attributeName && !attribute);
  
  // Watch isOpen changes to show/hide the modal
  $: if (isOpen && modal) {
    modal.show();
  } else if (!isOpen && modal) {
    modal.hide();
  }
  
  // Handle dialog close events to update isOpen
  function handleModalClose() {
    isOpen = false;
  }
  
  /* ————————— Skill-specific logic ————————— */
  function getSkillInfo(name: string) {
    return skillList.skills.find(s =>
      s.name.en.toLowerCase() === name.toLowerCase() || s.name.cn === name
    );
  }
  
  $: skillInfo = isSkill ? getSkillInfo(skillName) : null;
  $: skillValue = skill ? skill.basePoint + skill.occupationPoint + skill.interestPoint + skill.growthPoint : 0;
  
  /* ————————— Attribute-specific logic ————————— */
  // Use attribute object values if provided, otherwise use direct props
  $: effectiveAttributeName = attribute?.name || attributeName;
  $: effectiveAttributeValue = attribute?.value || attributeValue;
  $: effectiveAttributeDescription = attribute?.description || attributeDescription;
  
  /* ————————— Common derived values ————————— */
  $: value = isSkill ? skillValue : effectiveAttributeValue;
  $: halfValue = Math.floor(value / 2);
  $: fifthValue = Math.floor(value / 5);
  
  // Get display name based on type
  $: displayName = isSkill
    ? (skill?.name[currentLanguage] || t[skillName as TranslationKeys] || skillName)
    : (t[effectiveAttributeName.toLowerCase() as TranslationKeys] || effectiveAttributeName);
  
  // Get description based on type
  $: description = isSkill
    ? (skillInfo?.description?.[currentLanguage] || skillInfo?.description?.en || '')
    : effectiveAttributeDescription;
  
  /* ————————— Roll handling ————————— */
  function rollDice() {
    if (isSkill) {
      dispatch('roll', { skillName, skill, value, halfValue, fifthValue });
    } else {
      dispatch('roll', { 
        name: effectiveAttributeName, 
        value, 
        halfValue, 
        fifthValue 
      });
    }
    // Modal stays open after rolling
  }
</script>

<GenericModal title={displayName} bind:this={modal} on:close={handleModalClose}>
  <!-- Values Display -->
  <div class="text-center my-4">
    <div class="text-base flex items-center justify-center gap-2">
      <span>{value}</span>
      <span class="opacity-60">|</span>
      <span>{halfValue}</span>
      <span class="opacity-60">|</span>
      <span>{fifthValue}</span>
    </div>
  </div>
  
  <!-- Description -->
  {#if description}
    <div class="mt-4 mb-6 text-center">
      <p class="inline-block w-fit max-w-full text-left text-sm">{description}</p>
    </div>
  {/if}
  
  <!-- Roll Button -->
  <div class="flex justify-center">
    <button class="btn btn-circle btn-primary btn-lg" on:click={rollDice} aria-label="Roll">
      <img src="/dice icon.png" alt="Dice Icon" class="w-6 h-6">
    </button>
  </div>
</GenericModal> 