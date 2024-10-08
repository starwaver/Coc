<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    // Create a store for character data
    const character = writable({
        id: "",
        name: "",
        playerName: "",
        type: "PC",
        age: 0,
        gender: "",
        occupation: "",
        birthplace: "",
        residence: "",
        attributes: {
            str: 50,
            con: 50,
            siz: 50,
            dex: 50,
            app: 50,
            int: 50,
            pow: 50,
            edu: 50,
            luck: 50
        },
        derivedAttributes: {
            hp: 10,
            san: 50,
            mp: 10,
            db: "0",
            build: 0,
            move: 8
        },
        skills: {},
        inventory: [],
        weapons: [],
        spells: [],
        backstory: {},
        notes: "",
        image: ""
    });

    let formValues = {
        name: "",
        playerName: "",
        type: "PC",
        age: 0,
        gender: "",
        occupation: "",
        birthplace: "",
        residence: "",
        notes: ""
    };

    function updateCharacter() {
        character.update((char) => {
            char.name = formValues.name;
            char.playerName = formValues.playerName;
            char.type = formValues.type;
            char.age = parseInt(formValues.age) || 0;
            char.gender = formValues.gender;
            char.occupation = formValues.occupation;
            char.birthplace = formValues.birthplace;
            char.residence = formValues.residence;
            char.notes = formValues.notes;
            return char;
        });
    }

    function saveCharacter() {
        character.subscribe((char) => {
            const file = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = `${char.name || 'character'}.json`;
            a.click();
        })();
    }
</script>

<style>
    body {
        font-family: Arial, sans-serif;
        padding: 20px;
    }
    .character-sheet {
        max-width: 800px;
        margin: 0 auto;
    }
    .character-sheet label {
        font-weight: bold;
    }
    .character-sheet input, .character-sheet textarea {
        width: 100%;
        padding: 5px;
        margin-bottom: 10px;
    }
    .character-sheet button {
        padding: 10px;
        background-color: #007BFF;
        color: white;
        border: none;
        cursor: pointer;
    }
    .character-sheet button:hover {
        background-color: #0056b3;
    }
</style>

<div class="character-sheet">
    <h1>Call of Cthulhu Character Sheet</h1>
    <form on:input={() => updateCharacter()}>
        <label for="name">Character Name:</label>
        <input type="text" id="name" bind:value={formValues.name}>

        <label for="playerName">Player Name:</label>
        <input type="text" id="playerName" bind:value={formValues.playerName}>

        <label for="type">Character Type:</label>
        <select id="type" bind:value={formValues.type}>
            <option value="PC">Player Character</option>
            <option value="NPC">Non-Player Character</option>
        </select>

        <label for="age">Age:</label>
        <input type="number" id="age" bind:value={formValues.age}>

        <label for="gender">Gender:</label>
        <input type="text" id="gender" bind:value={formValues.gender}>

        <label for="occupation">Occupation:</label>
        <input type="text" id="occupation" bind:value={formValues.occupation}>

        <label for="birthplace">Birthplace:</label>
        <input type="text" id="birthplace" bind:value={formValues.birthplace}>

        <label for="residence">Residence:</label>
        <input type="text" id="residence" bind:value={formValues.residence}>

        <label for="notes">Notes:</label>
        <textarea id="notes" bind:value={formValues.notes}></textarea>

        <button type="button" on:click={saveCharacter}>Save Character</button>
    </form>
    <h2>Character JSON Data</h2>
    <pre>{JSON.stringify($character, null, 2)}</pre>
</div>