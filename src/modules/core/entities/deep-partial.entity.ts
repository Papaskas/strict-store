/**
 * DeepPartial<T> makes all fields of the object (and nested objects) optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends Function ? T[P] : DeepPartial<T[P]>) : T[P];
};
