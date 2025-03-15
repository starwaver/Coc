<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { translations } from '$lib/i18n/translations';
    import { languageStore } from '$lib/stores/languageStore';

    const dispatch = createEventDispatcher();

    export let showModal = false;
    export let defaultDice = "3d6";
    export let multiplyResult = 5;
    export let addToResult = 0;
    export let skillValue: number | undefined = undefined;
    export let penaltyDice = 0;
    export let bonusDice = 0;

    let numberOfDice = 3;
    let numberOfFaces = 6;
    let results: number[] = [];
    let allResults: number[] = [];
    let total = 0;
    let isRolling = false;
    let showConfirm = false;
    let successLevel = '';
    let manualRollInput = '';
    let showManualInput = false;

    // Animation frames for rolling effect
    let rollFrames: number[] = [];
    let animationFrame: number | null = null;
    let rollStartTime: number | null = null;
    const ROLL_DURATION = 1000; // 1 second roll animation

    // Add this derived store
    $: t = $languageStore ? translations[$languageStore] : translations.en;

    // Add these variables after the existing ones
    let initialRoll: { tens: number; ones: number; total: number } | null = null;
    let showBonusPenaltyRoll = false;

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
            } else {
                // Only rerolling bonus/penalty dice
                const numTensDice = Math.max(penaltyDice, bonusDice);
                const additionalTens = Array(numTensDice).fill(0).map(() => rollD10());
                const allTens = [initialRoll.tens, ...additionalTens];
                
                // Select appropriate tens digit
                const selectedTens = penaltyDice > 0 
                    ? Math.max(...allTens)
                    : Math.min(...allTens);
                
                total = (selectedTens === 0 && initialRoll.ones === 0) ? 100 : selectedTens * 10 + initialRoll.ones;
                
                // Format all results
                allResults = allTens.map(tens => `${tens}${initialRoll.ones}`);
                results = [`${selectedTens}${initialRoll.ones}`];
            }

            // Show bonus/penalty roll button if needed
            showBonusPenaltyRoll = penaltyDice > 0 || bonusDice > 0;
        } else {
            // Normal dice rolling for non-d100
            results = Array(numberOfDice).fill(0).map(() => rollDie(numberOfFaces));
            total = results.reduce((sum, val) => sum + val, 0);
            allResults = results;
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

    $: successLevelClass = successLevel === t.criticalSuccess ? 'critical-success' :
                          successLevel === t.criticalFailure ? 'critical-failure' :
                          successLevel === t.extremeSuccess ? 'extreme-success' :
                          successLevel === t.hardSuccess ? 'hard-success' :
                          successLevel === t.regularSuccess ? 'regular-success' :
                          'regular-failure';

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
    <div class="modal-backdrop" on:click={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
                <h2>
                    {t.rolling} {numberOfDice}d{numberOfFaces} 
                    {#if multiplyResult !== 1}× {multiplyResult}{/if} 
                    {#if addToResult !== 0}+ {addToResult}{/if}
                </h2>
                {#if numberOfFaces === 100}
                    <div class="dice-controls">
                        <div class="dice-control penalty">
                            <button class="control-button" on:click={() => adjustPenaltyDice(-1)} disabled={penaltyDice === 0}>-</button>
                            <span class="dice-count">{penaltyDice} {t.penalty}</span>
                            <button class="control-button" on:click={() => adjustPenaltyDice(1)}>+</button>
                        </div>
                        <div class="dice-control bonus">
                            <button class="control-button" on:click={() => adjustBonusDice(-1)} disabled={bonusDice === 0}>-</button>
                            <span class="dice-count">{bonusDice} {t.bonus}</span>
                            <button class="control-button" on:click={() => adjustBonusDice(1)}>+</button>
                        </div>
                        {#if showBonusPenaltyRoll}
                            <button 
                                class="roll-bonus-penalty-button"
                                on:click={startBonusPenaltyRoll}
                            >
                                {penaltyDice > 0 ? t.rollWithPenalty : t.rollWithBonus}
                            </button>
                        {/if}
                    </div>
                {/if}
                <button class="close-button" on:click={closeModal}>×</button>
            </div>
            
            <div class="modal-body">
                <div class="dice-container">
                    {#if isRolling}
                        <div class="dice-results rolling">
                            {#each rollFrames as frame}
                                <span class="dice-result">{frame || '?'}</span>
                            {/each}
                        </div>
                    {:else}
                        <div class="results">
                            <div class="dice-results">
                                {#each results as result}
                                    <span class="dice-result {successLevelClass}">{result}</span>
                                {/each}
                            </div>
                            {#if allResults.length > 1}
                                <div class="all-results">
                                    {#if numberOfFaces === 100 && (penaltyDice > 0 || bonusDice > 0)}
                                        {penaltyDice > 0 ? t.penalty : t.bonus} {t.allRolls}
                                        ({penaltyDice > 0 ? t.usingHighest : t.usingLowest}): 
                                        {#each allResults as result, i}
                                            <span 
                                                class="small-result" 
                                                class:selected={result === results[0]}
                                                class:best={bonusDice > 0 && result === results[0]}
                                                class:worst={penaltyDice > 0 && result === results[0]}
                                            >
                                                {result}
                                            </span>
                                            {#if i < allResults.length - 1}
                                                <span class="dice-separator">|</span>
                                            {/if}
                                        {/each}
                                    {:else}
                                        {t.allRolls}: 
                                        {#each allResults as result, i}
                                            <span class="small-result" class:selected={result === results[0]}>
                                                {result}{#if i < allResults.length - 1}, {/if}
                                            </span>
                                        {/each}
                                    {/if}
                                </div>
                            {/if}
                            <div class="total">
                                {t.diceTotal}: {total}
                                {#if multiplyResult !== 1 || addToResult !== 0}
                                    <br>
                                    {t.finalResult}: {(total + addToResult) * multiplyResult}
                                {/if}
                                {#if successLevel}
                                    <div class="success-level {successLevelClass}">
                                        {successLevel}
                                        {#if successLevel === t.criticalSuccess || successLevel === t.criticalFailure}
                                            <div class="special-effect"></div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    {#if showConfirm}
                        <div class="button-group">
                            <button 
                                class="roll-button secondary" 
                                on:click={rollDice}
                            >
                                {t.rollAgain}
                            </button>
                            <button 
                                class="roll-button" 
                                on:click={confirmRoll}
                            >
                                {t.confirm}
                            </button>
                        </div>
                        <button 
                            class="manual-roll-button"
                            on:click={() => showManualInput = !showManualInput}
                        >
                            🎲 {t.manualRoll}
                        </button>
                    {/if}

                    {#if showManualInput}
                        <div class="manual-input-container">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                bind:value={manualRollInput}
                                placeholder={t.enterRoll}
                                on:keydown={(e) => e.key === 'Enter' && handleManualRoll()}
                            />
                            <button 
                                class="roll-button"
                                on:click={handleManualRoll}
                            >
                                {t.apply}
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: #2a2a2a;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        color: #fff;
    }

    .modal-header {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: start;
        margin-bottom: 20px;
        gap: 10px;
    }

    .modal-header h2 {
        margin: 0;
        color: #fff;
        font-size: 1.5em;
        grid-column: 1;
    }

    .dice-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 20px;
        grid-column: 2;
        min-height: 40px;
        position: relative;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #fff;
        grid-column: 3;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dice-container {
        padding: 40px 20px;
        background: #2a2a2a;
        border-radius: 8px;
        text-align: center;
    }

    .results {
        margin-top: 20px;
        padding: 15px;
        background: #3a3a3a;
        border-radius: 4px;
        color: #fff;
    }

    .dice-results {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 10px 0;
        justify-content: center;
    }

    .dice-results.rolling .dice-result {
        animation: shake 0.5s infinite;
    }

    .dice-result {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 60px;
        background: #2a2a2a;
        border: 2px solid #4CAF50;
        border-radius: 12px;
        font-weight: bold;
        color: #00cc66;
        font-size: 1.5em;
        transition: transform 0.2s;
        font-family: monospace;
    }

    @keyframes shake {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-5px) rotate(-5deg); }
        75% { transform: translateY(5px) rotate(5deg); }
    }

    .total {
        margin-top: 15px;
        font-weight: bold;
        color: #00cc66;
        text-align: right;
        font-size: 1.1em;
    }

    .button-group {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        justify-content: center;
    }

    .roll-button {
        flex: 1;
        max-width: 200px;
        padding: 12px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s;
    }

    .roll-button.secondary {
        background: #666;
    }

    .roll-button:hover {
        background: #45a049;
        transform: translateY(-2px);
    }

    .roll-button.secondary:hover {
        background: #777;
        transform: translateY(-2px);
    }

    .roll-button:active {
        transform: translateY(0);
    }

    .success-level {
        margin-top: 10px;
        padding: 8px;
        background: #3a3a3a;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .critical-success {
        color: #ffd700;
        border-color: #ffd700;
        animation: glow 1.5s infinite;
    }

    .critical-failure {
        color: #ff4444;
        border-color: #ff4444;
        animation: shake-hard 0.5s infinite;
    }

    .extreme-success {
        color: #00ffcc;
        border-color: #00ffcc;
    }

    .hard-success {
        color: #00cc66;
        border-color: #00cc66;
    }

    .regular-success {
        color: #4CAF50;
        border-color: #4CAF50;
    }

    .regular-failure {
        color: #ff9966;
        border-color: #ff9966;
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

    .special-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .critical-success .special-effect {
        background: radial-gradient(circle, transparent 30%, rgba(255, 215, 0, 0.1) 100%);
        animation: pulse-gold 2s infinite;
    }

    .critical-failure .special-effect {
        background: radial-gradient(circle, transparent 30%, rgba(255, 0, 0, 0.1) 100%);
        animation: pulse-red 2s infinite;
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

    .manual-roll-button {
        margin-top: 10px;
        background: none;
        border: 1px solid #666;
        color: #ccc;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.2s;
    }

    .manual-roll-button:hover {
        background: #444;
        border-color: #888;
    }

    .manual-input-container {
        margin-top: 10px;
        display: flex;
        gap: 10px;
        justify-content: center;
        align-items: center;
    }

    .manual-input-container input {
        background: #444;
        border: 1px solid #666;
        color: #fff;
        padding: 8px;
        border-radius: 4px;
        width: 150px;
        font-size: 1em;
    }

    .manual-input-container input:focus {
        outline: none;
        border-color: #00cc66;
    }

    .dice-result.critical-success,
    .dice-result.critical-failure,
    .dice-result.extreme-success,
    .dice-result.hard-success,
    .dice-result.regular-success,
    .dice-result.regular-failure {
        border-color: currentColor;
    }

    .dice-control {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #3a3a3a;
        padding: 4px 8px;
        border-radius: 4px;
        height: 32px; /* Fixed height for consistency */
    }

    .dice-control.penalty {
        color: #ff9966;
    }

    .dice-control.bonus {
        color: #00ffcc;
    }

    .control-button {
        background: none;
        border: 1px solid currentColor;
        color: inherit;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transition: all 0.2s;
    }

    .control-button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
    }

    .control-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .dice-count {
        min-width: 80px;
        text-align: center;
        font-weight: bold;
    }

    .all-results {
        margin: 10px 0;
        font-size: 0.9em;
        color: #888;
        text-align: center;
        padding: 8px;
        background: #2a2a2a;
        border-radius: 4px;
    }

    .small-result {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        transition: all 0.2s;
        min-width: 24px;
    }

    .small-result.selected {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-weight: bold;
    }

    .dice-separator {
        margin: 0 8px;
        color: #666;
        font-weight: bold;
    }

    .small-result.best {
        color: #00ffcc;
        border-color: #00ffcc;
        background: rgba(0, 255, 204, 0.1);
    }

    .small-result.worst {
        color: #ff9966;
        border-color: #ff9966;
        background: rgba(255, 153, 102, 0.1);
    }

    .roll-bonus-penalty-button {
        background: #3a3a3a;
        border: 1px solid currentColor;
        color: #00cc66;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
        height: 32px;
        white-space: nowrap;
        margin-left: 8px;
    }

    .roll-bonus-penalty-button:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
    }

    .roll-bonus-penalty-button:active {
        transform: translateY(0);
    }
</style>
