<script lang="ts">
    import { characterStore } from '$lib/stores/characterStore';
    import type { DerivedAttributeType } from '$lib/types';
    import { HealthStatus, InsanityStatus } from '$lib/types';
    import { languageStore } from '$lib/stores/languageStore';
    import { translations } from '$lib/i18n/translations';

    let derivedAttributes: DerivedAttributeType;

    characterStore.subscribe(value => {
      if (value) {
        derivedAttributes = value.derivedAttributes;
      }
    });

    function handleValueUpdate(key: keyof DerivedAttributeType, event: Event) {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      const value = target.type === 'number' ? parseFloat(target.value) : target.value;
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

    $: healthStatusTranslationKeys = {
        [HealthStatus.Normal]: 'normal',
        [HealthStatus.MajorWound]: 'majorwound',
        [HealthStatus.Unconscious]: 'unconscious',
        [HealthStatus.Dying]: 'dying',
        [HealthStatus.Dead]: 'dead',
    };

    $: insanityStatusTranslationKeys = {
        [InsanityStatus.Normal]: 'normal',
        [InsanityStatus.TemporaryInsanity]: 'temporaryinsanity',
        [InsanityStatus.IndefiniteInsanity]: 'indefiniteinsanity',
    };

    $: getTranslation = (status: HealthStatus | InsanityStatus): string => {
        const key = status in healthStatusTranslationKeys 
            ? healthStatusTranslationKeys[status as HealthStatus]
            : insanityStatusTranslationKeys[status as InsanityStatus];
        return t[key as keyof typeof t] || status;
    };
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
      margin-bottom: 10px;
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
      width: 60px;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 3px;
      background-color: #2a2a2a;
      color: #fff;
      margin-right: 5px;
    }

    .attribute-limit {
      color: #fff;
    }

    .dropdown-container {
      margin-top: 5px;
    }

    select {
      width: 60%;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 3px;
      background-color: #2a2a2a;
      color: #fff;
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

      <div class="dropdown-container">
        <select
          bind:value={derivedAttributes.healthStatus}
          on:change={(event) => handleValueUpdate('healthStatus', event)}
        >
          {#each Object.values(HealthStatus) as status}
            <option value={status}>{getTranslation(status)}</option>
          {/each}
        </select>
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

      <div class="dropdown-container">
        <select
          bind:value={derivedAttributes.insanityStatus}
          on:change={(event) => handleValueUpdate('insanityStatus', event)}
        >
          {#each Object.values(InsanityStatus) as status}
            <option value={status}>{getTranslation(status)}</option>
          {/each}
        </select>
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
