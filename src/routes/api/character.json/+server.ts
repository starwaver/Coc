import { json } from '@sveltejs/kit';
import character from '$lib/data/example_character.json';

export const GET = async () => {
  return json(character);
};
