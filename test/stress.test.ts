import { StrictStore, createKey } from '@src/strict-store';

describe('StrictStore stress tests', () => {
  beforeEach(() => {
    StrictStore.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('handles saving and retrieving 1000+ items in localStorage', () => {
    const keys = [];
    for (let i = 0; i < 1000; i++) {
      const key = createKey<number>('stress', `local-${i}`, 'local');
      StrictStore.save(key, i);
      keys.push(key);
    }
    for (let i = 0; i < 1000; i++) {
      expect(StrictStore.get(keys[i])).toBe(i);
    }
    expect(StrictStore.size(['stress'])).toBe(1000);
  });

  test('handles saving and retrieving 1000+ items in sessionStorage', () => {
    const keys = [];
    for (let i = 0; i < 1000; i++) {
      const key = createKey<number>('stress', `session-${i}`, 'session');
      StrictStore.save(key, i);
      keys.push(key);
    }
    for (let i = 0; i < 1000; i++) {
      expect(StrictStore.get(keys[i])).toBe(i);
    }
    expect(StrictStore.size(['stress'])).toBe(1000);
  });

  test('entries returns all items for large datasets', () => {
    for (let i = 0; i < 500; i++) {
      StrictStore.save(createKey<number>('stress', `a-${i}`, 'local'), i);
      StrictStore.save(createKey<number>('stress', `b-${i}`, 'session'), i);
    }
    const all = StrictStore.entries(['stress']);
    expect(all.length).toBe(1000);

    const names = new Set(all.map(e => e.key.name));
    expect(names.size).toBe(1000);
  });

  test('clear removes all items in large dataset', () => {
    for (let i = 0; i < 500; i++) {
      StrictStore.save(createKey<number>('stress', `a-${i}`, 'local'), i);
      StrictStore.save(createKey<number>('stress', `b-${i}`, 'session'), i);
    }
    StrictStore.clear(['stress']);
    expect(StrictStore.size(['stress'])).toBe(0);
    expect(StrictStore.entries(['stress'])).toEqual([]);
  });

  test('remove works for large batch', () => {
    const keys: ReturnType<typeof createKey<number>>[] = [];
    for (let i = 0; i < 500; i++) {
      const key = createKey<number>('stress', `rm-${i}`, 'local');
      StrictStore.save(key, i);
      keys.push(key);
    }
    StrictStore.remove(keys);
    for (const key of keys) {
      expect(StrictStore.get(key)).toBe(null);
    }
    expect(StrictStore.size(['stress'])).toBe(0);
  });

  test('forEach iterates over all items in large dataset', () => {
    for (let i = 0; i < 300; i++) {
      StrictStore.save(createKey<number>('stress', `f-${i}`, 'local'), i);
      StrictStore.save(createKey<number>('stress', `g-${i}`, 'session'), i);
    }
    let count = 0;
    StrictStore.forEach((key, value, storageType) => {
      expect(key.ns).toBe('stress');
      expect(typeof value).toBe('number');
      expect(['local', 'session']).toContain(storageType);
      count++;
    }, ['stress']);
    expect(count).toBe(600);
  });

  test('merge works for large objects', () => {
    const key = createKey<{ [k: string]: number }>('stress', 'bigobj', 'local');
    const bigObj: { [k: string]: number } = {};
    for (let i = 0; i < 1000; i++) {
      bigObj[`k${i}`] = i;
    }
    StrictStore.save(key, bigObj);

    const patch: { [k: string]: number } = {};
    for (let i = 0; i < 500; i++) {
      patch[`k${i}`] = i * 2;
    }
    StrictStore.merge(key, patch);

    const result = StrictStore.get(key)!;
    for (let i = 0; i < 1000; i++) {
      if (i < 500) {
        expect(result[`k${i}`]).toBe(i * 2);
      } else {
        expect(result[`k${i}`]).toBe(i);
      }
    }
  });
});
