<!-- Bonus and Penalty dice controls -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { translations } from '$lib/i18n/translations';
    import { languageStore } from '$lib/stores/languageStore';

    export let penaltyDice: number;
    export let bonusDice: number;
    export let showBonusPenaltyRoll: boolean;

    const dispatch = createEventDispatcher<{
        updatePenalty: number;
        updateBonus: number;
        rollAgain: void;
    }>();

    $: t = $languageStore ? translations[$languageStore] : translations.en;

    function onPenaltyChange(amount: number) {
        dispatch('updatePenalty', amount);
    }

    function onBonusChange(amount: number) {
        dispatch('updateBonus', amount);
    }

    function onRollAgain() {
        dispatch('rollAgain');
    }
</script>

<div class="flex flex-col gap-2">
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
    </div>

    {#if showBonusPenaltyRoll}
        <div class="flex justify-center">
            <button 
                class="btn btn-sm btn-outline {penaltyDice > 0 ? 'btn-error' : 'btn-success'} w-full sm:w-auto"
                on:click={onRollAgain}
            >
                {penaltyDice > 0 ? t.rollWithPenalty : t.rollWithBonus}
            </button>
        </div>
    {/if}
</div> 