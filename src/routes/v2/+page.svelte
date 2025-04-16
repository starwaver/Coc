<script lang="ts">
    import Attribute from '../components/Attribute.svelte';
    import AttributeChart from '../components/AttributeChart.svelte';
    import { characterStore, updateCharacterData } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import type { AttributeType } from '$lib/types';
    import { writable } from 'svelte/store';
    
    // Define the attribute order
    const attributeOrder: Array<keyof AttributeType> = ['str', 'dex', 'int', 'con', 'app', 'pow', 'siz', 'edu', 'luck'];

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];

    // Edit mode store
    const isEditingAttributes = writable(false);

    // Function to update attribute values
    function updateAttributeValue(event: CustomEvent<{ name: keyof AttributeType; value: number }>): void {
        characterStore.update(character => {
            if (character && character.attributes) {
                character.attributes[event.detail.name] = event.detail.value;
                updateCharacterData(character);
            }
            return character;
        });
    }

    // Toggle edit mode
    function toggleAttributesEditMode(save: boolean = true) {
        isEditingAttributes.update(value => !value);
    }

    function cancelAttributesEdit() {
        toggleAttributesEditMode(false);
    }

    // Reactive variable for sorted attribute keys and formatted attributes
    $: sortedAttributes = $characterStore?.attributes 
        ? Object.entries($characterStore.attributes)
            .sort(([a], [b]) => {
                const aKey = a as keyof AttributeType;
                const bKey = b as keyof AttributeType;
                return attributeOrder.indexOf(aKey) - attributeOrder.indexOf(bKey);
            })
            .map(([key, value]) => ({
                key: key as keyof AttributeType,
                name: t[key as TranslationKeys] || key.toUpperCase(),
                value: value
            }))
        : [];
</script>

<div class="container mx-auto p-4">
    <div class="card bg-base-200 shadow-lg">
        <div class="card-body">
            <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 class="card-title text-2xl font-bold text-primary">{t.attributes}</h2>
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
            </div>
            <div class="divider"></div>
            {#if $characterStore}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {#each sortedAttributes as attribute}
                        <Attribute 
                            attribute={{ name: attribute.key, value: attribute.value }} 
                            on:updateValue={updateAttributeValue}
                            isEditing={$isEditingAttributes} 
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

    <!-- Add Attribute Radar Chart -->
    <div class="mt-6">
        <AttributeChart characterData={$characterStore} />
    </div>
</div>

<style>

</style> 