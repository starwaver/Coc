import { writable } from 'svelte/store';
import type { Language } from '$lib/i18n/translations';

const LANGUAGE_STORAGE_KEY = 'preferredLanguage';

// Get initial language from localStorage or default to 'en'
const storedLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language || 'en'
  : 'en';

export const languageStore = writable<Language>(storedLanguage);

// Subscribe to changes and update localStorage
if (typeof window !== 'undefined') {
  languageStore.subscribe(value => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
  });
}
