import { StrictStore, createKey } from 'strict-store';
import { describe, test, expect, beforeEach } from 'vitest';

describe('Save method', () => {
  test('save to another key as one name and ns', () => {
    const name = 'key';
    const stringKey = createKey<string>(name, name);
    const numberKey = createKey<number>(name, name);
  });
});
