import { StrictStore, createKey } from 'strict-store';

describe('Size method', () => {
  beforeEach(() => {
    StrictStore.clear();
  });

  test('returns 0 when entries() returns empty array', () => {
    const spy = jest.spyOn(StrictStore, 'entries').mockReturnValue([]);
    expect(StrictStore.size()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(undefined);
  });

  test('returns entries().length for non-empty result', () => {
    const entries = [
      { key: createKey('ns', 'k1'), value: 1 },
      { key: createKey('ns', 'k2'), value: 2 },
      { key: createKey('ns', 'k3'), value: 3 },
    ] satisfies ReturnType<(typeof StrictStore)['entries']>;

    jest.spyOn(StrictStore, 'entries').mockReturnValue(entries);

    expect(StrictStore.size()).toBe(3);
  });

  test('passes ns through to entries(ns)', () => {
    const ns = ['user'];

    const spy = jest.spyOn(StrictStore, 'entries').mockReturnValue([
      { key: createKey('user', 'k'), value: 1 },
    ]);

    StrictStore.size(ns);

    expect(spy).toHaveBeenCalledWith(ns);
  });

  test('works with multiple namespaces', () => {
    const ns = ['user', 'settings'];

    const spy = jest.spyOn(StrictStore, 'entries').mockReturnValue([
      { key: createKey('user', 'k1'), value: 1 },
      { key: createKey('settings', 'k2'), value: 2 },
    ]);

    expect(StrictStore.size(ns)).toBe(2);
    expect(spy).toHaveBeenCalledWith(ns);
  });


  test('does not mutate the ns array', () => {
    const ns = ['user', 'settings'];
    const snapshot = [...ns];

    const spy = jest
      .spyOn(StrictStore, 'entries')
      .mockReturnValue([]);

    StrictStore.size(ns);

    // Ensure size passed ns into entries
    expect(spy).toHaveBeenCalledWith(ns);

    // Ensure ns not mutated
    expect(ns).toEqual(snapshot);
  });


  test('has no side-effects on web storages (localStorage/sessionStorage)', () => {
    localStorage.setItem('x', '1');
    sessionStorage.setItem('y', '2');

    jest.spyOn(StrictStore, 'entries').mockReturnValue([]);

    StrictStore.size();

    expect(localStorage.getItem('x')).toBe('1');
    expect(sessionStorage.getItem('y')).toBe('2');
  });
});
