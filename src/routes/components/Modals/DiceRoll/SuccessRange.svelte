<!-- Success range bar component -->
<script lang="ts">
    import { successColors } from '$lib/styles/successColors';

    export let skillValue: number;
    export let total: number;
    export let addToResult: number;
    export let multiplyResult: number;
</script>

<div class="divider mt-4">Success Range</div>
<div class="w-full px-2">
    <!-- Container for both layers -->
    <div class="relative w-full" style="margin: 0 -1%;">
        <!-- Base layer: Success level progress bar -->
        <div class="w-full h-6 rounded-lg flex overflow-hidden">
            <!-- Critical Success: 0-5 -->
            <div class="{successColors.criticalSuccess.progressBar} h-full text-center text-xs font-medium" style="width: 7%">
                <span class="opacity-0">CS</span>
            </div>
            <!-- Extreme Success: 6-skillValue/5 -->
            <div class="{successColors.extremeSuccess.progressBar} h-full text-center text-xs font-medium" 
                style="width: {Math.max(0, Math.floor(skillValue / 5) - 6)}%">
                <span class="opacity-0">ES</span>
            </div>
            <!-- Hard Success: skillValue/5-skillValue/2 -->
            <div class="{successColors.hardSuccess.progressBar} h-full text-center text-xs font-medium" 
                style="width: {Math.max(0, Math.floor(skillValue / 2) - Math.floor(skillValue / 5))}%">
                <span class="opacity-0">HS</span>
            </div>
            <!-- Regular Success: skillValue/2-skillValue -->
            <div class="{successColors.regularSuccess.progressBar} h-full text-center text-xs font-medium" 
                style="width: {Math.max(0, skillValue - Math.floor(skillValue / 2))}%">
                <span class="opacity-0">S</span>
            </div>
            <!-- Failure: skillValue-95 -->
            <div class="{successColors.regularFailure.progressBar} h-full text-center text-xs font-medium" 
                style="width: {Math.max(0, 95 - skillValue)}%">
                <span class="opacity-0">F</span>
            </div>
            <!-- Critical Failure: 96-100 -->
            <div class="{successColors.criticalFailure.progressBar} h-full text-center text-xs font-medium" style="width: 7%">
                <span class="opacity-0">CF</span>
            </div>
        </div>

        <!-- Overlay layer: Position indicator -->
        <div class="absolute inset-0 pointer-events-none">
            <!-- Position indicator -->
            <div class="absolute -top-2 transform -translate-x-1/2" 
                style="left: {Math.min(100, Math.max(0, ((total + addToResult) * multiplyResult) / 100 * 100))}%">
                <div class="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-primary border-r-[6px] border-r-transparent mx-auto"></div>
                <div class="text-xs text-center mt-1">{(total + addToResult) * multiplyResult}</div>
            </div>
        </div>
    </div>
</div> 