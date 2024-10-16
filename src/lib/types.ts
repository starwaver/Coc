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

export type DerivedAttributeType = {
  maxHp: number,
  initialSan: number,
  maxMp: number,
  db: string,
  build: number,
  move: number,
};

export type BackstoryType = {
  personalDescription: string;
  traits: string;
  ideologyAndBelief: string;
  injuriesAndScars: string;
  significantPeople: string;
  phobiasAndManias: string;
  meaningfulLocations: string;
  treasuredPossessions: string;
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
