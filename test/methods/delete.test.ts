import { StrictStore, createKey } from 'strict-store';

describe('StrictStore.delete (integration)', () => {
  beforeEach(() => {
    StrictStore.clear();
    jest.restoreAllMocks();
  });

  test('returns true when key existed and becomes absent after delete', () => {
    const key = createKey('ns', 'name');

    StrictStore.save(key, 123);

    expect(StrictStore.has(key)).toBe(true);
    expect(StrictStore.delete(key)).toBe(true);
    expect(StrictStore.has(key)).toBe(false);
  });

  test('returns false when key did not exist', () => {
    const key = createKey('ns', 'missing');

    expect(StrictStore.has(key)).toBe(false);
    expect(StrictStore.delete(key)).toBe(false);
    expect(StrictStore.has(key)).toBe(false);
  });

  test('batch delete returns per-key results in order', () => {
    const k1 = createKey('a', '1');
    const k2 = createKey('a', '2');

    StrictStore.save(k1, 'v1');
    // k2 not saved

    const result = StrictStore.delete([k1, k2]);

    expect(result).toEqual([true, false]);
    expect(StrictStore.has([k1, k2])).toEqual([false, false]);
  });

  test('deleting same key twice returns true then false', () => {
    const key = createKey('ns', 'twice');

    StrictStore.save(key, 'x');

    expect(StrictStore.delete(key)).toBe(true);
    expect(StrictStore.delete(key)).toBe(false);
  });

  test('empty array input returns [] and changes nothing', () => {
    // Keep this test ONLY if your overload accepts StoreKey[]
    // and you intentionally allow empty arrays.
    const key = createKey('ns', 'present');
    StrictStore.save(key, 1);

    const result = StrictStore.delete([]);

    expect(result).toEqual([]);
    expect(StrictStore.has(key)).toBe(true);
  });
});
