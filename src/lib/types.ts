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
  derivedAttributes?: object;
  skills?: object;
  // other fields can be added based on your schema
};