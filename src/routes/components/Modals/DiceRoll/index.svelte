<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { translations } from '$lib/i18n/translations';
    import { languageStore } from '$lib/stores/languageStore';
    import type { SuccessLevel } from '$lib/styles/successColors';
    import SuccessRange from './SuccessRange.svelte';
    import BonusPenaltyControls from './BonusPenaltyControls.svelte';
    import DiceDisplay from './DiceDisplay.svelte';
    import ManualInput from './ManualInput.svelte';

    type RollEvent = {
        total: number;
        rolls: (number | string)[];
        successLevel: string;
        hasSucceeded: boolean;
    };

    const dispatch = createEventDispatcher<{
        roll: RollEvent;
        close: void;
    }>();

    export let showModal = false;
    export let defaultDice = "3d6";
    export let multiplyResult = 5;
    export let addToResult = 0;
    export let skillValue: number | undefined = undefined;
    export let penaltyDice = 0;
    export let bonusDice = 0;

    let numberOfDice = 3;
    let numberOfFaces = 6;
    let results: (number | string)[] = [];
    let allResults: (number | string)[] = [];
    let total = 0;
    let isRolling = false;
    let showConfirm = false;
    let successLevel = '';
    let manualRollInput = '';
    let showManualInput = false;

    // Animation frames for rolling effect
    let rollFrames: (number | string)[] = [];
    let animationFrame: number | null = null;
    let rollStartTime: number | null = null;
    const ROLL_DURATION = 1000; // 1 second roll animation

    // Add this derived store
    $: t = $languageStore ? translations[$languageStore] : translations.en;

    // Add these variables after the existing ones
    let initialRoll: { tens: number; ones: number; total: number } | null = null;
    let showBonusPenaltyRoll = false;

    // Calculate success level class
    $: successLevelClass = (successLevel === t.criticalSuccess ? 'criticalSuccess' :
                           successLevel === t.criticalFailure ? 'criticalFailure' :
                           successLevel === t.extremeSuccess ? 'extremeSuccess' :
                           successLevel === t.hardSuccess ? 'hardSuccess' :
                           successLevel === t.regularSuccess ? 'regularSuccess' :
                           'regularFailure') as SuccessLevel;

    function rollDie(faces: number): number {
        return Math.floor(Math.random() * faces) + 1;
    }

    function rollD100(): number {
        return Math.floor(Math.random() * 100) + 1;
    }

    function rollD10(): number {
        return Math.floor(Math.random() * 10);
    }

    function rollPercentile(): { tens: number; ones: number; total: number } {
        const tens = rollD10();
        const ones = rollD10();
        // Handle 00-0 as 100
        const total = (tens === 0 && ones === 0) ? 100 : tens * 10 + ones;
        return { tens, ones, total };
    }

    function rollWithPenaltyBonus(): { 
        tensDigits: number[];
        ones: number; 
        selectedTens: number;
        total: number 
    } {
        // Roll multiple tens dice based on penalty/bonus count plus one base die
        const numTensDice = Math.max(penaltyDice, bonusDice) + 1;
        const tensDigits = Array(numTensDice).fill(0).map(() => rollD10());
        const ones = rollD10();
        
        // For penalty die, take the highest tens
        // For bonus die, take the lowest tens
        const selectedTens = penaltyDice > 0 
            ? Math.max(...tensDigits)
            : Math.min(...tensDigits);
        
        // Handle 00-0 as 100
        const total = (selectedTens === 0 && ones === 0) ? 100 : selectedTens * 10 + ones;
        
        return { tensDigits, ones, selectedTens, total };
    }

    function rollDice() {
        isRolling = true;
        showConfirm = false;
        results = [];
        allResults = [];
        total = 0;
        successLevel = '';
        rollStartTime = null;
        initialRoll = null;

        // Start rolling animation
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(animateRoll);
    }

    function startBonusPenaltyRoll() {
        if (!initialRoll) return; // Safety check
        
        isRolling = true;
        showConfirm = false;
        rollStartTime = null;
        
        // Start rolling animation
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(animateRoll);
    }

    function animateRoll(timestamp: number) {
        if (!rollStartTime) rollStartTime = timestamp;
        const progress = timestamp - rollStartTime;

        if (progress < ROLL_DURATION) {
            // Update rolling animation
            if (numberOfFaces === 100) {
                // For d100, show random two-digit numbers during animation
                rollFrames = [Math.floor(Math.random() * 100).toString().padStart(2, '0')];
            } else {
                rollFrames = Array(numberOfDice).fill(0).map(() => rollDie(numberOfFaces));
            }
            animationFrame = requestAnimationFrame(animateRoll);
        } else {
            // Finish rolling
            finishRoll();
        }
    }

    function finishRoll() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        
        isRolling = false;

        // For d100 rolls
        if (numberOfFaces === 100) {
            if (!initialRoll || !showBonusPenaltyRoll) {
                // Complete roll (either first roll or reroll)
                const roll = rollPercentile();
                initialRoll = roll;
                
                if (penaltyDice > 0 || bonusDice > 0) {
                    // Roll additional tens dice
                    const numTensDice = Math.max(penaltyDice, bonusDice);
                    const additionalTens = Array(numTensDice).fill(0).map(() => rollD10());
                    const allTens = [roll.tens, ...additionalTens];
                    
                    // Select appropriate tens digit
                    const selectedTens = penaltyDice > 0 
                        ? Math.max(...allTens)
                        : Math.min(...allTens);
                    
                    total = (selectedTens === 0 && roll.ones === 0) ? 100 : selectedTens * 10 + roll.ones;
                    
                    // Format all results
                    allResults = allTens.map(tens => `${tens}${roll.ones}`);
                    results = [`${selectedTens}${roll.ones}`];
                } else {
                    // No bonus/penalty dice
                    total = roll.total;
                    results = [`${roll.tens}${roll.ones}`];
                    allResults = results;
                }
            } else if (initialRoll) {
                // Only rerolling bonus/penalty dice
                const numTensDice = Math.max(penaltyDice, bonusDice);
                const additionalTens = Array(numTensDice).fill(0).map(() => rollD10());
                const allTens = [initialRoll.tens, ...additionalTens];
                
                // Select appropriate tens digit
                const selectedTens = penaltyDice > 0 
                    ? Math.max(...allTens)
                    : Math.min(...allTens);
                
                const ones = initialRoll.ones;
                total = (selectedTens === 0 && ones === 0) ? 100 : selectedTens * 10 + ones;
                
                // Format all results
                allResults = allTens.map(tens => `${tens}${ones}`);
                results = [`${selectedTens}${ones}`];
            }

            // Show bonus/penalty roll button if needed
            showBonusPenaltyRoll = penaltyDice > 0 || bonusDice > 0;
        } else {
            // Normal dice rolling for non-d100
            const numericResults = Array(numberOfDice).fill(0).map(() => rollDie(numberOfFaces));
            results = numericResults;
            total = numericResults.reduce((sum, val) => sum + val, 0);
            allResults = numericResults;
        }
        
        const finalTotal = (total + addToResult) * multiplyResult;

        // Calculate success level if skillValue is provided
        if (skillValue !== undefined) {
            if (finalTotal <= 5) {
                successLevel = t.criticalSuccess;
            } else if (finalTotal <= Math.floor(skillValue / 5)) {
                successLevel = t.extremeSuccess;
            } else if (finalTotal <= Math.floor(skillValue / 2)) {
                successLevel = t.hardSuccess;
            } else if (finalTotal <= skillValue) {
                successLevel = t.regularSuccess;
            } else if (finalTotal >= 96) {
                successLevel = t.criticalFailure;
            } else {
                successLevel = t.regularFailure;
            }
        }

        showConfirm = true;
    }

    function confirmRoll() {
        const finalResult = (total + addToResult) * multiplyResult;
        const hasSucceeded = successLevel !== t.regularFailure && successLevel !== t.criticalFailure;
        dispatch('roll', { 
            total: finalResult, 
            rolls: results, 
            successLevel,
            hasSucceeded 
        });
        closeModal();
    }

    function closeModal() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        showModal = false;
        dispatch('close');
    }

    function handleManualRoll() {
        const manualValue = parseInt(manualRollInput);
        if (!isNaN(manualValue) && manualValue >= 1 && manualValue <= 100) {
            isRolling = false;
            // Format the manual value as a two-digit string
            const formattedValue = manualValue.toString().padStart(2, '0');
            results = [formattedValue];
            allResults = [formattedValue];
            total = manualValue;
            const finalTotal = (total + addToResult) * multiplyResult;

            // Calculate success level if skillValue is provided
            if (skillValue !== undefined) {
                if (finalTotal <= 5) {
                    successLevel = t.criticalSuccess;
                } else if (finalTotal <= Math.floor(skillValue / 5)) {
                    successLevel = t.extremeSuccess;
                } else if (finalTotal <= Math.floor(skillValue / 2)) {
                    successLevel = t.hardSuccess;
                } else if (finalTotal <= skillValue) {
                    successLevel = t.regularSuccess;
                } else if (finalTotal >= 96) {
                    successLevel = t.criticalFailure;
                } else {
                    successLevel = t.regularFailure;
                }
            }
            showConfirm = true;
            showManualInput = false;
            manualRollInput = '';
        }
    }

    function adjustPenaltyDice(amount: number) {
        if (penaltyDice + amount >= 0) {
            penaltyDice += amount;
            bonusDice = 0; // Reset bonus dice when adding penalty dice
            showBonusPenaltyRoll = penaltyDice > 0 && initialRoll !== null;
        }
    }

    function adjustBonusDice(amount: number) {
        if (bonusDice + amount >= 0) {
            bonusDice += amount;
            penaltyDice = 0; // Reset penalty dice when adding bonus dice
            showBonusPenaltyRoll = bonusDice > 0 && initialRoll !== null;
        }
    }

    // Set initial dice configuration based on defaultDice prop
    $: {
        const match = defaultDice.toLowerCase().match(/(\d+)d(\d+)/);
        if (match) {
            numberOfDice = parseInt(match[1]);
            numberOfFaces = parseInt(match[2]);
        }
    }

    // Start rolling when modal opens
    $: if (showModal) {
        rollDice();
    }

    // Update the reactive statement to check for zero values
    $: if (initialRoll) {
        showBonusPenaltyRoll = penaltyDice > 0 || bonusDice > 0;
    }
</script>

{#if showModal}
    <div class="modal modal-open">
        <div class="modal-box bg-base-300 relative w-[98vw] sm:w-[95vw] max-w-3xl min-h-[50vh] max-h-[95vh] mx-auto p-2 sm:p-5 overflow-auto" role="dialog" aria-modal="true">
            <!-- Close button -->
            <button 
                class="btn btn-sm btn-circle absolute right-1 top-1 sm:right-2 sm:top-2 z-10" 
                on:click={closeModal}
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <div class="flex flex-col h-full">
                <h3 class="font-bold text-base sm:text-lg mb-2 sm:mb-4 pr-6 sm:pr-8 text-center">
                    {t.rolling} {numberOfDice}d{numberOfFaces} 
                    {#if multiplyResult !== 1}× {multiplyResult}{/if} 
                    {#if addToResult !== 0}+ {addToResult}{/if}
                </h3>
                
                <div class="grid grid-cols-1 items-start gap-2 sm:gap-4 mb-2 sm:mb-4">
                    {#if numberOfFaces === 100}
                        <BonusPenaltyControls
                            {penaltyDice}
                            {bonusDice}
                            {showBonusPenaltyRoll}
                            onPenaltyChange={adjustPenaltyDice}
                            onBonusChange={adjustBonusDice}
                            onRollAgain={startBonusPenaltyRoll}
                        />
                    {/if}
                </div>
                
                <div class="flex-grow">
                    <div class="card bg-base-300 shadow-lg p-2 sm:p-5 text-center h-full">
                        <DiceDisplay
                            {isRolling}
                            {rollFrames}
                            {results}
                            {allResults}
                            {total}
                            {multiplyResult}
                            {addToResult}
                            {successLevel}
                            {successLevelClass}
                            {numberOfFaces}
                            {penaltyDice}
                            {bonusDice}
                            {t}
                        />

                        {#if skillValue !== undefined}
                            <SuccessRange
                                {skillValue}
                                {total}
                                {addToResult}
                                {multiplyResult}
                            />
                        {/if}

                        {#if showConfirm}
                            <div class="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-5 justify-center items-stretch sm:items-center">
                                <button 
                                    class="btn btn-neutral w-full sm:flex-1 sm:max-w-[200px]" 
                                    on:click={rollDice}
                                >
                                    {t.rollAgain}
                                </button>
                                <button 
                                    class="btn btn-primary w-full sm:flex-1 sm:max-w-[200px]" 
                                    on:click={confirmRoll}
                                >
                                    {t.confirm}
                                </button>
                            </div>

                            <ManualInput
                                {showManualInput}
                                {manualRollInput}
                                onManualRoll={handleManualRoll}
                                onToggleManualInput={() => showManualInput = !showManualInput}
                            />
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Keep only the modal-specific animations */
    @keyframes shake {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-5px) rotate(-5deg); }
        75% { transform: translateY(5px) rotate(5deg); }
    }

    :global(.modal-box) {
        margin: 0.5rem !important;
    }
</style>
