import { writable } from 'svelte/store';
import type { Language } from '$lib/i18n/translations';

export const languageStore = writable<Language>('en');
