<script lang="ts">
    import { characterStore } from '$lib/stores/characterStore';
    import type { DerivedAttributeType } from '$lib/types';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations } from '$lib/i18n/translations';

    let derivedAttributes: DerivedAttributeType | null = null;

    characterStore.subscribe(value => {
      if (value) {
        derivedAttributes = value.derivedAttributes;
      }
    });

    function handleValueUpdate(key: keyof DerivedAttributeType, event: Event) {
      const target = event.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : parseFloat(target.value);
      updateDerivedAttribute(key, value);
    }

    function updateDerivedAttribute<K extends keyof DerivedAttributeType>(key: K, value: DerivedAttributeType[K]) {
      characterStore.update(character => {
        if (character && character.derivedAttributes) {
          character.derivedAttributes[key] = value;
        }
        return character;
      });
    }

    $: t = $languageStore ? translations[$languageStore] : translations.en;
</script>

<style>
    .derived-attributes-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
      padding: 10px;
      background-color: #3a3a3a;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }

    .attribute-group {
      display: flex;
      flex-direction: column;
    }

    .attribute-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .attribute-label {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .attribute-input-container {
      display: flex;
      align-items: center;
    }

    .attribute-value {
      width: 60px; /* Fixed width for input */
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 3px;
      background-color: #2a2a2a;
      color: #fff;
      margin-right: 5px; /* Space between input and limit */
    }

    .attribute-limit {
      color: #fff;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      margin-top: 5px;
    }

    .checkbox-label {
      margin-left: 5px;
    }
</style>

<div class="derived-attributes-container">
  {#if derivedAttributes}
    <!-- HP related values -->
    <div class="attribute-group">
      <div class="attribute-item">
        <span class="attribute-label">{t.currentHp}:</span>
        <div class="attribute-input-container">
          <input
            type="number"
            class="attribute-value"
            bind:value={derivedAttributes.currentHp}
            on:input={(event) => handleValueUpdate('currentHp', event)}
          />
          <span class="attribute-limit">/ {derivedAttributes.maxHp}</span>
        </div>
      </div>

      <div class="checkbox-container">
        <input
          type="checkbox"
          bind:checked={derivedAttributes.majorWound}
          on:change={(event) => handleValueUpdate('majorWound', event)}
        />
        <span class="checkbox-label">{t.majorWound}</span>
      </div>

      <div class="checkbox-container">
        <input
          type="checkbox"
          bind:checked={derivedAttributes.unconscious}
          on:change={(event) => handleValueUpdate('unconscious', event)}
        />
        <span class="checkbox-label">{t.unconscious}</span>
      </div>

      <div class="checkbox-container">
        <input
          type="checkbox"
          bind:checked={derivedAttributes.dying}
          on:change={(event) => handleValueUpdate('dying', event)}
        />
        <span class="checkbox-label">{t.dying}</span>
      </div>
    </div>

    <!-- SAN related values -->
    <div class="attribute-group">
      <div class="attribute-item">
        <span class="attribute-label">{t.currentSan}:</span>
        <div class="attribute-input-container">
          <input
            type="number"
            class="attribute-value"
            bind:value={derivedAttributes.currentSan}
            on:input={(event) => handleValueUpdate('currentSan', event)}
          />
          <span class="attribute-limit">/ {derivedAttributes.initialSan}</span>
        </div>
      </div>

      <div class="checkbox-container">
        <input
          type="checkbox"
          bind:checked={derivedAttributes.temporaryInsanity}
          on:change={(event) => handleValueUpdate('temporaryInsanity', event)}
        />
        <span class="checkbox-label">{t.temporaryInsanity}</span>
      </div>

      <div class="checkbox-container">
        <input
          type="checkbox"
          bind:checked={derivedAttributes.indefiniteInsanity}
          on:change={(event) => handleValueUpdate('indefiniteInsanity', event)}
        />
        <span class="checkbox-label">{t.indefiniteInsanity}</span>
      </div>
    </div>

    <!-- MP values -->
    <div class="attribute-group">
      <div class="attribute-item">
        <span class="attribute-label">{t.currentMp}:</span>
        <div class="attribute-input-container">
          <input
            type="number"
            class="attribute-value"
            bind:value={derivedAttributes.currentMp}
            on:input={(event) => handleValueUpdate('currentMp', event)}
          />
          <span class="attribute-limit">/ {derivedAttributes.maxMp}</span>
        </div>
      </div>
    </div>

    <!-- Other values -->
    <div class="attribute-group">
      <div class="attribute-item">
        <span class="attribute-label">{t.db}:</span>
        <span>{derivedAttributes.db}</span>
      </div>

      <div class="attribute-item">
        <span class="attribute-label">{t.build}:</span>
        <span>{derivedAttributes.build}</span>
      </div>

      <div class="attribute-item">
        <span class="attribute-label">{t.move}:</span>
        <span>{derivedAttributes.move}</span>
      </div>
    </div>

  {:else}
    <p>Loading derived attributes...</p>
  {/if}
</div>
