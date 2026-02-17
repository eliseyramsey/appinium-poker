# Phase 2: Meme System

## Goal
Мемы показываются после reveal на основе паттерна голосов

## Tasks

### 1. Create meme data structure
- [ ] Create memeData.ts with category logic
- [ ] Define selectMeme function based on vote patterns
- [ ] Add meme URLs/paths

### 2. Download Russian memes
- [ ] ~10 consensus memes (agreement, unity)
- [ ] ~10 chaos memes (confusion, disagreement)
- [ ] ~10 confused memes (question mark votes)
- [ ] ~10 break memes (coffee votes)
- [ ] ~10 random memes (fallback)

### 3. Create MemeOverlay component
- [ ] Modal that shows after reveal
- [ ] Displays meme image
- [ ] Click to dismiss
- [ ] Auto-close after 5 seconds (optional)

### 4. Integrate into game room
- [ ] Call selectMeme after reveal
- [ ] Show MemeOverlay with selected meme

## Meme Categories Logic
- **consensus**: All votes identical
- **chaos**: Vote spread > 5 points (max - min > 5)
- **confused**: Someone voted "?"
- **break**: Someone voted "☕"
- **random**: Default fallback

## Files
- `components/memes/memeData.ts` — meme selection logic
- `components/memes/MemeOverlay.tsx` — overlay component
- `public/memes/[category]/` — meme images
