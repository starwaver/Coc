<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SkillType } from '$lib/types';
  import { translations, type Language } from '$lib/i18n/translations';

  export let currentLanguage: Language;

  const dispatch = createEventDispatcher();

  let newSkillName = '';

  function addCustomSkill() {
    if (newSkillName.trim()) {
      const newSkill: SkillType = {
        name: { en: newSkillName.trim(), cn: newSkillName.trim() },
        basePoint: 0,
        occupationPoint: 0,
        interestPoint: 0,
        growthPoint: 0,
        hasSucceeded: false
      };
      dispatch('addSkill', newSkill);
      newSkillName = '';
    }
  }

  $: t = translations[currentLanguage];
</script>

<div class="add-custom-skill">
  <input
    type="text"
    bind:value={newSkillName}
    placeholder={t.newSkillPlaceholder}
  />
  <button on:click={addCustomSkill}>{t.addSkill}</button>
</div>

<style>
  .add-custom-skill {
    display: flex;
    margin-bottom: 10px;
  }

  input {
    flex-grow: 1;
    margin-right: 10px;
    padding: 5px;
  }

  button {
    padding: 5px 10px;
    background-color: #00cc66;
    color: #fff;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #00b359;
  }
</style>
