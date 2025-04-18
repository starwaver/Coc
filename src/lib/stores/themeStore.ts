import { writable } from 'svelte/store';

// Define supported themes
export type Theme = 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald' | 'corporate' | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden' | 'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'wireframe' | 'black' | 'luxury' | 'dracula' | 'cmyk' | 'autumn' | 'business' | 'acid' | 'lemonade' | 'night' | 'coffee' | 'winter' | 'dim' | 'nord' | 'sunset' | 'caramellatte' | 'abyss' | 'silk';

// Get all available themes as an array
export const allThemes: Theme[] = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 
  'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 
  'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 
  'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter', 
  'dim', 'nord', 'sunset', 'caramellatte', 'abyss', 'silk'
];

const THEME_STORAGE_KEY = 'preferredTheme';

// Get initial theme from localStorage or default to 'light'
const getDefaultTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  if (storedTheme) return storedTheme;

  // Check for system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const themeStore = writable<Theme>(getDefaultTheme());

// Subscribe to changes and update localStorage and HTML data-theme attribute
if (typeof window !== 'undefined') {
  themeStore.subscribe(theme => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  });
} 