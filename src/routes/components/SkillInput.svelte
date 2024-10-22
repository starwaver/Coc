<script lang="ts">
  import { translations, type Language } from '$lib/i18n/translations';

  export let label: string;
  export let value: number;
  export let readonly: boolean = false;
  export let min: number = 0;
  export let max: number = 99;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    value = Math.max(min, Math.min(max, parseInt(input.value) || 0));
  }
</script>

<style>
  .input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }

  .input-label {
    margin-bottom: 5px;
  }

  .input-controls {
    display: flex;
    flex-direction: column;
  }

  .number-input {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  input[type="number"] {
    width: 50px;
    text-align: center;
    margin-right: 10px;
  }

  input[type="range"] {
    width: 100%;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .base-value {
    font-weight: normal;
    color: #cccccc;
  }
</style>

<div class="input-group">
  <span class="input-label">{label}:</span>
  {#if readonly}
    <span class="base-value">{value}</span>
  {:else}
    <div class="input-controls">
      <div class="number-input">
        <input type="number" {min} {max} bind:value on:input={handleInput} />
      </div>
      <input type="range" {min} {max} bind:value />
    </div>
  {/if}
</div>
