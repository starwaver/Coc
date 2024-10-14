// src/stores/characterStore.ts
import { writable } from 'svelte/store';
import type { CharacterType, AttributeType, DerivedAttributeType } from '$lib/types';
import skillList from '$lib/skill_list.json';

// Create a writable store with the initial value as null
export const characterStore = writable<CharacterType | null>(null);

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
    acc[skill.name] = {
      name: skill.name,
      basePoint: skill.base_percent,
      occupationPoint: 0,
      interestPoint: 0,
      growthPoint: 0,
      hasSucceeded: false,
    };
    return acc;
  }, {} as Record<string, {
    name: string;
    hasSucceeded: boolean;
    basePoint: number;
    occupationPoint: number;
    interestPoint: number;
    growthPoint: number; 
  }>),
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
export const initializeCharacter = async (jsonFile?: string) => {
  let characterData = defaultCharacterData;
  characterData.derivedAttributes = calculateDerivedAttributes(characterData.attributes);

  if (jsonFile) {
    try {
      const response = await fetch(jsonFile);
      const jsonData = await response.json();
      characterData = { ...defaultCharacterData, ...jsonData };
      
      if (Array.isArray(jsonData.skills)) {
        characterData.skills = jsonData.skills.reduce((acc: Record<string, {
          name: string;
          hasSucceeded: boolean;
          basePoint: number;
          occupationPoint: number;
          interestPoint: number;
          growthPoint: number;
        }>, skill: {
          name: string;
          basePoint: number;
          occupationPoint: number;
          interestPoint: number;
          growthPoint: number;
          hasSucceeded: boolean;
        }) => {
          acc[skill.name] = {
            name: skill.name,
            basePoint: skill.basePoint,
            occupationPoint: skill.occupationPoint,
            interestPoint: skill.interestPoint,
            growthPoint: skill.growthPoint,
            hasSucceeded: skill.hasSucceeded,
          };
          return acc;
        }, {} as Record<string, {
          name: string;
          hasSucceeded: boolean;
          basePoint: number;
          occupationPoint: number;
          interestPoint: number;
          growthPoint: number; 
        }>);
      } else {
        console.warn("Skills data in JSON is not in the expected format. Using default skills.");
      }
    } catch (error) { 
      console.error("Failed to load character data from JSON:", error);
    }
  }

  characterStore.set(characterData);
};
