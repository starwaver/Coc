<script lang="ts">
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import type { SkillType } from '$lib/types';

    export let skillName: string;
    export let skill: SkillType;

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];

    // Calculate total value
    $: value = skill.basePoint + skill.occupationPoint + skill.interestPoint + skill.growthPoint;

    // Calculate derived values
    $: halfValue = Math.floor(value / 2);
    $: fifthValue = Math.floor(value / 5);

    // Format the skill name based on translation if available
    $: displayName = skill.name[currentLanguage] || t[skillName as TranslationKeys] || skillName;
</script>

<div class="w-full flex px-3 items-center justify-between hover:ring-2 hover:rounded-md hover:ring-base-300 transition-shadow">
    <div class="text-base text-base-content">{displayName}</div>
    <div class="flex items-center">
        <div class="flex items-center gap-1">
            <span class="text-base font-bold text-base-content">{value}</span>
            <span class="text-base-content/60">|</span>
            <span class="text-base text-base-content">{halfValue}</span>
            <span class="text-base-content/60">|</span>
            <span class="text-base text-base-content">{fifthValue}</span>
        </div>
    </div>
</div>