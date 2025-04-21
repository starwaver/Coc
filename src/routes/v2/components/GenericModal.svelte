<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let title = 'Dialog';
  
    let dialogEl: HTMLDialogElement;
    const dispatch = createEventDispatcher();
  
    export function show() { dialogEl.showModal()  }
    export function hide() { dialogEl.close(); }
    
    // Handle the dialog close event
    function handleClose() {
        dispatch('close');
    }

</script>
  
<dialog 
    bind:this={dialogEl} 
    class="modal"
    on:close={handleClose}
    on:cancel={handleClose}
>
  <div class="modal-box bg-base-300">

    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>

    <h3 class="font-bold text-lg text-center">{title}</h3>

    <slot />
  </div>
</dialog>
  