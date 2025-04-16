<script lang="ts">
    import Skill from './Skill.svelte';
    import { characterStore } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language } from '$lib/i18n/translations';
    import skillList from '$lib/skill_list.json';
    import { writable } from 'svelte/store';

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];

    // Skill tabs
    const skillTabs = ['social', 'knowledge', 'combat', 'life'] as const;
    type SkillTab = typeof skillTabs[number];
    const activeSkillTab = writable<SkillTab>('combat');

    // Helper function to check if a skill is in a category
    function isSkillInCategory(skillName: string, category: string): boolean {
        switch (category) {
            case 'social':
                return skillList.social_skills.includes(skillName);
            case 'knowledge':
                return skillList.knowledge_skills.includes(skillName);
            case 'combat':
                return skillList.combat_skills.includes(skillName);
            case 'life':
                return !skillList.social_skills.includes(skillName) &&
                       !skillList.combat_skills.includes(skillName) &&
                       !skillList.knowledge_skills.includes(skillName);
            default:
                return false;
        }
    }

    // Reactive variable for tab names
    $: tabNames = skillTabs.map(tab => ({
        id: tab,
        name: t[tab]
    }));

    // Reactive variable for filtered and sorted skills
    $: filteredSkills = $characterStore?.skills 
        ? Object.entries($characterStore.skills)
            .filter(([key]) => isSkillInCategory(key, $activeSkillTab))
            .sort(([a, aValue], [b, bValue]) => {
                const aTotal = aValue.basePoint + aValue.occupationPoint + aValue.interestPoint + aValue.growthPoint;
                const bTotal = bValue.basePoint + bValue.occupationPoint + bValue.interestPoint + bValue.growthPoint;
                return bTotal - aTotal;
            })
            .map(([key, value]) => ({
                name: key,
                skill: value
            }))
        : [];
</script>

<div class="card card-xs shadow-sm w-full">
    <div class="tabs tabs-border flex">
        {#each tabNames as { id, name }}
            <button class="tab flex-1 {id === $activeSkillTab ? 'tab-active' : ''}"
                on:click={() => $activeSkillTab = id}
            >
                {name}
            </button>
        {/each}
    </div>
    <div class="card-body bg-base-300">
        {#if $characterStore}
            <div class="tab-content rounded-md bg-base-200 flex flex-col gap-2 h-64 overflow-y-auto p-2">
                {#each filteredSkills as { name, skill }}
                    <Skill 
                        skillName={name}
                        {skill}
                    />
                {/each}
            </div>
        {:else}
            <div class="alert alert-info">
                <div>
                    <span>{t.loadingCharacterData}</span>
                </div>
            </div>
        {/if}
    </div>
</div>