import { StrictStore } from '../src/interface';
import { Keys } from './entities/key.entities';

describe('StrictStore', () => {
  describe('StrictStore basic operations', () => {
    test('returns null for non-existent key', () => {
      expect(StrictStore.get(Keys.stringKey)).toBe(null);
    });
  });
});
