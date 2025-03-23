<!-- Manual roll input component -->
<script lang="ts">
    import { translations } from '$lib/i18n/translations';
    import { languageStore } from '$lib/stores/languageStore';

    export let showManualInput: boolean;
    export let manualRollInput: string;
    export let onManualRoll: () => void;
    export let onToggleManualInput: () => void;

    $: t = $languageStore ? translations[$languageStore] : translations.en;
</script>

<button 
    class="btn btn-ghost btn-sm mt-2 w-full sm:w-auto text-sm sm:text-base"
    on:click={onToggleManualInput}
>
    🎲 {t.manualRoll}
</button>

{#if showManualInput}
    <div class="mt-2 sm:mt-3 flex flex-col sm:flex-row gap-2 justify-center items-stretch sm:items-center">
        <input
            type="number"
            min="1"
            max="100"
            bind:value={manualRollInput}
            placeholder={t.enterRoll}
            class="input input-bordered w-full sm:w-[150px] text-sm sm:text-base"
            on:keydown={(e) => e.key === 'Enter' && onManualRoll()}
        />
        <button 
            class="btn btn-primary w-full sm:w-auto text-sm sm:text-base"
            on:click={onManualRoll}
        >
            {t.apply}
        </button>
    </div>
{/if} 