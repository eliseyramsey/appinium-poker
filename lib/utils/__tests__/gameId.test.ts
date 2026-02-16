import { describe, it, expect } from 'vitest';
import { createGameId, createPlayerId, createIssueId, createVoteId } from '../gameId';

describe('ID generation', () => {
  it('createGameId returns 8-character string', () => {
    const id = createGameId();
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[0-9a-z]+$/);
  });

  it('createPlayerId returns 12-character string', () => {
    const id = createPlayerId();
    expect(id).toHaveLength(12);
    expect(id).toMatch(/^[0-9a-z]+$/);
  });

  it('createIssueId returns 12-character string', () => {
    expect(createIssueId()).toHaveLength(12);
  });

  it('createVoteId returns 12-character string', () => {
    expect(createVoteId()).toHaveLength(12);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createGameId()));
    expect(ids.size).toBe(100);
  });
});
