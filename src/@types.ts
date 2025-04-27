export type Serializable = string | number | bigint | boolean | object | [] | null;

export type StoreKey<T extends Serializable> = {
  ns: string;
  key: string;
  defaultValue: T;
};
