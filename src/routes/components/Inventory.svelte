<script lang="ts">
  import { characterStore } from '$lib/stores/characterStore';
  import { languageStore } from '$lib/stores/languageStore';
  import { translations, type Language } from '$lib/i18n/translations';
  import type { InventoryType, WeaponType } from '$lib/types';

  $: currentLanguage = $languageStore as Language;
  $: t = translations[currentLanguage];

  $: inventory = $characterStore?.inventory as InventoryType;

  export let isEditing = false;
  let editedInventory: InventoryType;

  $: if (isEditing && !editedInventory) {
    editedInventory = JSON.parse(JSON.stringify(inventory));
  }

  export function startEditing() {
    editedInventory = JSON.parse(JSON.stringify(inventory));
    isEditing = true;
  }

  export function saveEdits() {
    characterStore.update(character => {
      if (character) {
        character.inventory = editedInventory;
      }
      return character;
    });
    isEditing = false;
  }

  export function cancelEdits() {
    isEditing = false;
  }

  function addItem() {
    editedInventory.gearsAndPossessions = [...editedInventory.gearsAndPossessions, ''];
  }

  function removeItem(index: number) {
    editedInventory.gearsAndPossessions = editedInventory.gearsAndPossessions.filter((_, i) => i !== index);
  }

  function addAsset() {
    editedInventory.assets = [...editedInventory.assets, ''];
  }

  function removeAsset(index: number) {
    editedInventory.assets = editedInventory.assets.filter((_, i) => i !== index);
  }

  function addWeapon() {
    editedInventory.weapons = [...editedInventory.weapons, {
      name: '',
      skill: '',
      baseDamage: '',
      range: '',
      maxAttacks: 1,
      clipSize: 0,
      malfunction: 0,
      canPenetrate: false
    }];
  }

  function removeWeapon(index: number) {
    editedInventory.weapons = editedInventory.weapons.filter((_, i) => i !== index);
  }
</script>

<div class="inventory-section">
  <div class="inventory-subsection">
    <h4>{t.gearsAndPossessions}</h4>
    {#if isEditing}
      <button on:click={addItem}>{t.addItem}</button>
      {#each editedInventory.gearsAndPossessions as item, index}
        <div>
          <input bind:value={editedInventory.gearsAndPossessions[index]} />
          <button class="remove-button" on:click={() => removeItem(index)}>{t.remove}</button>
        </div>
      {/each}
    {:else}
      <ul>
        {#each inventory.gearsAndPossessions as item}
          <li>{item}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="inventory-subsection">
    <h4>{t.spendingLevel}</h4>
    {#if isEditing}
      $ <input type="number" bind:value={editedInventory.spendingLevel} />
    {:else}
      <p>$ {inventory.spendingLevel}</p>
    {/if}
    
    <h4>{t.cash}</h4>
    {#if isEditing}
      $ <input type="number" bind:value={editedInventory.cash} />
    {:else}
      <p>$ {inventory.cash}</p>
    {/if}
  </div>

  <div class="inventory-subsection">
    <h4>{t.assets}</h4>
    {#if isEditing}
      <button on:click={addAsset}>{t.addAsset}</button>
      {#each editedInventory.assets as asset, index}
        <div>
          <input bind:value={editedInventory.assets[index]} />
          <button class="remove-button" on:click={() => removeAsset(index)}>{t.remove}</button>
        </div>
      {/each}
    {:else}
      <ul>
        {#each inventory.assets as asset}
          <li>{asset}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="inventory-subsection">
    <h4>{t.weapons}</h4>
    {#if isEditing}
      <button on:click={addWeapon}>{t.addWeapon}</button>
      <table class="weapon-table">
        <thead>
          <tr>
            <th>{t.weaponName}</th>
            <th>{t.skill}</th>
            <th>{t.damage}</th>
            <th>{t.range}</th>
            <th>{t.attacksPerRound}</th>
            <th>{t.ammo}</th>
            <th>{t.malfunction}</th>
            <th>{t.canPenetrate}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each editedInventory.weapons as weapon, index}
            <tr>
              <td><input bind:value={weapon.name} placeholder={t.weaponName} /></td>
              <td><input bind:value={weapon.skill} placeholder={t.skill} /></td>
              <td><input bind:value={weapon.baseDamage} placeholder={t.damage} /></td>
              <td><input bind:value={weapon.range} placeholder={t.range} /></td>
              <td><input type="number" bind:value={weapon.maxAttacks} placeholder={t.attacksPerRound} /></td>
              <td><input type="number" bind:value={weapon.clipSize} placeholder={t.ammo} /></td>
              <td><input type="number" bind:value={weapon.malfunction} placeholder={t.malfunction} /></td>
              <td><input type="checkbox" bind:checked={weapon.canPenetrate} /></td>
              <td><button class="remove-button" on:click={() => removeWeapon(index)}>X</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <table class="weapon-table">
        <thead>
          <tr>
            <th>{t.weaponName}</th>
            <th>{t.skill}</th>
            <th>{t.damage}</th>
            <th>{t.range}</th>
            <th>{t.attacksPerRound}</th>
            <th>{t.ammo}</th>
            <th>{t.malfunction}</th>
            <th>{t.canPenetrate}</th>
          </tr>
        </thead>
        <tbody>
          {#each inventory.weapons as weapon}
            <tr>
              <td>{weapon.name}</td>
              <td>{weapon.skill}</td>
              <td>{weapon.baseDamage}</td>
              <td>{weapon.range}</td>
              <td>{weapon.maxAttacks}</td>
              <td>{weapon.clipSize}</td>
              <td>{weapon.malfunction}</td>
              <td>{weapon.canPenetrate ? t.yes : t.no}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .inventory-section {
    background-color: #3a3a3a;
    padding: 15px;
    border-radius: 5px;
    margin-top: 20px;
  }

  .inventory-subsection {
    margin-bottom: 15px;
  }

  h4 {
    color: #00cc66;
    margin-bottom: 10px;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
  }

  li {
    margin-bottom: 5px;
  }

  input, button {
    margin-bottom: 5px;
  }

  button {
    background-color: #00cc66;
    color: #fff;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 5px;
  }

  button:hover {
    background-color: #00b359;
  }

  .weapon-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  .weapon-table th,
  .weapon-table td {
    border: 1px solid #4a4a4a;
    padding: 5px;
    text-align: left;
  }

  .weapon-table th {
    background-color: #2a2a2a;
    color: #00cc66;
  }

  .weapon-table input {
    width: 100%;
    background-color: transparent;
    border: none;
    color: inherit;
  }

  .weapon-table input[type="checkbox"] {
    width: auto;
  }

  .weapon-table button {
    width: 100%;
  }

  .remove-button {
    background-color: #cc0000;
  }

  .remove-button:hover {
    background-color: #b30000;
  }
</style>
