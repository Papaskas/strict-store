export type Serializable = string | number | boolean | object | undefined;

export type StorageKey<T extends Serializable> = {
  ns: string;
  key: string;
  defaultValue?: T;
};
