<!-- Dice roll display component -->
<script lang="ts">
    import { getSuccessColors } from '$lib/styles/successColors';
    import type { SuccessLevel } from '$lib/styles/successColors';

    export let isRolling: boolean;
    export let rollFrames: (number | string)[];
    export let results: (number | string)[];
    export let allResults: (number | string)[];
    export let total: number;
    export let multiplyResult: number;
    export let addToResult: number;
    export let successLevel: string;
    export let successLevelClass: SuccessLevel;
    export let numberOfFaces: number;
    export let penaltyDice: number;
    export let bonusDice: number;
    export let t: any; // Translation object

    $: colors = getSuccessColors(successLevelClass);
</script>

{#if isRolling}
    <div class="flex flex-wrap gap-2.5 my-2.5 justify-center animate-shake">
        {#each rollFrames as frame}
            <div class="stats bg-base-200 shadow">
                <div class="stat px-5 py-3">
                    <div class="stat-value text-2xl font-mono text-primary">{frame || '?'}</div>
                </div>
            </div>
        {/each}
    </div>
{:else}
    <div class="card-body bg-base-200 rounded-box p-4">
        <div class="flex flex-wrap gap-3 my-3 justify-center">
            {#each results as result}
                <div class="stats shadow {colors.bg} {colors.shadow}">
                    <div class="stat px-5 py-3">
                        <div class="stat-value text-2xl font-mono {colors.text} {colors.animation || ''}">{result}</div>
                    </div>
                </div>
            {/each}
        </div>
        {#if allResults.length > 1}
            <div class="card bg-base-100 my-3 p-2 text-sm compact shadow">
                <div class="card-body p-2">
                    {#if numberOfFaces === 100 && (penaltyDice > 0 || bonusDice > 0)}
                        <p class="text-center mb-1">
                            {penaltyDice > 0 ? t.penalty : t.bonus} {t.allRolls}
                            ({penaltyDice > 0 ? t.usingHighest : t.usingLowest})
                        </p>
                        <div class="flex justify-center flex-wrap gap-1">
                            {#each allResults as result, i}
                                <span class="badge {
                                    result === results[0] && bonusDice > 0 ? 'badge-info' : 
                                    result === results[0] && penaltyDice > 0 ? 'badge-warning' : 
                                    result === results[0] ? 'badge-neutral' : 'badge-ghost'
                                } badge-md">
                                    {result}
                                </span>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-center mb-1">{t.allRolls}</p>
                        <div class="flex justify-center flex-wrap gap-1">
                            {#each allResults as result, i}
                                <span class="badge {result === results[0] ? 'badge-neutral' : 'badge-ghost'} badge-md">
                                    {result}
                                </span>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
        <div class="stats shadow mt-3">
            <div class="stat">
                <div class="stat-title">{t.diceTotal}</div>
                <div class="stat-value">{total}</div>
                {#if multiplyResult !== 1 || addToResult !== 0}
                    <div class="stat-desc text-lg font-semibold">
                        {t.finalResult}: {(total + addToResult) * multiplyResult}
                    </div>
                {/if}
            </div>
            
            {#if successLevel}
                <div class="stat {colors.stats}">
                    <div class="stat-title">Result</div>
                    <div class="stat-value text-lg {colors.text} {colors.animation || ''}">
                        {successLevel}
                        {#if successLevel === t.criticalSuccess || successLevel === t.criticalFailure}
                            <div class="absolute inset-0 pointer-events-none opacity-30 {
                                successLevel === t.criticalSuccess ? 'animate-[pulse-gold_2s_infinite]' : 
                                'animate-[pulse-red_2s_infinite]'
                            }"></div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    @keyframes shake {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-5px) rotate(-5deg); }
        75% { transform: translateY(5px) rotate(5deg); }
    }

    @keyframes glow {
        0%, 100% { text-shadow: 0 0 10px #ffd700; }
        50% { text-shadow: 0 0 20px #ffd700, 0 0 30px #ffd700; }
    }

    @keyframes shake-hard {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px) rotate(-2deg); }
        75% { transform: translateX(4px) rotate(2deg); }
    }

    @keyframes pulse-gold {
        0% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.2; }
        100% { transform: scale(1); opacity: 0.5; }
    }

    @keyframes pulse-red {
        0% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.2; }
        100% { transform: scale(1); opacity: 0.5; }
    }

    .animate-shake {
        animation: shake 0.5s infinite;
    }

    .animate-glow {
        animation: glow 1.5s infinite;
    }

    .animate-shake-hard {
        animation: shake-hard 0.5s infinite;
    }

    .animate-pulse-gold {
        animation: pulse-gold 2s infinite;
    }

    .animate-pulse-red {
        animation: pulse-red 2s infinite;
    }
</style> 