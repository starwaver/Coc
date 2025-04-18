<script lang="ts">
    import AttributesSection from './components/AttributesSection.svelte';
    import SkillsSection from './components/SkillsSection.svelte';
    import StatusSection from './components/StatusSection.svelte';
    import { characterStore } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language } from '$lib/i18n/translations';

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];
</script>

<div class="container flex flex-col gap-4 mb-4">
    <StatusSection />
    <AttributesSection />
    <SkillsSection />
</div> 