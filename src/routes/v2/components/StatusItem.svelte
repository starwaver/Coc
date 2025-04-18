<script lang="ts">
  import { characterStore } from '$lib/stores/characterStore';
  import { HealthStatus, InsanityStatus } from '$lib/types';
  
  // Define the props
  export let id: 'hp' | 'mp' | 'san';
  export let label: string;
  export let value: number;     // Bindable current value
  export let max: number;       // Bindable max value
  export let icon: string;
  export let statusClass: string = '';
  export let barColor: string = 'bg-primary';
  export let hideLabel = false;
  export let onValueChange: ((newValue: number) => void) | null = null;  // Optional callback for additional side effects
  
  // Calculate percentage for progress bars
  $: percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  function increment() {
    if (value < max) {
      value += 1;
      if (onValueChange) onValueChange(value);
    }
  }

  function decrement() {
    if (value > 0) {
      value -= 1;
      if (onValueChange) onValueChange(value);
    }
  }
</script>

<div class="flex flex-col items-center">
  <div class="flex items-center gap-2">
    <img src={icon} alt={label} class="w-8 h-8" />
    {#if !hideLabel}
      <span class="font-bold text-base text-base-content">{label}</span>
    {/if}
    <span class="text-base font-bold {statusClass}">{value}/{max}</span>
  </div>
  
  <!-- Progress bar -->
  <div class="w-full h-1 bg-base-300 rounded-full mt-1 mb-1">
    <div 
      class="h-full rounded-full {barColor}" 
      style="width: {percentage}%;">
    </div>
  </div>
  
  <div class="flex items-center bg-base-200 rounded-md px-1 py-0.5 space-x-1">
    <button 
      on:click={decrement} 
      disabled={value <= 0} 
      class="text-base font-bold px-2 rounded hover:bg-base-300 active:bg-base-300 disabled:opacity-20"
      aria-label="Decrease {label}"
    >-</button>
    <span class="text-base-content/30">|</span>
    <button 
      on:click={increment} 
      disabled={value >= max} 
      class="text-base font-bold px-2 rounded hover:bg-base-300 active:bg-base-300 disabled:opacity-20"
      aria-label="Increase {label}"
    >+</button>
  </div>
</div>