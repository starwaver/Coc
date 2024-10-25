// src/stores/characterStore.ts
import { writable, derived } from 'svelte/store';
import { languageStore } from './languageStore';
import type { CharacterType, AttributeType, DerivedAttributeType, SkillType, BackstoryType } from '$lib/types';
import type { Language } from '$lib/i18n/translations';
import skillList from '$lib/skill_list.json';

// Create a writable store with the initial value as null
export const characterStore = writable<CharacterType | null>(null);

// Add this new store for language

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
    maxHp: 0,
    currentHp: 0,
    majorWound: false,
    unconscious: false,
    dying: false,
    initialSan: 0,
    currentSan: 0,
    temporaryInsanity: false,
    indefiniteInsanity: false,
    maxMp: 0,
    currentMp: 0,
    db: "0",
    build: 0,
    move: 0,
  },
  backstory: {
    personalDescription: "",
    ideologyAndBelief: "",
    significantPeople: "",
    meaningfulLocations: "",
    treasuredPossessions: "",
    traits: "",
    injuriesAndScars: "",
    phobiasAndManias: "",
    arcaneTomesSpellsAndArtifacts: "",
    encountersWithStrangeEntities: "",
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
  inventory: {
    gearsAndPossessions: [],
    spendingLevel: 0,
    cash: 0,
    assets: [],
    weapons: [],
  },
};

export const calculateDerivedAttributes = (attributes: AttributeType): DerivedAttributeType => {
  const maxHp = Math.floor((attributes.con + attributes.siz) / 10);
  const initialSan = attributes.pow;
  const maxMp = Math.floor(attributes.pow / 5);
  return {
    maxHp,
    currentHp: maxHp,
    majorWound: false,
    unconscious: false,
    dying: false,
    initialSan,
    currentSan: initialSan,
    temporaryInsanity: false,
    indefiniteInsanity: false,
    maxMp,
    currentMp: maxMp,
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

// Function to save character data to localStorage
export const saveCharacterToStorage = (character: CharacterType) => {
  try {
    localStorage.setItem('characterData', JSON.stringify(character));
  } catch (error) {
    console.error('Error saving character to localStorage:', error);
  }
};

// Function to load character data from localStorage
export const loadCharacterFromStorage = (): CharacterType | null => {
  try {
    const storageData = localStorage.getItem('characterData');
    return storageData ? JSON.parse(storageData) : null;
  } catch (error) {
    console.error('Error loading character from localStorage:', error);
    return null;
  }
};

// Function to clear character data from localStorage
export const clearCharacterStorage = () => {
  try {
    localStorage.removeItem('characterData');
  } catch (error) {
    console.error('Error clearing character from localStorage:', error);
  }
};

// Modify initializeCharacter function
export const initializeCharacter = (jsonData?: CharacterType, forceNew: boolean = false) => {
  let characterData: CharacterType;

  if (jsonData) {
    characterData = { ...defaultCharacterData, ...jsonData };
    
    // Transform skills array to a dictionary if necessary
    if (Array.isArray(jsonData.skills)) {
      characterData.skills = jsonData.skills.reduce((acc: Record<string, SkillType>, skill: any) => {
        acc[skill.name] = {
          name: { en: skill.name },
          basePoint: skill.basePoint,
          occupationPoint: skill.occupationPoint,
          interestPoint: skill.interestPoint,
          growthPoint: skill.growthPoint,
          hasSucceeded: skill.hasSucceeded,
        };
        return acc;
      }, {} as Record<string, SkillType>);
    }
  } else if (!forceNew) {
    const storageData = loadCharacterFromStorage();
    
    if (storageData) {
      characterData = storageData;
    } else {
      characterData = createNewCharacterData();
    }
  } else {
    characterData = createNewCharacterData();
  }

  // Use the set method of the derived store
  characterStore.set(characterData);
};

// New function to generate a single attribute value
export function generateAttributeValue(attributeName: string): number {
  const rollD6 = () => Math.floor(Math.random() * 6) + 1;
  
  if (['siz', 'int', 'edu'].includes(attributeName.toLowerCase())) {
    return (rollD6() + rollD6() + 6) * 5; // (2D6 + 6) * 5
  } else {
    return (rollD6() + rollD6() + rollD6()) * 5; // 3D6 * 5
  }
}

// New function to generate all attributes
export function generateAllAttributes(): AttributeType {
  return {
    str: generateAttributeValue('str'),
    con: generateAttributeValue('con'),
    siz: generateAttributeValue('siz'),
    dex: generateAttributeValue('dex'),
    app: generateAttributeValue('app'),
    int: generateAttributeValue('int'),
    pow: generateAttributeValue('pow'),
    edu: generateAttributeValue('edu'),
    luck: generateAttributeValue('luck'),
  };
}

function createNewCharacterData(): CharacterType {
  const newCharacter = {
    ...defaultCharacterData,
    id: generateRandomId(),
    name: "New Character",
    playerName: "New Player",
    attributes: generateAllAttributes(),
  };

  // Recalculate derived attributes based on the new random attributes
  newCharacter.derivedAttributes = calculateDerivedAttributes(newCharacter.attributes);

  // Update skills that depend on attributes
  if (newCharacter.skills["Dodge"]) {
    newCharacter.skills["Dodge"].basePoint = Math.floor(newCharacter.attributes.dex / 2);
  }

  if (newCharacter.skills["Language (Own)"]) {
    newCharacter.skills["Language (Own)"].basePoint = newCharacter.attributes.edu;
  }

  return newCharacter;
}

export const updateCharacterData = (character: CharacterType): void => {
  if (character.derivedAttributes) {
    character.derivedAttributes = calculateDerivedAttributes(character.attributes);
  }

  if (character.skills) {
    character.skills["Dodge"].basePoint = Math.floor(character.attributes.dex / 2);
    character.skills["Language (Own)"].basePoint = Math.floor(character.attributes.edu);
  }
}

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

characterStore.subscribe((character) => {
  if (character) {
    saveCharacterToStorage(character);
  }
});
