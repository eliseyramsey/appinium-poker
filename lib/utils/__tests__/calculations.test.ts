import { describe, it, expect } from 'vitest';
import { calculateAverage, hasConsensus, getVoteSpread, getClosestFibonacci } from '../calculations';
import type { Vote } from '@/lib/supabase/types';

// Helper to create vote objects
const createVotes = (values: string[]): Vote[] =>
  values.map((value, i) => ({
    id: `vote-${i}`,
    issue_id: 'issue-1',
    player_id: `player-${i}`,
    value,
    created_at: new Date().toISOString(),
  }));

describe('calculateAverage', () => {
  it('returns null for empty votes', () => {
    expect(calculateAverage([])).toBeNull();
  });

  it('calculates average of numeric votes', () => {
    const votes = createVotes(['3', '5', '8']);
    expect(calculateAverage(votes)).toBe(5.3);
  });

  it('ignores ? and coffee votes', () => {
    const votes = createVotes(['3', '5', '?', 'coffee']);
    expect(calculateAverage(votes)).toBe(4);
  });

  it('returns null if all votes are non-numeric', () => {
    const votes = createVotes(['?', 'coffee']);
    expect(calculateAverage(votes)).toBeNull();
  });

  it('rounds to one decimal place', () => {
    const votes = createVotes(['1', '2', '3']);
    expect(calculateAverage(votes)).toBe(2);
  });
});

describe('hasConsensus', () => {
  it('returns false for less than 2 votes', () => {
    expect(hasConsensus(createVotes(['5']))).toBe(false);
    expect(hasConsensus([])).toBe(false);
  });

  it('returns true when all votes are the same', () => {
    expect(hasConsensus(createVotes(['5', '5', '5']))).toBe(true);
  });

  it('returns false when votes differ', () => {
    expect(hasConsensus(createVotes(['5', '8']))).toBe(false);
  });
});

describe('getVoteSpread', () => {
  it('returns 0 for empty or single vote', () => {
    expect(getVoteSpread([])).toBe(0);
    expect(getVoteSpread(createVotes(['5']))).toBe(0);
  });

  it('calculates spread between min and max', () => {
    expect(getVoteSpread(createVotes(['2', '8']))).toBe(6);
    expect(getVoteSpread(createVotes(['1', '3', '5', '13']))).toBe(12);
  });

  it('ignores non-numeric votes', () => {
    expect(getVoteSpread(createVotes(['2', '8', '?']))).toBe(6);
  });
});

describe('getClosestFibonacci', () => {
  it('returns exact match for Fibonacci numbers', () => {
    expect(getClosestFibonacci(5)).toBe(5);
    expect(getClosestFibonacci(13)).toBe(13);
  });

  it('returns closest Fibonacci for non-Fibonacci', () => {
    // 4 is equidistant from 3 and 5, implementation returns first match (3)
    expect(getClosestFibonacci(4)).toBe(3);
    expect(getClosestFibonacci(6)).toBe(5);
    expect(getClosestFibonacci(7)).toBe(8);
    expect(getClosestFibonacci(10)).toBe(8);
    expect(getClosestFibonacci(12)).toBe(13);
  });
});
