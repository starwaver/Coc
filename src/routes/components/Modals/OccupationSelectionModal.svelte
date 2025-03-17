<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { translations, type Language } from '$lib/i18n/translations';
  import { languageStore } from '$lib/stores/languageStore';
  import occupationList from '$lib/occupation_list.json';
  import skillList from '$lib/skill_list.json';
  
  $: currentLanguage = $languageStore;

  $: t = translations[currentLanguage];

  export let selectedOccupation: string = '';

  const dispatch = createEventDispatcher();

  const occupations = occupationList.occupations;

  let occupationModal: HTMLDialogElement | null = null;

  function openOccupationModal() {
    occupationModal?.showModal();
  }

  type OccupationSkill = string | string[];

  export function getLocalizedOccupation(occKey: string) {
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
</script>

<div class="join items-center justify-between w-full h-8">
  <span class="w-full text-sm">{selectedOccupation || t.occupation}</span>
  <button class="btn btn-primary btn-xs" on:click={openOccupationModal}>{t.select}</button>
  <dialog id="my_modal_1" class="modal" bind:this={occupationModal}>
    <div class="modal-box max-w-2xl">
      <h3 class="text-xl font-bold mb-4">{t.occupation}</h3>
      <div class="join join-vertical w-full space-y-2">
        {#each occupations as occupation}
          {@const details = getOccupationDetails(occupation.name.en, currentLanguage)}
          <div class="collapse collapse-arrow join-item border border-base-300 rounded-lg hover:bg-base-200 transition-colors">
            <input type="radio" name="my-accordion-4" on:change={() => selectedOccupation = details.name} />
            <div class="collapse-title text-lg font-semibold">
              {details.name}
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
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</div>
