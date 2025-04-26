export type Serializable = string | number | boolean | object | undefined;

export type StoreKey<T extends Serializable> = {
  namespace: string;
  key: string;
  defaultValue?: T;
};
