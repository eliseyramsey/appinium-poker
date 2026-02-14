-- Add creator_id to games table
-- Run this in Supabase SQL Editor

-- Add creator_id column
ALTER TABLE games ADD COLUMN IF NOT EXISTS creator_id TEXT REFERENCES players(id) ON DELETE SET NULL;

-- Add confidence_revealed flag for sync
ALTER TABLE games ADD COLUMN IF NOT EXISTS confidence_revealed BOOLEAN DEFAULT false;

-- Add confidence voting status
ALTER TABLE games ADD COLUMN IF NOT EXISTS confidence_status TEXT DEFAULT 'idle';
-- 'idle' - не активно
-- 'voting' - голосование идёт
-- 'revealed' - результаты показаны

-- Add unique constraint to prevent duplicate confidence votes
ALTER TABLE confidence_votes ADD CONSTRAINT confidence_votes_unique UNIQUE (game_id, player_id);

-- Enable realtime for confidence_votes table
ALTER PUBLICATION supabase_realtime ADD TABLE confidence_votes;
