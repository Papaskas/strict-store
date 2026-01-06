import { NonEmptyTuple } from 'type-fest';

export const tuplePolicy = {
  isNonEmptyTuple: <T>(value: unknown): value is NonEmptyTuple<T> => {
    return Array.isArray(value) && value.length > 0;
  },
};
