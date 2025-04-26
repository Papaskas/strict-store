import { Serializable, StoreKey } from './types';

export class TypeStore {

  /**
   * Returns the current value associated with the given key, or null if the given key does not exist.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/getItem)
   */
  static get<T extends Serializable>(key: StoreKey<T>): T | null {
    const fullKey = this.getFullKey(key.namespace, key.key);
    const storedValue = localStorage.getItem(fullKey);

    if (storedValue === null) {
      return key.defaultValue ?? null;
    }

    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return storedValue as T;
    }
  }

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/setItem)
   */
  static save<T extends Serializable>(key: StoreKey<T>, value: T): void {
    const fullKey = this.getFullKey(key.namespace, key.key);
    localStorage.setItem(fullKey, JSON.stringify(value));
  }

  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/removeItem)
   */
  static remove<T extends Serializable>(storeKey: StoreKey<T>): void {
    const fullKey = this.getFullKey(storeKey.namespace, storeKey.key);
    localStorage.removeItem(fullKey);
  }

  static has(storeKey: StoreKey<Serializable>): boolean {
    const fullKey = this.getFullKey(storeKey.namespace, storeKey.key);
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Removes all key/value pairs if there are any.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/clear)
   */
  static clear() {
    localStorage.clear();
  }

  static clearNamespace(namespace: string): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${namespace}:`)) {
        localStorage.removeItem(key);
      }
    });
  }

  private static getFullKey(namespace: string, key: string): string {
    return `${namespace}:${key}`
  }
}
