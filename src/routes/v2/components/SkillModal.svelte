<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import GenericModal from './GenericModal.svelte';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import type { SkillType } from '$lib/types';
    import skillList from '$lib/skill_list.json';
  
    const dispatch = createEventDispatcher();
  
    /* ————————— props ————————— */
    export let skillName = '';
    export let skill: SkillType | null = null;
  
    /* Legacy prop so older callers can do <SkillModal isOpen …>  */
    export let isOpen = false;

    // Reference to the GenericModal component
    let modal: { show: () => void; hide: () => void; };

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
  
    /* ————————— stores & i18n ————————— */
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];
  
    /* ————————— values derived from `skill` ————————— */
    $: value      = skill ? skill.basePoint + skill.occupationPoint + skill.interestPoint + skill.growthPoint : 0;
    $: halfValue  = Math.floor(value / 2);
    $: fifthValue = Math.floor(value / 5);
  
    function getSkillInfo(name: string) {
      return skillList.skills.find(s =>
        s.name.en.toLowerCase() === name.toLowerCase() || s.name.cn === name
      );
    }
  
    $: skillInfo        = getSkillInfo(skillName);
    $: displayName      = skill?.name[currentLanguage] || t[skillName as TranslationKeys] || skillName;
    $: skillDescription = skillInfo?.description?.[currentLanguage] || skillInfo?.description?.en || '';

    function rollDice() {
      dispatch('roll', { skillName, skill, value, halfValue, fifthValue });
      // Modal should stay open after rolling
    }
  
</script>

<GenericModal title={displayName} bind:this={modal} on:close={handleModalClose}>
    <!-- body -->
    <div class="text-center my-4">
      <div class="text-lg flex items-center justify-center gap-2">
        <span>{value} | {halfValue} | {fifthValue}</span>
      </div>
    </div>
  
    <div class="mt-4 mb-6 text-center">
      <p class="inline-block w-fit max-w-full text-left text-sm">{skillDescription}</p>
    </div>
  
    <!-- footer -->
    <div class="flex justify-center">
      <button class="btn btn-circle btn-primary btn-lg" on:click={rollDice} aria-label="Roll">
        <img src="/dice icon.png" alt="Dice Icon" class="w-6 h-6">
      </button>
    </div>
</GenericModal>