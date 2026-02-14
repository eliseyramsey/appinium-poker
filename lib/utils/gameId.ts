import { customAlphabet } from "nanoid";
import { GAME_ID_LENGTH, PLAYER_ID_LENGTH } from "@/lib/constants";

// URL-safe alphabet without ambiguous characters
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

const generateGameId = customAlphabet(alphabet, GAME_ID_LENGTH);
const generatePlayerId = customAlphabet(alphabet, PLAYER_ID_LENGTH);

export function createGameId(): string {
  return generateGameId();
}

export function createPlayerId(): string {
  return generatePlayerId();
}

export function createIssueId(): string {
  return generatePlayerId();
}

export function createVoteId(): string {
  return generatePlayerId();
}
