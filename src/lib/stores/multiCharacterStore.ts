import { writable, get } from 'svelte/store';
import type { CharacterType } from '$lib/types';

// Constants
const MAX_CHARACTERS = 100;
const STORAGE_KEY = 'charactersData';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB (localStorage typical limit)

// Error types
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const charactersStore = writable<CharacterType[]>([]);
export const currentCharacterIndex = writable<number>(0);

// Helper to check storage size
const getStorageSize = (): number => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2; // UTF-16 uses 2 bytes per char
    }
  }
  return total;
};

// Helper to check if adding new data would exceed storage limit
const wouldExceedStorageLimit = (newData: string): boolean => {
  const currentSize = getStorageSize();
  const newDataSize = newData.length * 2;
  return (currentSize + newDataSize) > MAX_STORAGE_SIZE;
};

export const loadCharacters = () => {
  try {
    const charactersData = localStorage.getItem(STORAGE_KEY);
    if (charactersData) {
      charactersStore.set(JSON.parse(charactersData));
    }
  } catch (error) {
    console.error('Error loading characters from localStorage:', error);
    throw new StorageError('Failed to load characters from storage');
  }
};

export const saveCharacters = (characters: CharacterType[]) => {
  try {
    // Check number of characters
    if (characters.length > MAX_CHARACTERS) {
      throw new StorageError(`Cannot exceed ${MAX_CHARACTERS} characters`);
    }

    const jsonData = JSON.stringify(characters);

    // Check storage size
    if (wouldExceedStorageLimit(jsonData)) {
      throw new StorageError('Storage limit exceeded');
    }

    localStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error) {
    console.error('Error saving characters to localStorage:', error);
    throw error instanceof StorageError ? error : new StorageError('Failed to save characters');
  }
};

// Helper to remove a character
export const removeCharacter = (index: number) => {
  charactersStore.update(characters => {
    const newCharacters = characters.filter((_, i) => i !== index);
    saveCharacters(newCharacters);
    
    // Update current index if necessary
    if (index <= get(currentCharacterIndex)) {
      currentCharacterIndex.update(curr => Math.max(0, curr - 1));
    }
    
    return newCharacters;
  });
}; 