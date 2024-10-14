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
  hp: number,
  san: number,
  mp: number,
  db: string,
  build: number,
  move: number,
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
};

export type SkillType = {
  name: string;            // Skill name
  hasSucceeded: boolean;   // Whether the skill has succeeded
  basePoint: number;       // Base value for the skill
  occupationPoint: number; // Occupation value assigned by the character
  interestPoint: number;   // Interest points assigned by the character
  growthPoint: number;    // Growth points assigned by the character
};
