import { describe, it, expect } from 'vitest';
import { getMemeCategory, selectMeme } from '../memeData';

describe('getMemeCategory', () => {
  it('returns "random" for empty votes', () => {
    expect(getMemeCategory([])).toBe('random');
  });

  it('returns "break" when coffee is voted', () => {
    expect(getMemeCategory(['5', 'coffee'])).toBe('break');
    expect(getMemeCategory(['coffee'])).toBe('break');
  });

  it('returns "break" when coffee emoji is voted', () => {
    expect(getMemeCategory(['5', '\u2615'])).toBe('break');
  });

  it('returns "confused" when ? is voted', () => {
    expect(getMemeCategory(['5', '?'])).toBe('confused');
  });

  it('prioritizes break over confused', () => {
    expect(getMemeCategory(['coffee', '?'])).toBe('break');
  });

  it('returns "consensus" when all votes are the same', () => {
    expect(getMemeCategory(['5', '5', '5'])).toBe('consensus');
  });

  it('returns "chaos" when spread > 5', () => {
    expect(getMemeCategory(['1', '8'])).toBe('chaos');
    expect(getMemeCategory(['2', '13'])).toBe('chaos');
  });

  it('returns "random" for normal spread', () => {
    expect(getMemeCategory(['3', '5'])).toBe('random');
    expect(getMemeCategory(['5', '8'])).toBe('random');
  });

  it('returns "random" for non-numeric votes only', () => {
    expect(getMemeCategory(['?', '?'])).toBe('confused');
    // Two non-Fibonacci values that aren't special
    expect(getMemeCategory(['invalid', 'alsoinvalid'])).toBe('random');
  });
});

describe('selectMeme', () => {
  it('returns a meme object', () => {
    const meme = selectMeme(['5', '5']);
    expect(meme).toHaveProperty('src');
    expect(meme).toHaveProperty('alt');
  });

  it('returns consistent meme with same seed', () => {
    const meme1 = selectMeme(['5', '8'], 'test-seed');
    const meme2 = selectMeme(['5', '8'], 'test-seed');
    expect(meme1).toEqual(meme2);
  });

  it('returns different memes with different seeds', () => {
    // Given the 21 memes, we try multiple seed pairs to find ones that differ
    const meme1 = selectMeme(['5', '8'], 'seed-a');
    const meme2 = selectMeme(['5', '8'], 'seed-b');
    const meme3 = selectMeme(['5', '8'], 'seed-c');
    // At least two of them should differ (statistically very likely with 21 memes)
    const allSame = meme1?.src === meme2?.src && meme2?.src === meme3?.src;
    expect(allSame).toBe(false);
  });

  it('returns meme for each category', () => {
    // consensus
    expect(selectMeme(['5', '5', '5'])).toBeTruthy();
    // chaos
    expect(selectMeme(['1', '13'])).toBeTruthy();
    // confused
    expect(selectMeme(['?'])).toBeTruthy();
    // break
    expect(selectMeme(['coffee'])).toBeTruthy();
    // random
    expect(selectMeme(['3', '5'])).toBeTruthy();
  });
});
