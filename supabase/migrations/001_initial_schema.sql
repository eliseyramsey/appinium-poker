-- Appinium Poker Database Schema
-- Run this in Supabase SQL Editor

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  voting_system TEXT DEFAULT 'fibonacci',
  who_can_reveal TEXT DEFAULT 'all',
  who_can_manage TEXT DEFAULT 'all',
  auto_reveal BOOLEAN DEFAULT false,
  fun_features BOOLEAN DEFAULT true,
  show_average BOOLEAN DEFAULT true,
  show_countdown BOOLEAN DEFAULT true,
  host_player_id TEXT,
  current_issue_id TEXT,
  status TEXT DEFAULT 'voting',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  is_spectator BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  final_score NUMERIC,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(issue_id, player_id)
);

-- Confidence votes table
CREATE TABLE IF NOT EXISTS confidence_votes (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  value INTEGER CHECK (value >= 1 AND value <= 5),
  session_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_issues_game ON issues(game_id);
CREATE INDEX IF NOT EXISTS idx_votes_issue ON votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_confidence_game ON confidence_votes(game_id);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_votes ENABLE ROW LEVEL SECURITY;

-- Public access policies (anonymous play)
CREATE POLICY "Public access" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON confidence_votes FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
