-- Fix Squad Chat RLS to allow service role (for bot messages)
DROP POLICY IF EXISTS "Squad members can send messages" ON squad_chat_messages;

CREATE POLICY "Squad members and service role can send messages"
ON squad_chat_messages
FOR INSERT
WITH CHECK (
  -- Allow service role (for bot messages)
  auth.jwt() ->> 'role' = 'service_role'
  OR
  -- Allow squad members (for real user messages)
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM squad_members 
    WHERE squad_members.squad_id = squad_chat_messages.squad_id 
    AND squad_members.user_id = auth.uid()
  ))
);

-- Create match_queue table for 1v1 normal mode
CREATE TABLE IF NOT EXISTS match_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE match_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can join queue"
ON match_queue FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own queue entries"
ON match_queue FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own queue entries"
ON match_queue FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for faster matching
CREATE INDEX idx_match_queue_waiting ON match_queue(challenge_id, status, created_at) 
WHERE status = 'waiting';

COMMENT ON TABLE match_queue IS 'Queue for 1v1 challenge matchmaking';
COMMENT ON COLUMN match_queue.status IS 'Current status: waiting (in queue), matched (opponent found), cancelled (user left queue)';