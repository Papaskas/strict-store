export interface KeyValueStoragePort {
  get(key: string): string | null;

  set(data: { key: string, value: string }): void;

  remove(key: string): void;

  key(index: number): string | null;

  length(): number;
  
  clear(): void;
}
