import { createKey } from '@strict-store/app/create-key';
import { StrictStore } from 'strict-store';
import { StoreKey } from '@core/entities/store-key.entity';
import type { Persistable } from '@core/entities/persistable.entity';
import { describe, test, expect, beforeEach } from 'vitest';

describe('forEach method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('should iterate over all StrictStore-managed keys in both storages', () => {
    const key1 = createKey<string>('ns1', 'k1', 'local');
    const key2 = createKey<number>('ns2', 'k2', 'session');
    const key3 = createKey<boolean>('ns1', 'k3', 'local');

    StrictStore.save(key1, 'foo');
    StrictStore.save(key2, 42);
    StrictStore.save(key3, true);

    const seen: Array<{ key: StoreKey<Persistable>; value: unknown }> = [];
    StrictStore.forEach((key, value) => {
      seen.push({ key, value });
    });

    expect(seen).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: expect.objectContaining({ ns: 'ns1', name: 'k1' }),
          value: 'foo',
        }),
        expect.objectContaining({
          key: expect.objectContaining({ ns: 'ns2', name: 'k2' }),
          value: 42,
        }),
        expect.objectContaining({
          key: expect.objectContaining({ ns: 'ns1', name: 'k3' }),
          value: true,
        }),
      ]),
    );
    expect(seen.length).toBe(3);
  });

  test('forEach iterates over all items and passes correct arguments', () => {
    const key1 = createKey<string>('ns', 'k1');
    const key2 = createKey<number>('ns', 'k2', 'session');
    StrictStore.save(key1, 'v1');
    StrictStore.save(key2, 2);

    const seen: Array<{ key: StoreKey<Persistable>; value: Persistable }> = [];
    StrictStore.forEach((key, value) => {
      seen.push({ key, value });
    });

    expect(seen.length).toBe(2);
    expect(
      seen.some((e) => e.key.name === 'k1' && e.value === 'v1' && e.key.storeType === 'local'),
    ).toBe(true);
    expect(
      seen.some((e) => e.key.name === 'k2' && e.value === 2 && e.key.storeType === 'session'),
    ).toBe(true);
  });

  test('should filter by namespace if ns is provided as array', () => {
    const key1 = createKey<string>('ns1', 'k1', 'local');
    const key2 = createKey<number>('ns2', 'k2', 'session');
    const key3 = createKey<boolean>('ns1', 'k3', 'local');

    StrictStore.save(key1, 'foo');
    StrictStore.save(key2, 42);
    StrictStore.save(key3, true);

    const seen: Array<{ key: StoreKey<Persistable>; value: unknown }> = [];
    StrictStore.forEach(
      (key, value) => {
        seen.push({ key, value });
      },
      ['ns1'],
    );

    expect(seen.length).toBe(2);
    expect(seen.every((item) => item.key.ns === 'ns1')).toBe(true);
  });

  test('should filter by multiple namespaces', () => {
    const key1 = createKey<string>('ns1', 'k1', 'local');
    const key2 = createKey<number>('ns2', 'k2', 'session');
    const key3 = createKey<boolean>('ns3', 'k3', 'local');

    StrictStore.save(key1, 'foo');
    StrictStore.save(key2, 42);
    StrictStore.save(key3, true);

    const seen: Array<{ key: StoreKey<Persistable>; value: unknown }> = [];
    StrictStore.forEach(
      (key, value) => {
        seen.push({ key, value });
      },
      ['ns1', 'ns3'],
    );

    expect(seen.length).toBe(2);
    expect(seen.map((item) => item.key.ns).sort()).toEqual(['ns1', 'ns3']);
  });

  test('should not call callback for non-StrictStore keys', () => {
    localStorage.setItem('randomKey', '123');
    sessionStorage.setItem('anotherKey', '456');

    const key = createKey<string>('ns', 'k', 'local');
    StrictStore.save(key, 'foo');

    const seen: StoreKey<Persistable>[] = [];
    StrictStore.forEach((key) => seen.push(key));

    expect(seen.length).toBe(1);
    expect(seen[0].ns).toBe('ns');
    expect(seen[0].name).toBe('k');
  });
});
