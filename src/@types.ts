export type Serializable = string | number | bigint | boolean | object | [] | null;

export type StorageKey<T extends Serializable> = {
  ns: string;
  key: string;
  defaultValue: T;
};
