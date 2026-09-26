import type { SelectPerson } from '../interfaces';

/** Stable object references used to demonstrate object-valued Select options. */
export const SELECT_PEOPLE: readonly [SelectPerson, SelectPerson, SelectPerson] = [
  { id: 'ada', name: 'Ada Lovelace', team: 'engineering' },
  { id: 'grace', name: 'Grace Hopper', team: 'engineering' },
  { id: 'margaret', name: 'Margaret Hamilton', team: 'platform' },
];
