import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';
import { keyPolicy } from '@core/policies/key.policy';

describe('Clear method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('returns empty result when store is empty', () => {
    expect(StrictStore.has(keys.stringKey)).toBe(false);

    const clear = StrictStore.clear();
    expect(clear.length).toBe(0);
  });

  test('returns empty array when no keys are cleared', () => {
    expect(StrictStore.has(keys.stringKey)).toBe(false);

    const value = StrictStore.clear();
    expect(value).toEqual([]);
  });

  test('clears a single stored entry and returns one item', () => {
    expect(StrictStore.has(keys.stringKey)).toBe(false);
    StrictStore.save(keys.stringKey, 'string');

    const clear = StrictStore.clear();
    expect(clear.length).toBe(1);
  });

  test('clears multiple stored entries and returns all items', () => {
    expect(StrictStore.has(keys.numberKey)).toBe(false);
    expect(StrictStore.has(keys.stringKey)).toBe(false);
    expect(StrictStore.has(keys.booleanKey)).toBe(false);

    StrictStore.save(keys.numberKey, 123);
    StrictStore.save(keys.stringKey, 'string');
    StrictStore.save(keys.booleanKey, true);

    const clear = StrictStore.clear();
    expect(clear.length).toBe(3);
  });

  test('clears only entries matching specified namespaces across storages', () => {
    expect(StrictStore.has(keys.ns1Key)).toBe(false);
    expect(StrictStore.has(keys.ns2Key)).toBe(false);
    expect(StrictStore.has(keys.ns3Key)).toBe(false);
    expect(StrictStore.has(keys.ns4Key)).toBe(false);

    StrictStore.save(keys.ns1Key, 'ns1');
    StrictStore.save(keys.ns2Key, 'ns2');
    StrictStore.save(keys.ns3Key, 'ns3');
    StrictStore.save(keys.ns4Key, 'ns4');

    const result1 = StrictStore.clear(['ns1']);
    expect(result1.length).toBe(1);

    const result2 = StrictStore.clear(['ns2', 'ns3']);
    expect(result2.length).toBe(2);

    expect(StrictStore.has(keys.ns4Key)).toBe(true);
  });

  test('returns cleared key metadata for a single entry', () => {
    expect(StrictStore.has(keys.stringKey)).toBe(false);

    StrictStore.save(keys.stringKey, 'string');

    const value = StrictStore.clear();

    expect(value).toEqual([
      {
        key: keyPolicy.makeKey(keys.stringKey.ns, keys.stringKey.name),
        storeType: keys.stringKey.storeType,
      }
    ]);
  });

  test('returns cleared key metadata without leaking stored values', () => {
    StrictStore.save(keys.ns1Key, 'ns1');
    StrictStore.save(keys.ns2Key, 'ns2');
    StrictStore.save(keys.ns3Key, 'ns3');
    StrictStore.save(keys.ns4Key, 'ns4');

    const res = StrictStore.clear();

    res.forEach((item) => {
      expect(item).toEqual({
        key: item.key,
        storeType: item.storeType,
      })
    });
  });
});
