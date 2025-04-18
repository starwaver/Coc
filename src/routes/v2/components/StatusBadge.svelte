<script lang="ts">
  import { characterStore } from '$lib/stores/characterStore';
  import { HealthStatus, InsanityStatus } from '$lib/types';
  
  // Define the props  
  export let type: 'health' | 'mental';
  export let status: string;
  export let variant: 'warning' | 'error' = 'warning';
  export let dismissable: boolean = true;
  
  // Confirmation state
  let showConfirmation = false;
  
  function handleClick() {
    if (dismissable && !showConfirmation) {
      showConfirmation = true;
    }
  }
  
  function confirmDismiss() {
    if (!$characterStore) return;
    
    characterStore.update(character => {
      if (!character) return character;
      
      if (type === 'health') {
        // Reset health status to normal without changing HP
        character.derivedAttributes.healthStatus = HealthStatus.Normal;
      } else if (type === 'mental') {
        // Reset sanity status to normal without changing SAN
        character.derivedAttributes.insanityStatus = InsanityStatus.Normal;
      }
      
      return character;
    });
    
    showConfirmation = false;
  }
  
  function cancelDismiss() {
    showConfirmation = false;
  }
</script>

<div class="relative inline-block">
  <div 
    class="badge badge-{variant} gap-1 cursor-pointer pr-2 {dismissable ? 'hover:opacity-90' : ''}"
    class:pulse={showConfirmation}
    on:click={handleClick}
    role={dismissable ? 'button' : undefined}
    aria-label={dismissable ? `Dismiss ${type} status` : undefined}
  >
    <span>{type === 'health' ? 'Health' : 'Mental'}: {status}</span>
    {#if dismissable && !showConfirmation}
      <span class="text-xs opacity-60 ml-1">✕</span>
    {/if}
  </div>
  
  {#if showConfirmation}
    <div class="confirmation-popup absolute top-full mt-2 bg-base-200 shadow-lg rounded-md p-2 z-10 w-48 text-center">
      <p class="text-xs mb-2">Reset {type} status to Normal?</p>
      <div class="flex justify-center gap-2">
        <button 
          class="btn btn-xs btn-success" 
          on:click={confirmDismiss}
        >
          Yes
        </button>
        <button 
          class="btn btn-xs btn-error" 
          on:click={cancelDismiss}
        >
          No
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .pulse {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(var(--color-base-content), 0.2);
    }
    70% {
      box-shadow: 0 0 0 5px rgba(var(--color-base-content), 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(var(--color-base-content), 0);
    }
  }
  
  .confirmation-popup {
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style> 