<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let attribute: { name: string; value: number };
  
    const dispatch = createEventDispatcher();
  
    let isEditing = false;
    let newValue = attribute.value;
  
    function toggleEdit() {
      isEditing = !isEditing;
      if (!isEditing) {
        dispatch('updateValue', { name: attribute.name, value: newValue });
      }
    }
  </script>
  
  <div class="attribute">
    <span class="attribute-name">{attribute.name}
        {#if isEditing}
        <input type="number" bind:value={newValue} class="attribute-input" />
        <button on:click={toggleEdit}>Save</button>
      {:else}
        <button class="edit-button" on:click={toggleEdit}>✏️</button>
      {/if}
    </span>
    <span class="attribute-value">{attribute.value}</span>
    <div class="attribute-reference">
      <span class="attribute-half">{Math.floor(attribute.value / 2)}</span> | <span class="attribute-fifth">{Math.floor(attribute.value / 5)}</span>
    </div>
  </div>
  
  <style>
    .attribute {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px;
      background-color: #3a3a3a;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }
  
    .attribute-name {
      font-weight: bold;
      margin-bottom: 5px;
    }
  
    .attribute-value {
      font-size: 1.2em;
      color: #00cc66;
    }
  
    .attribute-input {
      font-size: 1.2em;
      color: #00cc66;
      background-color: #2a2a2a;
      border: none;
      border-bottom: 2px solid #00cc66;
      margin-bottom: 5px;
      padding: 5px;
    }
  
    .edit-button {
      background: none;
      border: none;
      color: #00cc66;
      cursor: pointer;
      font-size: 1em;
    }
  
    .attribute-reference {
      font-size: 0.9em;
      color: #cccccc;
      margin-top: 5px;
    }
  </style>