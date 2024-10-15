// src/stores/characterStore.ts
import { writable, derived } from 'svelte/store';
import type { CharacterType, AttributeType, DerivedAttributeType, SkillType } from '$lib/types';
import type { Language } from '$lib/i18n/translations';
import skillList from '$lib/skill_list.json';

// Create a writable store with the initial value as null
export const characterStore = writable<CharacterType | null>(null);

// Add this new store for language
export const languageStore = writable<Language>('en');

// Utility function to generate a random ID
function generateRandomId() {
  return Math.random().toString(36).substring(2, 11);
}

const defaultCharacterData: CharacterType = {
  id: generateRandomId(),
  name: "Unnamed Character",
  playerName: "Unnamed Player",
  type: "PC",
  age: 0,
  gender: "Unselected",
  occupation: "Unselected",
  birthplace: "Unselected",
  residence: "Unselected",
  image: "./data/character_placeholder.png",
  attributes: {
    str: 0,
    con: 0,
    siz: 0,
    dex: 0,
    app: 0,
    int: 0,
    pow: 0,
    edu: 0,
    luck: 0
  },
  derivedAttributes: {
    hp: 0,
    san: 0,
    mp: 0,
    db: "0",
    build: 0,
    move: 0,
  },
  skills: skillList.skills.reduce((acc, skill) => {
    acc[skill.name.en] = {
      name: { en: skill.name.en, cn: skill.name.cn },
      basePoint: skill.base_percent,
      occupationPoint: 0,
      interestPoint: 0,
      growthPoint: 0,
      hasSucceeded: false,
    };
    return acc;
  }, {} as Record<string, SkillType>),
};

export const calculateDerivedAttributes = (attributes: AttributeType): DerivedAttributeType => {
  return {
    hp: Math.floor((attributes.con + attributes.siz) / 10),
    san: attributes.pow,
    mp: Math.floor(attributes.pow / 5),
    db: calculateDamageBonus(attributes.str, attributes.siz),
    build: calculateBuild(attributes.str, attributes.siz),
    move: calculateMove(attributes.dex, attributes.str, attributes.siz),
  };
}

function calculateDamageBonus(str: number, siz: number): string {
  const combined = str + siz;
  if (combined <= 64) return "-2";
  else if (combined <= 84) return "-1";
  else if (combined <= 124) return "0";
  else if (combined <= 164) return "+1D4";
  else if (combined <= 204) return "+1D6";
  else if (combined <= 284) return "+2D6";
  else if (combined <= 364) return "+3D6";
  else if (combined <= 444) return "+4D6";
  else return "+5D6";
}

function calculateBuild(str: number, siz: number): number {
  const combined = str + siz;
  if (combined <= 64) return -2;
  else if (combined <= 84) return -1;
  else if (combined <= 124) return 0;
  else if (combined <= 164) return 1;
  else if (combined <= 204) return 2;
  else if (combined <= 284) return 3;
  else if (combined <= 364) return 4;
  else if (combined <= 444) return 5;
  else return 6;
}

function calculateMove(dex: number, str: number, siz: number): number {
  if (dex < siz && str < siz) return 7;
  else if (dex > siz && str > siz) return 9;
  else return 8;
}

// Function to initialize the character data from JSON
export const initializeCharacter = (jsonData?: CharacterType) => {
  let characterData: CharacterType = { ...defaultCharacterData };

  if (jsonData) {
    // Merge the JSON data with the default character data
    characterData = { ...characterData, ...jsonData };

    // Transform skills array to a dictionary
    if (Array.isArray(jsonData.skills)) {
      characterData.skills = jsonData.skills.reduce((acc: Record<string, SkillType>, skill: any) => {
        acc[skill.name] = {
          name: { en: skill.name }, // Assuming the name is in English
          basePoint: skill.basePoint,
          occupationPoint: skill.occupationPoint,
          interestPoint: skill.interestPoint,
          growthPoint: skill.growthPoint,
          hasSucceeded: skill.hasSucceeded,
        };
        return acc;
      }, {} as Record<string, SkillType>);
    } else {
      console.warn("Skills data in JSON is not in the expected format. Using default skills.");
    }
  } else {
    characterData = {
      ...characterData,
      id: generateRandomId(),
      name: "New Character",
      playerName: "New Player",
    };
  }

  characterData.derivedAttributes = calculateDerivedAttributes(characterData.attributes);
  console.log(characterData.skills);
  characterStore.set(characterData);
};

// Add this new derived store
export const localizedSkills = derived(
  [characterStore, languageStore],
  ([$characterStore, $languageStore]) => {
    if (!$characterStore) return {};
    
    return Object.entries($characterStore.skills).reduce((acc, [key, skill]) => {
      const skillInfo = skillList.skills.find(s => s.name.en === key);
      
      // Use skill list translation if available, otherwise fallback to loaded JSON
      const name = skillInfo?.name || skill.name || { en: 'Unknown Skill', cn: '未知技能' };
      
      acc[key] = {
        ...skill,
        name: {
          en: name.en,
          cn: name.cn
        },
        description: skillInfo?.description || { en: '', cn: '' }
      };
      return acc;
    }, {} as Record<string, SkillType & { name: { [key: string]: string }, description: { [key: string]: string } }> );
  }
);
