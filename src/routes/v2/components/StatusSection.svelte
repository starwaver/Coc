<script lang="ts">
  import { characterStore } from '$lib/stores/characterStore';
  import { languageStore } from '$lib/stores/languageStore';
  import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
  import { HealthStatus, InsanityStatus } from '$lib/types';
  import StatusItem from './StatusItem.svelte';
  import StatusBadge from './StatusBadge.svelte';
  import { onMount } from 'svelte';

  // Current language and translations
  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];

  // Define the status types for type safety
  type StatusType = 'hp' | 'mp' | 'san';

  // HP tracking for wounds
  let damageTimer: number | null = null;
  let initialHp = 0;
  const DAMAGE_WINDOW_MS = 5000; // 5 seconds window to consider "short amount of time"

  // Derive values reactively from the store's derivedAttributes
  $: healthStatus = $characterStore?.derivedAttributes?.healthStatus ?? HealthStatus.Normal;
  $: insanityStatus = $characterStore?.derivedAttributes?.insanityStatus ?? InsanityStatus.Normal;
  
  // Reactive bindings for character stats
  $: hp = $characterStore?.derivedAttributes?.currentHp ?? 0;
  $: maxHp = $characterStore?.derivedAttributes?.maxHp ?? 10;
  $: mp = $characterStore?.derivedAttributes?.currentMp ?? 0;
  $: maxMp = $characterStore?.derivedAttributes?.maxMp ?? 10;
  $: san = $characterStore?.derivedAttributes?.currentSan ?? 0;
  $: maxSan = $characterStore?.derivedAttributes?.initialSan ?? 10;

  onMount(() => {
    // Initial setup when component mounts
    initialHp = hp;
    
    // Clean up timer on component unmount
    return () => {
      if (damageTimer !== null) {
        clearTimeout(damageTimer);
      }
    };
  });

  // Track damage with timer
  function startDamageTimer() {
    // Check for unconsciousness
    if (hp === 0 && healthStatus !== HealthStatus.Dead) {
      setHealthStatus(HealthStatus.Unconscious);
      return;
    }

    // Only start a new timer if one isn't already running
    if (damageTimer === null) {
      // Record the initial HP value when the timer starts
      initialHp = hp;
      
      // Start the timer
      damageTimer = window.setTimeout(() => {
        // When timer expires, reset the damage tracking
        damageTimer = null;
        initialHp = hp;
      }, DAMAGE_WINDOW_MS);
    }
    
    // Check for major wound - if we've lost more than 50% max HP during the timer
    if (initialHp - hp > maxHp / 2) {
      setHealthStatus(HealthStatus.MajorWound);
      
      // Reset timer after applying status
      if (damageTimer !== null) {
        clearTimeout(damageTimer);
        damageTimer = null;
      }
    }
    
    
  }

  // Function to update health status
  function setHealthStatus(status: HealthStatus) {
    if (!$characterStore) return;
    
    characterStore.update(character => {
      if (!character) return character;
      character.derivedAttributes.healthStatus = status;
      return character;
    });
  }

  // Create config for status items
  $: statusConfigs = [
    {
      id: 'hp' as StatusType,
      label: 'HP',
      value: hp,
      max: maxHp,
      icon: './hp icon.png',
      statusClass: getHealthStatusClass(healthStatus),
      barColor: 'bg-error',
      hideLabel: false,
      onValueChange: updateHp
    },
    {
      id: 'mp' as StatusType,
      label: 'MP',
      value: mp,
      max: maxMp,
      icon: './mp icon.png',
      statusClass: '',
      barColor: 'bg-primary',
      hideLabel: false,
      onValueChange: updateMp
    },
    {
      id: 'san' as StatusType,
      label: 'SAN',
      value: san,
      max: maxSan,
      icon: './sanity icon.png',
      statusClass: getSanityStatusClass(insanityStatus),
      barColor: 'bg-secondary',
      hideLabel: true,
      onValueChange: updateSan
    }
  ];
  
  // Functions to update character stats and status
  function updateHp(newValue: number) {
    if (!$characterStore) return;
    
    characterStore.update(character => {
      if (!character) return character;
      
      const oldValue = character.derivedAttributes.currentHp;
      character.derivedAttributes.currentHp = newValue;
      
      // Check for unconsciousness when updating directly
      if (newValue === 0 && character.derivedAttributes.healthStatus !== HealthStatus.Dead) {
        character.derivedAttributes.healthStatus = HealthStatus.Unconscious;
      }
      
      return character;
    });
    
    // Start/check damage timer when HP decreases
    if (newValue < hp) {
      startDamageTimer();
    }
  }
  
  function updateMp(newValue: number) {
    if (!$characterStore) return;
    
    characterStore.update(character => {
      if (!character) return character;
      
      character.derivedAttributes.currentMp = newValue;
      return character;
    });
  }
  
  function updateSan(newValue: number) {
    if (!$characterStore) return;
    
    characterStore.update(character => {
      if (!character) return character;
      
      character.derivedAttributes.currentSan = newValue;
      
      return character;
    });
  }

  // Helper functions to determine status classes
  function getHealthStatusClass(status: HealthStatus): string {
    switch (status) {
      case HealthStatus.MajorWound:
        return 'text-warning';
      case HealthStatus.Unconscious:
        return 'text-error opacity-70';
      case HealthStatus.Dying:
        return 'text-error';
      case HealthStatus.Dead:
        return 'text-error line-through';
      default:
        return '';
    }
  }

  function getSanityStatusClass(status: InsanityStatus): string {
    switch (status) {
      case InsanityStatus.TemporaryInsanity:
        return 'text-warning';
      case InsanityStatus.IndefiniteInsanity:
        return 'text-error';
      default:
        return '';
    }
  }
</script>

<div class="card card-xs shadow-sm w-full">
  <div class="card-body p-4">
    {#if $characterStore}
      <div class="flex flex-col">
        <div class="flex justify-between items-center flex-wrap gap-4">
          {#each statusConfigs as config (config.id)}
            <StatusItem 
              id={config.id}
              label={config.label}
              bind:value={config.value}
              max={config.max}
              icon={config.icon}
              statusClass={config.statusClass}
              barColor={config.barColor}
              hideLabel={config.hideLabel}
              onValueChange={config.onValueChange}
            />
          {/each}
        </div>
        
        {#if healthStatus !== HealthStatus.Normal || insanityStatus !== InsanityStatus.Normal}
          <div class="divider my-2"></div>
          <div class="flex flex-wrap gap-2 justify-center">
            {#if healthStatus !== HealthStatus.Normal}
              <StatusBadge 
                type="health" 
                status={healthStatus} 
                variant={healthStatus === HealthStatus.MajorWound ? 'warning' : 'error'} 
              />
            {/if}
            
            {#if insanityStatus !== InsanityStatus.Normal}
              <StatusBadge 
                type="mental" 
                status={insanityStatus} 
                variant={insanityStatus === InsanityStatus.TemporaryInsanity ? 'warning' : 'error'} 
              />
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <div class="alert alert-info">
        <div>
          <span>{t?.loadingCharacterData || 'Loading character data...'}</span>
        </div>
      </div>
    {/if}
  </div>
</div>
