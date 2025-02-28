// src/stores/characterStore.ts
import { writable, derived, get } from 'svelte/store';
import { languageStore } from './languageStore';
import type { CharacterType, AttributeType, DerivedAttributeType, SkillType} from '$lib/types';
import { HealthStatus, InsanityStatus } from '$lib/types';
import skillList from '$lib/skill_list.json';
import { charactersStore, currentCharacterIndex, saveCharacters } from './multiCharacterStore';

const generateRandomId = () => Math.random().toString(36).substring(2, 11);

const defaultCharacterData: CharacterType = {
  id: '',
  name: "Unnamed Character",
  playerName: "Unnamed Player",
  type: "PC",
  age: 0,
  gender: "Unknown",
  occupation: "Unselected",
  birthplace: "Not set",
  residence: "Not set",
  image: "./data/character_placeholder.png",
  attributes: {
    str: 0, dex: 0, int: 0, con: 0, app: 0, pow: 0, siz: 0, edu: 0, luck: 0
  },
  derivedAttributes: {
    maxHp: 0, currentHp: 0,
    initialSan: 0, currentSan: 0,
    maxMp: 0, currentMp: 0,
    db: "0", build: 0, move: 0,
    healthStatus: HealthStatus.Normal,
    insanityStatus: InsanityStatus.Normal,
  },
  backstory: {
    personalDescription: "", ideologyAndBelief: "", significantPeople: "",
    meaningfulLocations: "", treasuredPossessions: "", traits: "",
    injuriesAndScars: "", phobiasAndManias: "", arcaneTomesSpellsAndArtifacts: "",
    encountersWithStrangeEntities: "",
  },
  skills: {},
  inventory: {
    gearsAndPossessions: [], spendingLevel: 0, cash: 0, assets: [], weapons: [],
  },
};

const attributeUtils = {
  generateValue: (attributeName: string): number => {
    const rollD6 = () => Math.floor(Math.random() * 6) + 1;
    return ['siz', 'int', 'edu'].includes(attributeName.toLowerCase())
      ? (rollD6() + rollD6() + 6) * 5
      : (rollD6() + rollD6() + rollD6()) * 5;
  },

  generateAll: (): AttributeType => ({
    str: attributeUtils.generateValue('str'),
    dex: attributeUtils.generateValue('dex'),
    int: attributeUtils.generateValue('int'),
    con: attributeUtils.generateValue('con'),
    app: attributeUtils.generateValue('app'),
    pow: attributeUtils.generateValue('pow'),
    siz: attributeUtils.generateValue('siz'),
    edu: attributeUtils.generateValue('edu'),
    luck: attributeUtils.generateValue('luck'),
  }),
};

const derivedAttributeUtils = {
  calculate: (attributes: AttributeType): DerivedAttributeType => ({
    maxHp: Math.floor((attributes.con + attributes.siz) / 10),
    currentHp: Math.floor((attributes.con + attributes.siz) / 10),
    initialSan: attributes.pow,
    currentSan: attributes.pow,
    maxMp: Math.floor(attributes.pow / 5),
    currentMp: Math.floor(attributes.pow / 5),
    db: derivedAttributeUtils.calculateDamageBonus(attributes.str, attributes.siz),
    build: derivedAttributeUtils.calculateBuild(attributes.str, attributes.siz),
    move: derivedAttributeUtils.calculateMove(attributes.dex, attributes.str, attributes.siz),
    healthStatus: HealthStatus.Normal,
    insanityStatus: InsanityStatus.Normal,
  }),

  calculateDamageBonus: (str: number, siz: number): string => {
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
  },

  calculateBuild: (str: number, siz: number): number => {
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
  },

  calculateMove: (dex: number, str: number, siz: number): number => {
    if (dex < siz && str < siz) return 7;
    else if (dex > siz && str > siz) return 9;
    else return 8;
  },
};

const characterUtils = {
  createNew: (): CharacterType => {
    const attributes = attributeUtils.generateAll();
    return {
      ...defaultCharacterData,
      id: generateRandomId(),
      name: "New Character",
      playerName: "New Player",
      attributes,
      derivedAttributes: derivedAttributeUtils.calculate(attributes),
      skills: characterUtils.initializeSkills(attributes),
    };
  },

  initializeSkills: (attributes: AttributeType): Record<string, SkillType> => {
    const skills = skillList.skills.reduce((acc, skill) => {
      acc[skill.name.en] = {
        name: { en: skill.name.en, cn: skill.name.cn },
        basePoint: skill.base_percent,
        occupationPoint: 0,
        interestPoint: 0,
        growthPoint: 0,
        hasSucceeded: false,
      };
      return acc;
    }, {} as Record<string, SkillType>);

    if (skills["Dodge"]) {
      skills["Dodge"].basePoint = Math.floor(attributes.dex / 2);
    }

    if (skills["Language (Own)"]) {
      skills["Language (Own)"].basePoint = attributes.edu;
    }

    return skills;
  },

  update: (character: CharacterType): void => {
    if (character.derivedAttributes) {
      character.derivedAttributes = derivedAttributeUtils.calculate(character.attributes);
    }

    if (character.skills) {
      character.skills["Dodge"].basePoint = Math.floor(character.attributes.dex / 2);
      character.skills["Language (Own)"].basePoint = character.attributes.edu;
    }
  },
};

const storageUtils = {
  save: (character: CharacterType) => {
    try {
      localStorage.setItem('characterData', JSON.stringify(character));
    } catch (error) {
      console.error('Error saving character to localStorage:', error);
    }
  },

  load: (): CharacterType | null => {
    try {
      const storageData = localStorage.getItem('characterData');
      return storageData ? JSON.parse(storageData) : null;
    } catch (error) {
      console.error('Error loading character from localStorage:', error);
      return null;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem('characterData');
    } catch (error) {
      console.error('Error clearing character from localStorage:', error);
    }
  },
};

export const characterStore = writable<CharacterType | null>(null);

export const localizedSkills = derived(
  [characterStore, languageStore],
  ([$characterStore, $languageStore]) => {
    if (!$characterStore) return {};
    
    return Object.entries($characterStore.skills).reduce((acc, [key, skill]) => {
      const skillInfo = skillList.skills.find(s => s.name.en === key);
      
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

export const initializeCharacter = (jsonData?: CharacterType, forceNew: boolean = false) => {
  let characterData: CharacterType;

  if (jsonData) {
    characterData = { ...defaultCharacterData, ...jsonData };
    
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
    const storageData = storageUtils.load();
    characterData = storageData || characterUtils.createNew();
  } else {
    characterData = characterUtils.createNew();
  }

  charactersStore.update(characters => {
    const newCharacters = [...characters, characterData];
    saveCharacters(newCharacters);
    return newCharacters;
  });
  currentCharacterIndex.set(get(charactersStore).length - 1);
  characterStore.set(characterData);
};

characterStore.subscribe((character) => {
  if (character) {
    charactersStore.update(characters => {
      const index = get(currentCharacterIndex);
      if (index >= 0 && index < characters.length) {
        characters[index] = character;
        saveCharacters(characters);
      }
      return characters;
    });
  }
});

export const generateAttributeValue = attributeUtils.generateValue;
export const generateAllAttributes = attributeUtils.generateAll;
export const updateCharacterData = characterUtils.update;
export const saveCharacterToStorage = storageUtils.save;
export const loadCharacterFromStorage = storageUtils.load;
export const clearCharacterStorage = storageUtils.clear;
