// Meme categories and selection logic for Planning Poker
export type MemeCategory = "consensus" | "chaos" | "confused" | "break" | "random";

export interface Meme {
  src: string;
  alt: string;
  caption?: string; // Fallback caption if image fails to load
}

/**
 * HOW TO ADD MEMES:
 *
 * 1. Add your meme images to public/memes/[category]/
 *    Categories: consensus, chaos, confused, break, random
 *
 * 2. Name files sequentially: 01.jpg, 02.png, 03.jpg, etc.
 *
 * 3. Add entries to the MEMES object below
 *
 * Recommended Russian memes 2005-2020:
 * - consensus: Ждун улыбается, "Всё по плану", Success Kid
 * - chaos: Disaster Girl, "Это фиаско братан", Гарольд в панике
 * - confused: Philosoraptor, "Не понимаю", confused math lady
 * - break: Kermit sipping tea, "Мне пофиг", coffee memes
 * - random: Дратути, Толик, classic memes
 *
 * Find memes: Google Images, imgflip.com, or save from social media
 */

// Memes organized by category
// Add your images to public/memes/[category]/ and register them here
export const MEMES: Record<MemeCategory, Meme[]> = {
  // All voted the same — consensus achieved!
  consensus: [
    { src: "/memes/consensus/01.jpg", alt: "Consensus!", caption: "🎉 Единогласно!" },
    { src: "/memes/consensus/02.jpg", alt: "Agreement", caption: "✓ Договорились!" },
    { src: "/memes/consensus/03.jpg", alt: "Same vote", caption: "🤝 Одна команда!" },
  ],

  // Vote spread > 5 points — total chaos!
  chaos: [
    { src: "/memes/chaos/01.jpg", alt: "Chaos!", caption: "🔥 Это фиаско, братан" },
    { src: "/memes/chaos/02.jpg", alt: "Disaster", caption: "💥 Хаос!" },
    { src: "/memes/chaos/03.jpg", alt: "Panic", caption: "😱 Паника!" },
  ],

  // Someone voted "?" — need clarification
  confused: [
    { src: "/memes/confused/01.jpg", alt: "Confused", caption: "❓ Что вообще происходит?" },
    { src: "/memes/confused/02.jpg", alt: "Thinking", caption: "🤔 Надо подумать..." },
    { src: "/memes/confused/03.jpg", alt: "Question", caption: "❓ Непонятно" },
  ],

  // Someone voted "☕" — time for a break!
  break: [
    { src: "/memes/break/01.jpg", alt: "Break time", caption: "☕ Пора на перерыв!" },
    { src: "/memes/break/02.jpg", alt: "Coffee", caption: "☕ Кофе-брейк!" },
    { src: "/memes/break/03.jpg", alt: "Rest", caption: "😴 Устали" },
  ],

  // Default fallback
  random: [
    { src: "/memes/random/01.jpg", alt: "Random meme", caption: "🎲 Случайный мем" },
    { src: "/memes/random/02.jpg", alt: "Fun", caption: "😄 Веселье" },
    { src: "/memes/random/03.jpg", alt: "Meme", caption: "🎭 Мем" },
  ],
};

// Fibonacci values for spread calculation
const FIBONACCI_VALUES: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "5": 5,
  "8": 8,
  "13": 13,
  "21": 21,
  "34": 34,
  "55": 55,
  "89": 89,
};

/**
 * Determine meme category based on voting pattern
 */
export function getMemeCategory(votes: string[]): MemeCategory {
  if (votes.length === 0) return "random";

  // Check for special cards first
  if (votes.some((v) => v === "☕" || v === "coffee")) {
    return "break";
  }

  if (votes.some((v) => v === "?")) {
    return "confused";
  }

  // Filter to numeric votes only
  const numericVotes = votes
    .map((v) => FIBONACCI_VALUES[v])
    .filter((v) => v !== undefined);

  if (numericVotes.length === 0) return "random";

  // Check for consensus (all same)
  const uniqueVotes = new Set(numericVotes);
  if (uniqueVotes.size === 1) {
    return "consensus";
  }

  // Check for chaos (spread > 5)
  const min = Math.min(...numericVotes);
  const max = Math.max(...numericVotes);
  if (max - min > 5) {
    return "chaos";
  }

  return "random";
}

/**
 * Select a random meme from the appropriate category
 */
export function selectMeme(votes: string[]): Meme | null {
  const category = getMemeCategory(votes);
  const memes = MEMES[category];

  if (memes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * memes.length);
  return memes[randomIndex];
}

/**
 * Get all memes for a category
 */
export function getMemesForCategory(category: MemeCategory): Meme[] {
  return MEMES[category];
}
