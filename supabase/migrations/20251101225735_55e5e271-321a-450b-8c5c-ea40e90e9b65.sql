-- Add bot_mode column to squads table to identify AI bot battles
ALTER TABLE squads ADD COLUMN IF NOT EXISTS bot_mode BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN squads.bot_mode IS 'Indicates if this squad is part of a bot test match (triggers AI chat responses)';