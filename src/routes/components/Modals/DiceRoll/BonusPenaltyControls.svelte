<!-- Bonus and Penalty dice controls -->
<script lang="ts">
    import { translations } from '$lib/i18n/translations';
    import { languageStore } from '$lib/stores/languageStore';

    export let penaltyDice: number;
    export let bonusDice: number;
    export let showBonusPenaltyRoll: boolean;
    export let onPenaltyChange: (amount: number) => void;
    export let onBonusChange: (amount: number) => void;
    export let onRollAgain: () => void;

    // Add this derived store
    $: t = $languageStore ? translations[$languageStore] : translations.en;
</script>

<div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
    <div class="join bg-base-200 rounded-lg">
        <button 
            class="join-item btn btn-sm btn-ghost text-error px-2 sm:px-3" 
            on:click={() => onPenaltyChange(-1)} 
            disabled={penaltyDice === 0}
        >-</button>
        <span class="join-item px-2 sm:px-3 py-1 flex items-center font-medium text-error min-w-[80px] justify-center">{penaltyDice} {t.penalty}</span>
        <button 
            class="join-item btn btn-sm btn-ghost text-error px-2 sm:px-3" 
            on:click={() => onPenaltyChange(1)}
        >+</button>
    </div>
    <div class="join bg-base-200 rounded-lg">
        <button 
            class="join-item btn btn-sm btn-ghost text-success px-2 sm:px-3" 
            on:click={() => onBonusChange(-1)} 
            disabled={bonusDice === 0}
        >-</button>
        <span class="join-item px-2 sm:px-3 py-1 flex items-center font-medium text-success min-w-[80px] justify-center">{bonusDice} {t.bonus}</span>
        <button 
            class="join-item btn btn-sm btn-ghost text-success px-2 sm:px-3" 
            on:click={() => onBonusChange(1)}
        >+</button>
    </div>
    {#if showBonusPenaltyRoll}
        <button 
            class="btn btn-sm btn-outline btn-accent w-full sm:w-auto"
            on:click={onRollAgain}
        >
            {penaltyDice > 0 ? t.rollWithPenalty : t.rollWithBonus}
        </button>
    {/if}
</div> 