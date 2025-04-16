<script lang="ts">
    import { characterStore } from '$lib/stores/characterStore';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
    import { onMount } from 'svelte';
    import type { AttributeType, CharacterType } from '$lib/types';

    // Accept character data as a prop
    export let characterData: CharacterType | null = null;

    // Define the attribute order
    const attributeOrder: Array<keyof AttributeType> = ['str', 'dex', 'int', 'con', 'app', 'pow', 'siz', 'edu', 'luck'];

    // Current language and translations
    $: currentLanguage = $languageStore as Language;
    $: t = translations[currentLanguage];

    let hasCharacter = false;
    let processedAttributes: Record<string, number> = {};
    let dataInitialized = false;
    
    // Process character data
    $: {
        const character = characterData || $characterStore;
        if (character && character.attributes) {
            hasCharacter = true;
            const attributeKeys = Object.keys(character.attributes);
            
            // Process attributes to normalize them
            processedAttributes = {};
            
            // Check each expected attribute
            attributeOrder.forEach(attr => {
                const attrValue = character.attributes[attr as keyof AttributeType];
                if (attrValue === undefined) {
                    // Try to find the attribute with different case
                    const matchingKey = attributeKeys.find(key => key.toLowerCase() === attr.toLowerCase());
                    if (matchingKey) {
                        const value = character.attributes[matchingKey as keyof typeof character.attributes];
                        if (typeof value === 'number') {
                            processedAttributes[attr] = value;
                        }
                    } else {
                        // Default value of 50 for missing attributes
                        processedAttributes[attr] = 50;
                    }
                } else {
                    processedAttributes[attr] = attrValue as number;
                }
            });
            
            dataInitialized = true;
        } else {
            hasCharacter = false;
            processedAttributes = {};
            dataInitialized = false;
        }
    }

    // Use processed attributes
    $: attributes = processedAttributes;
    
    // SVG dimensions
    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    
    // Calculate chart points when data is initialized, language changes, or attributes change
    $: chartPoints = dataInitialized && currentLanguage ? getChartPoints(attributes) : [];
    $: axisPoints = dataInitialized && currentLanguage ? getAxisPoints(attributes) : [];
    $: polygonPoints = chartPoints.length > 0 ? chartPoints.map(p => `${p.x},${p.y}`).join(' ') : '';
    
    function getChartPoints(attrs = attributes) {
        if (!attrs || Object.keys(attrs).length === 0) {
            return [];
        }
        
        const points = [];
        const totalAttributes = attributeOrder.length;
        
        for (let i = 0; i < totalAttributes; i++) {
            const attr = attributeOrder[i];
            
            if (attrs[attr] === undefined || typeof attrs[attr] !== 'number') {
                continue;
            }
            
            // Get the exact attribute value
            const value = attrs[attr];
            // Clamp the value for scaling the radius (for display only)
            const clampedValue = Math.max(0, Math.min(100, value));
            const scaledRadius = (clampedValue / 100) * radius;
            
            // Calculate position on the circle
            const angle = (i / totalAttributes) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + scaledRadius * Math.cos(angle);
            const y = centerY + scaledRadius * Math.sin(angle);
            
            points.push({ x, y, name: t[attr as TranslationKeys] || attr.toUpperCase(), value });
        }
        
        return points;
    }
    
    function getAxisPoints(attrs = attributes) {
        if (!attrs || Object.keys(attrs).length === 0) {
            return [];
        }
        
        const points = [];
        const totalAttributes = attributeOrder.length;
        
        for (let i = 0; i < totalAttributes; i++) {
            const attr = attributeOrder[i];
            
            // Calculate position on the circle for axis
            const angle = (i / totalAttributes) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const labelX = centerX + (radius + 25) * Math.cos(angle);
            const labelY = centerY + (radius + 25) * Math.sin(angle);
            
            points.push({ 
                x, y, 
                labelX, labelY,
                name: t[attr as TranslationKeys] || attr.toUpperCase() 
            });
        }
        
        return points;
    }
    
    // Create circles for value indicators
    function getCirclePath(r: number) {
        return Array(5).fill(null).map((_, i) => {
            // Create circles at exactly 20, 40, 60, 80, and 100 points
            const circleRadius = (r / 5) * (i + 1);
            return `M ${centerX - circleRadius} ${centerY} ` +
                   `a ${circleRadius} ${circleRadius} 0 1 0 ${circleRadius * 2} 0 ` +
                   `a ${circleRadius} ${circleRadius} 0 1 0 -${circleRadius * 2} 0`;
        });
    }
    
    $: circlePaths = getCirclePath(radius);
    
    let mounted = false;
    onMount(() => {
        mounted = true;
    });
</script>

<div class="card bg-base-200 shadow-lg">
    <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-primary">{t.attributeChart}</h2>
        <div class="divider"></div>
        
        {#key currentLanguage}
        {#if dataInitialized && chartPoints.length > 0 && mounted}
            <div class="flex justify-center">
                <div class="attribute-chart">
                    <svg width={width} height={height} viewBox="0 0 {width} {height}">
                        <!-- Background circles -->
                        {#each circlePaths as path, i}
                            <path d={path} class="circle-grid" />
                            <text x={centerX + 5} y={centerY - (radius/5) * (i+1)} class="value-label">
                                {(i+1) * 20}
                            </text>
                        {/each}
                        
                        <!-- Axes -->
                        {#each axisPoints as point, i}
                            <line 
                                x1={centerX} 
                                y1={centerY} 
                                x2={point.x} 
                                y2={point.y} 
                                class="axis-line" 
                            />
                            <text 
                                x={point.labelX} 
                                y={point.labelY} 
                                text-anchor="middle" 
                                dominant-baseline="middle"
                                class="axis-label"
                            >
                                {point.name}
                            </text>
                        {/each}
                        
                        <!-- Chart area -->
                        {#if polygonPoints}
                            <polygon points={polygonPoints} class="chart-area" />
                        {/if}
                        
                        <!-- Points -->
                        {#each chartPoints as point}
                            <circle cx={point.x} cy={point.y} r="5" class="data-point" />
                        {/each}
                    </svg>
                </div>
            </div>
        {:else}
            <div class="alert alert-info">
                <div>
                    <span>{t.loadingCharacterData}</span>
                </div>
            </div>
        {/if}
        {/key}
    </div>
</div>

<style>
    .attribute-chart {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
    }
    
    .axis-line {
        stroke: var(--grid-color, rgba(139, 139, 139, 0.5));
        stroke-width: 1;
        stroke-dasharray: 4 4;
    }
    
    .axis-label {
        fill: var(--primary-color, #2A9D8F);
        font-size: 12px;
        font-weight: bold;
    }
    
    .circle-grid {
        fill: none;
        stroke: var(--grid-color, rgba(139, 139, 139, 0.3));
        stroke-width: 1;
        stroke-dasharray: 4 4;
        opacity: 0.5;
    }
    
    .value-label {
        fill: var(--text-color, rgba(139, 139, 139, 0.7));
        font-size: 10px;
    }
    
    .chart-area {
        fill: var(--area-fill, rgba(42, 157, 143, 0.2));
        stroke: var(--primary-color, #2A9D8F);
        stroke-width: 2;
    }
    
    .data-point {
        fill: var(--primary-color, #2A9D8F);
        stroke: var(--point-stroke, white);
        stroke-width: 1;
    }
    
    /* Apply theme colors */
    :global([data-theme="light"]) .attribute-chart, :global(.light) .attribute-chart {
        --primary-color: #2A9D8F;
        --grid-color: rgba(139, 139, 139, 0.5);
        --text-color: rgba(139, 139, 139, 0.7);
        --area-fill: rgba(42, 157, 143, 0.2);
        --point-stroke: white;
    }
    
    :global([data-theme="halloween"]), :global(.halloween) .attribute-chart, :global([data-theme="dark"]) .attribute-chart, :global(.dark) .attribute-chart {
        --primary-color: #67e8b4;
        --grid-color: rgba(255, 255, 255, 0.3);
        --text-color: rgba(255, 255, 255, 0.7);
        --area-fill: rgba(103, 232, 180, 0.2);
        --point-stroke: #1d232a;
    }
</style> 