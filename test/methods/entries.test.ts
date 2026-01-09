import { StrictStore } from 'strict-store';
import { keys } from '@test/entities/key.entities';
import { describe, test, expect, beforeEach } from 'vitest';

describe('Entries method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('returns empty array when store is empty', () => {
    const res = StrictStore.entries();

    expect(res.length).toBe(0);
    expect(res).toEqual([]);
  });

  test('returns single entry when one key is stored', () => {
    StrictStore.save(keys.stringKey, 'string');

    const res = StrictStore.entries();

    expect(res.length).toBe(1);
    expect(res).toEqual([
      {
        key: keys.stringKey,
        value: 'string',
      },
    ]);
  });

  test('returns all entries when multiple keys are stored', () => {
    StrictStore.save(keys.stringKey, 'string');
    StrictStore.save(keys.numberKey, 321);
    StrictStore.save(keys.booleanKey, false);

    const res = StrictStore.entries();

    expect(res.length).toBe(3);
    expect(res).toEqual([
      {
        key: keys.stringKey,
        value: 'string',
      },
      {
        key: keys.numberKey,
        value: 321,
      },
      {
        key: keys.booleanKey,
        value: false,
      },
    ]);
  });

  test('returns empty array when called with undefined namespace filter', () => {
    const res = StrictStore.entries(undefined);

    expect(res.length).toBe(0);
    expect(res).toEqual([]);
  });

  test('returns empty array when namespace filter matches no entries', () => {
    const res = StrictStore.entries(['ns1']);

    expect(res.length).toBe(0);
    expect(res).toEqual([]);
  });

  test('returns empty array when multiple namespace filters match no entries', () => {
    const res = StrictStore.entries(['ns1', 'ns2']);

    expect(res.length).toBe(0);
    expect(res).toEqual([]);
  });

  test('returns empty array when namespace filter does not exist in store', () => {
    StrictStore.save(keys.ns1Key, 'ns1');
    StrictStore.save(keys.ns2Key, 'ns2');
    StrictStore.save(keys.ns3Key, 'ns3');
    StrictStore.save(keys.ns4Key, 'ns4');

    const res = StrictStore.entries(['ns5']);

    expect(res.length).toBe(0);
    expect(res).toEqual([]);
  });

  test('returns only entries matching provided namespace list', () => {
    StrictStore.save(keys.ns1Key, 'ns1');
    StrictStore.save(keys.ns2Key, 'ns2');
    StrictStore.save(keys.ns3Key, 'ns3');
    StrictStore.save(keys.ns4Key, 'ns4');

    const res = StrictStore.entries(['ns1', 'ns2', 'ns5']);

    expect(res.length).toBe(2);
    expect(res).toEqual([
      {
        key: keys.ns1Key,
        value: 'ns1',
      },
      {
        key: keys.ns2Key,
        value: 'ns2',
      },
    ]);
  });

  test('returns entries matching namespace regardless of key name', () => {
    StrictStore.save(keys.stringKey, 'test-ns');
    StrictStore.save(keys.numberKey, 321);

    const res = StrictStore.entries(['test-ns']);

    expect(res.length).toBe(2);
    expect(res).toEqual([
      {
        key: keys.stringKey,
        value: 'test-ns',
      },
      {
        key: keys.numberKey,
        value: 321,
      },
    ]);
  });
});
