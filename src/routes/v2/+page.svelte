<script lang="ts">
    import AttributeChart from '../components/AttributeChart.svelte';
    import AttributesSection from './components/AttributesSection.svelte';
    import SkillsSection from './components/SkillsSection.svelte';
    import { characterStore } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language } from '$lib/i18n/translations';

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];
</script>

<div class="container mx-auto p-4">
    <AttributesSection />

    <!-- Add Skills Section -->
    <div class="mt-6">
        <SkillsSection />
    </div>
</div> 