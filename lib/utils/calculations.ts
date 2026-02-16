import type { Vote } from "@/lib/supabase/types";

/**
 * Calculate average of numeric votes
 * Ignores ?, coffee, and other non-numeric values
 */
export function calculateAverage(votes: Vote[]): number | null {
  const numericVotes = votes
    .map((v) => parseFloat(v.value))
    .filter((n) => !isNaN(n));

  if (numericVotes.length === 0) return null;

  const sum = numericVotes.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numericVotes.length) * 10) / 10;
}

/**
 * Get closest Fibonacci number to the average
 */
export function getClosestFibonacci(average: number): number {
  const fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  return fibonacci.reduce((prev, curr) =>
    Math.abs(curr - average) < Math.abs(prev - average) ? curr : prev
  );
}

/**
 * Check if all votes are the same (consensus)
 */
export function hasConsensus(votes: Vote[]): boolean {
  if (votes.length < 2) return false;
  const values = votes.map((v) => v.value);
  return values.every((v) => v === values[0]);
}

/**
 * Calculate vote spread (difference between min and max)
 */
export function getVoteSpread(votes: Vote[]): number {
  const numericVotes = votes
    .map((v) => parseFloat(v.value))
    .filter((n) => !isNaN(n));

  if (numericVotes.length < 2) return 0;

  const min = Math.min(...numericVotes);
  const max = Math.max(...numericVotes);
  return max - min;
}
