export type Serializable = string | number | boolean | object | undefined;

export type StorageKey<T extends Serializable> = {
  namespace: string;
  key: string;
  defaultValue?: T;
};
