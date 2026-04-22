import { shouldSeed } from '../drizzle/seed-utils';

describe('shouldSeed', () => {
  it('returns true when there are no existing users', () => {
    expect(shouldSeed(0)).toBe(true);
  });

  it('returns false when users already exist', () => {
    expect(shouldSeed(1)).toBe(false);
    expect(shouldSeed(5)).toBe(false);
  });
});