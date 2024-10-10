// src/stores/characterStore.ts
import { writable } from 'svelte/store';
import type { CharacterType } from '$lib/types';

// Create a writable store with the initial value as null
export const characterStore = writable<CharacterType | null>(null);

// Function to initialize the character data from JSON
export const initializeCharacter = async () => {
  const response = await fetch('./data/example_character.json'); // Fetch from the static folder
  if (response.ok) {
    const data: CharacterType = await response.json();
    characterStore.set(data);
  }
};
