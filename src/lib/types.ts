import { translations } from './i18n/translations';

export type AttributeType = {
  str: number;
  con: number;
  siz: number;
  dex: number;
  app: number;
  int: number;
  pow: number;
  edu: number;
  luck: number;
};

export enum HealthStatus {
  Normal = 'normal',
  MajorWound = 'majorWound',
  Unconscious = 'unconscious',
  Dying = 'dying',
  Dead = 'dead'
}

export enum InsanityStatus {
  Normal = 'normal',
  TemporaryInsanity = 'temporaryInsanity',
  IndefiniteInsanity = 'indefiniteInsanity'
}

export type DerivedAttributeType = {
  maxHp: number,
  currentHp: number,
  initialSan: number,
  currentSan: number,
  maxMp: number,
  currentMp: number,
  db: string,
  build: number,
  move: number,
  armor: number,
  healthStatus: HealthStatus,
  insanityStatus: InsanityStatus,
};

export type BackstoryType = {
  personalDescription: string;
  ideologyAndBelief: string;
  significantPeople: string;
  meaningfulLocations: string;
  treasuredPossessions: string;
  traits: string;
  injuriesAndScars: string;
  phobiasAndManias: string;
  arcaneTomesSpellsAndArtifacts: string;
  encountersWithStrangeEntities: string;
};

export type InventoryType = {
  gearsAndPossessions: string[];
  spendingLevel: number;
  cash: number;
  assets: string[];
  weapons: WeaponType[];
};

export type WeaponType = {
  name: string;
  skill: string;
  baseDamage: string;
  range: string;
  maxAttacks: number;
  clipSize: number;
  malfunction: number;
  canPenetrate: boolean;
};

export type CharacterType = {
  id: string;
  name: string;
  playerName: string;
  type: string;
  age: number;
  gender: string;
  occupation: string;
  birthplace: string;
  residence: string;
  image: string;
  attributes: AttributeType;
  derivedAttributes: DerivedAttributeType;
  skills: Record<string, SkillType>; // Use Record to represent skills as a dictionary with keys of type string
  backstory: BackstoryType;
  inventory: InventoryType;
};

export interface SkillType {
  name: {
    [key: string]: string;
  };
  basePoint: number;
  occupationPoint: number;
  interestPoint: number;
  growthPoint: number;
  hasSucceeded: boolean;
}
