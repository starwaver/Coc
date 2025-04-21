<script lang="ts">
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import StatModal from './StatModal.svelte';
    
    // Props for the component
    export let name: string;
    export let value: number;
    export let attributeName: string; // The key used for lookups (e.g., 'str', 'dex')

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];

    // Calculate derived values
    $: halfValue = Math.floor(value / 2);
    $: fifthValue = Math.floor(value / 5);

    // Format the attribute name based on translation if available
    $: displayName = t[attributeName as TranslationKeys] || name;
    
    // Modal state
    let showAttributeModal = false;
    
    function openAttributeModal() {
        showAttributeModal = true;
    }
</script>

<button class="w-full flex items-center gap-2 justify-between hover:ring-2 hover:rounded-md hover:ring-base-300 transition-shadow cursor-pointer" on:click={openAttributeModal}>
    <div class="text-base text-base-content">{displayName}</div>
    <div class="flex items-center">
        <div class="flex items-center gap-1">
            <span class="text-base font-bold text-base-content">{value}</span>
        </div>
    </div>
</button>

<StatModal 
    bind:isOpen={showAttributeModal}
    attributeName={attributeName}
    attribute={{ value, name: displayName }}
/> 