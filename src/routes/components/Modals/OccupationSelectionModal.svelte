<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { translations, type Language } from '$lib/i18n/translations';
  import { languageStore } from '$lib/stores/languageStore';
  import occupationList from '$lib/occupation_list.json';
  import skillList from '$lib/skill_list.json';
  import { fade } from 'svelte/transition';
  
  $: currentLanguage = $languageStore;
  $: t = translations[currentLanguage];

  export let selectedOccupation: string = '';
  export let isOpen = false;

  const dispatch = createEventDispatcher();

  const occupations = occupationList.occupations;

  type OccupationSkill = string | string[];

  let selectedCollapseElement: HTMLElement | null = null;

  function handleSelect(occupation: string) {
    selectedOccupation = occupation;
    dispatch('select', { occupation });
    isOpen = false;
  }

  function handleBackdropClick(e: MouseEvent) {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      isOpen = false;
    }
  }

  function getLocalizedOccupation(occKey: string) {
    const searchKey = occKey.trim().toLowerCase();

    const occInfo = occupationList.occupations.find(occ => {
      return occ.name.en.trim().toLowerCase() === searchKey || occ.name.cn.trim() === occKey;
    });

    if (!occInfo) {
      return {
        name: { en: occKey, cn: '未知职业' },
        minimum_credit_rating: 0,
        maximum_credit_rating: 0,
        description: { en: '', cn: '' },
        attributes: [] as string[],
        skills: [] as OccupationSkill[]
      };
    }

    return { ...occInfo };
  }

  function getOccupationDetails(occKey: string, language: Language) {
    const occInfo = getLocalizedOccupation(occKey);
    
    let formattedAttributes = '';
    if (occInfo.attributes && occInfo.attributes.length > 0) {
      const nonEduAttributes = occInfo.attributes.filter(attr => 
        attr.toLowerCase() !== 'edu');
      
      formattedAttributes = nonEduAttributes.length === 0 
        ? `${t.edu} x 4` 
        : `${t.edu} x 2 + ${nonEduAttributes.map(attr => t[attr.toLowerCase() as keyof typeof t]).join('/')} x 2`;
    }
    
    let formattedSkills = '';
    if (occInfo.skills && occInfo.skills.length > 0) {
      let socialSkillCount = 0;
      let anySkillCount = 0;
      let majorSkillCount = 0;
      let artAndCraftSkillCount = 0;
      let scienceSkillCount = 0;

      const processedSkills = occInfo.skills.map((skillEntry: OccupationSkill) => {
        if (typeof skillEntry === 'string') {
          if (skillEntry === "Social Skill") {
            socialSkillCount++;
            return null;
          }
          if (skillEntry === "Any Skill") {
            anySkillCount++;
            return null;
          }
          if (skillEntry === "Major Skill") {
            majorSkillCount++;
            return null;
          }
          if (skillEntry === "Art and Craft (Any)") {
            artAndCraftSkillCount++;
            return null;
          }
          if (skillEntry === "Any Science Skill") {
            scienceSkillCount++;
            return null;
          }
          const skillInfo = skillList.skills.find(s => s.name.en === skillEntry);
          return skillInfo ? skillInfo.name[language] || skillInfo.name.en : skillEntry;
        }
        
        if (Array.isArray(skillEntry)) {
          const localizedSkills = skillEntry.map(skill => {
            if (skill === "Art and Craft (Any)") {
              return t.anyArtAndCraftSkills;
            }
            if (skill === "Any Science Skill") {
              return t.anyScienceSkills.replace('{0}', '1');
            }
            const skillInfo = skillList.skills.find(s => s.name.en === skill);
            return skillInfo ? skillInfo.name[language] || skillInfo.name.en : skill;
          });
          return localizedSkills.join(` ${t.or} `);
        }
        return '';
      });

      const finalSkills = processedSkills.filter(Boolean);
      
      if (socialSkillCount > 0) {
        finalSkills.push(t.anyXSocialSkills.replace('{0}', socialSkillCount.toString()));
      }

      if (artAndCraftSkillCount > 0) {
        finalSkills.push(t.anyArtAndCraftSkills.replace('{0}', artAndCraftSkillCount.toString()));
      }

      if (majorSkillCount > 0) {
        finalSkills.push(t.anyMajoringSkill.replace('{0}', majorSkillCount.toString()));
      }
      
      if (anySkillCount > 0) {
        finalSkills.push(t.anyXSkills.replace('{0}', anySkillCount.toString()));
      }

      if (scienceSkillCount > 0) {
        finalSkills.push(t.anyScienceSkills.replace('{0}', scienceSkillCount.toString()));
      }

      formattedSkills = finalSkills.join(', ');
    }
    
    return {
      name: occInfo.name[language] || occInfo.name.en,
      description: occInfo.description[language] || occInfo.description.en,
      credit_rating: `${occInfo.minimum_credit_rating} - ${occInfo.maximum_credit_rating}`,
      attributes: formattedAttributes,
      skills: formattedSkills
    };
  }

  function scrollToSelected(node: HTMLElement) {
    function checkAndScroll() {
      if (isOpen && selectedOccupation) {
        // Small delay to ensure modal is fully rendered
        setTimeout(() => {
          if (node) {
            node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Expand the collapse by checking the radio input
            const radioInput = node.querySelector('input[type="radio"]') as HTMLInputElement;
            if (radioInput) {
              radioInput.checked = true;
            }
          }
        }, 100);
      }
    }

    checkAndScroll();

    return {
      update: checkAndScroll,
      destroy() {} // Cleanup function if needed
    };
  }
</script>

<div 
  class="modal" 
  class:modal-open={isOpen}
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
  <button 
    class="modal-overlay fixed inset-0 bg-black bg-opacity-50" 
    on:click={handleBackdropClick}
    aria-label={t.close}
  />
  <div 
    class="modal-box max-w-2xl overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-base-content/20 hover:scrollbar-thumb-base-content/30" 
    role="document"
  >
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold" id="modal-title">{t.occupation}</h3>
      <button class="btn btn-sm btn-ghost" on:click={() => isOpen = false} aria-label={t.close}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <div class="join join-vertical w-full space-y-2">
      {#each occupations as occupation}
        {@const details = getOccupationDetails(occupation.name.en, currentLanguage)}
        <button 
          class="collapse collapse-arrow join-item border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left w-full"
          use:scrollToSelected
          class:selected={selectedOccupation === details.name}
          class:border-primary={selectedOccupation === details.name}
          on:click={() => {
            if (selectedOccupation === details.name) {
              isOpen = false;
            } else {
              handleSelect(details.name);
            }
          }}
        >
          <div class="collapse-title text-lg font-semibold flex items-center gap-2">
            <div class="flex-1 flex items-center gap-2">
              {details.name}
              {#if selectedOccupation === details.name}
                <span class="badge badge-primary text-xs font-normal">{t.currentlySelected}</span>
              {/if}
            </div>
          </div>
          <div class="collapse-content bg-accent text-black">
            <div class="p-4 space-y-3">
              <p class="text-base">{details.description}</p>
              
              <div class="grid grid-cols-1 gap-2 mt-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-sm uppercase tracking-wide text-accent-content/70">{t.attributes}</span>
                  <span class="text-base mt-1">{details.attributes}</span>
                </div>
                
                <div class="flex flex-col">
                  <span class="font-semibold text-sm uppercase tracking-wide text-accent-content/70">{t.skills}</span>
                  <span class="text-base mt-1">{details.skills}</span>
                </div>
                
                <div class="flex flex-col">
                  <span class="font-semibold text-sm uppercase tracking-wide text-accent-content/70">{t.spendingLevel}</span>
                  <span class="text-base mt-1">{details.credit_rating}</span>
                </div>
              </div>

              <div class="flex justify-end mt-4">
                <button 
                  class="btn" 
                  class:btn-primary={selectedOccupation !== details.name}
                  class:btn-secondary={selectedOccupation === details.name}
                  on:click={() => {
                    if (selectedOccupation === details.name) {
                      isOpen = false;
                    } else {
                      handleSelect(details.name);
                    }
                  }}
                >
                  {selectedOccupation === details.name ? t.close : t.select}
                </button>
              </div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
