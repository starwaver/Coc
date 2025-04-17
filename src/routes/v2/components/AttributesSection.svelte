<script lang="ts">
    import { characterStore, updateCharacterData } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import type { AttributeType } from '$lib/types';
    import { writable } from 'svelte/store';

    // Define the attribute order to match the image
    // Attributes are arranged clockwise starting from top-right
    const attributeOrder: Array<keyof AttributeType> = ['edu', 'app', 'pow', 'int', 'dex', 'siz', 'con', 'str'];

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];

    // SVG dimensions and calculations
    const width = 200;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    
    // Angle offset to rotate the entire chart (in radians)
    // Rotate by 22.5 degrees (π/8 radians) to align with the reference image
    const angleOffset = Math.PI / 8;

    // Calculate points for the spider chart
    $: calculatePoints = (attributes: Record<string, number>) => {
        if (!t || !attributes) return [];
        
        const points = [];
        const totalAttributes = attributeOrder.length;

        for (let i = 0; i < totalAttributes; i++) {
            const attr = attributeOrder[i];
            const value = attributes[attr] || 0;
            // Start at -π/2 + angleOffset and go clockwise
            const angle = (i / totalAttributes) * Math.PI * 2 - Math.PI / 2 + angleOffset;
            const scaledRadius = (value / 100) * radius;
            const x = centerX + scaledRadius * Math.cos(angle);
            const y = centerY + scaledRadius * Math.sin(angle);
            
            // Calculate label positions with improved placement
            const labelRadius = radius + 40; // Increased from 35 to 40
            let labelX = centerX + labelRadius * Math.cos(angle);
            let labelY = centerY + labelRadius * Math.sin(angle);
            
            // Adjust positions for edges
            if (labelX < 20) labelX = 20; // Left margin
            if (labelX > width - 20) labelX = width - 20; // Right margin
            if (labelY < 20) labelY = 20; // Top margin
            if (labelY > height - 20) labelY = height - 20; // Bottom margin
            
            // Safely get the translation or use a fallback
            const translation = attr && t && t[attr as TranslationKeys] ? t[attr as TranslationKeys] : String(attr).toUpperCase();
            
            // For value placement - avoid overlap with attribute names
            let valueOffset = 15;
            // Adjust value positioning based on angle to avoid overlap
            if (Math.abs(Math.sin(angle)) > 0.7) {
                valueOffset = 25; // More vertical separation when labels are top/bottom
            }
            
            const valueX = centerX + (radius + valueOffset) * Math.cos(angle);
            const valueY = centerY + (radius + valueOffset) * Math.sin(angle);
            
            points.push({ 
                x, y, 
                name: translation, 
                value,
                labelX,
                labelY,
                angle,
                // Determine text anchor based on position
                textAnchor: Math.abs(Math.cos(angle)) < 0.3 ? "middle" : 
                           Math.cos(angle) < 0 ? "end" : "start",
                // Determine vertical alignment based on position
                dy: Math.sin(angle) > 0.8 ? "1.2em" : 
                    Math.sin(angle) < -0.8 ? "-0.5em" : "0.4em",
                // For value placement
                valueX,
                valueY
            });
        }

        return points;
    };

    // Create circles for value indicators
    function getCirclePaths() {
        return Array(5).fill(null).map((_, i) => {
            const circleRadius = (radius / 5) * (i + 1);
            return `M ${centerX - circleRadius} ${centerY} ` +
                  `a ${circleRadius} ${circleRadius} 0 1 0 ${circleRadius * 2} 0 ` +
                  `a ${circleRadius} ${circleRadius} 0 1 0 -${circleRadius * 2} 0`;
        });
    }

    // Update reactive declarations
    $: chartPoints = $characterStore?.attributes && t ? calculatePoints($characterStore.attributes) : [];
    $: circlePaths = getCirclePaths();
    $: polygonPoints = chartPoints.length > 0 ? chartPoints.map(p => `${p.x},${p.y}`).join(' ') : '';
</script>

<div class="card card-xs shadow-sm w-full">
    <div class="card-body">
        {#if $characterStore && t}
            <div class="flex flex-col items-center">
                <!-- Spider Chart with Overlaid Labels -->
                <div class="flex flex-row-reverse items-center gap-4 w-fit h-50">
                    <div class="flex flex-col justify-between h-full">
                        {#each chartPoints.slice(0, 4) as point}
                            <div class="flex justify-between w-16">
                                <span class="text-base text-base-content">{point.name}</span>
                                <span class="text-base font-bold text-base-content">{point.value}</span>
                            </div>
                        {/each}
                    </div>
                    <svg {width} {height} viewBox="0 0 {width} {height}" class="chart-svg w-full h-full">
                        <!-- Background circles -->
                        {#each circlePaths as path, i}
                            <path 
                                d={path} 
                                class="fill-none stroke-neutral/20 [stroke-dasharray:2,2]" 
                            />
                        {/each}
                        
                        <!-- Axes -->
                        {#if chartPoints.length > 0}
                            {#each chartPoints as point}
                                <line 
                                    x1={centerX} 
                                    y1={centerY} 
                                    x2={centerX + radius * Math.cos(point.angle)} 
                                    y2={centerY + radius * Math.sin(point.angle)} 
                                    class="stroke-neutral/20 [stroke-dasharray:3,2]"
                                />
                            {/each}
                        {/if}
                        
                        <!-- Chart area -->
                        {#if polygonPoints}
                            <polygon points={polygonPoints} class="stroke-secondary fill-secondary/50" />
                        {/if}
                        
                        <!-- Points -->
                        {#if chartPoints.length > 0}
                            {#each chartPoints as point}
                                <circle cx={point.x} cy={point.y} r="3" class="stroke-secondary fill-secondary" />
                            {/each}
                        {/if}

                        <!-- 
                        {#if chartPoints.length > 0}
                            {#each chartPoints as point}
                                <text 
                                    x={point.valueX} 
                                    y={point.valueY} 
                                    text-anchor={point.textAnchor}
                                    dominant-baseline="middle"
                                    class="text-base stroke-primary"
                                >
                                    {point.value}
                                </text>
                            {/each}
                        {/if}


                        {#if chartPoints.length > 0}
                            {#each chartPoints as point}
                                <text 
                                    x={point.labelX} 
                                    y={point.labelY} 
                                    text-anchor={point.textAnchor}
                                    dominant-baseline="middle"
                                    dy={point.dy}
                                    class="text-base stroke-primary"
                                >
                                    {point.name}
                                </text>
                            {/each}
                        {/if}
                    -->
                    </svg>
                    <div class="flex flex-col justify-between h-full">
                        {#each chartPoints.slice(4, 8).reverse() as point}
                        <div class="flex justify-between w-16">
                            <span class="text-base text-base-content">{point.name}</span>
                            <span class="text-base font-bold text-base-content">{point.value}</span>
                        </div>
                        {/each}
                    </div>
                </div>
                <div class="divider mt-2 mb-0"></div>
                <!-- Additional Stats -->
                <div class="flex justify-center gap-6">
                    <div class="flex items-center gap-1">
                        <span class="text-base text-base-content">{t.move}</span>
                        <span class="text-base text-base-content">{$characterStore?.derivedAttributes?.move}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-base text-base-content">{t.armor}</span>
                        <span class="text-base text-base-content">5</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-base text-base-content">{t.luck}</span>
                        <span class="text-base text-base-content">{$characterStore?.attributes?.luck}</span>
                    </div>
                </div>
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

<style>


</style> 