-- Create table for 1v1 match requests (swipe logic)
CREATE TABLE IF NOT EXISTS public.match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(challenge_id, from_user_id, to_user_id)
);

-- Create table for squad chat messages
CREATE TABLE IF NOT EXISTS public.squad_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add opponent_squad_id to squads table for squad vs squad matching
ALTER TABLE public.squads 
ADD COLUMN IF NOT EXISTS opponent_squad_id UUID REFERENCES squads(id);

-- Enable RLS
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_requests
CREATE POLICY "Users can view their own match requests"
ON public.match_requests
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create match requests"
ON public.match_requests
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their received requests"
ON public.match_requests
FOR UPDATE
USING (auth.uid() = to_user_id);

-- RLS policies for squad_chat_messages
CREATE POLICY "Squad members can view squad messages"
ON public.squad_chat_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM squad_members 
  WHERE squad_members.squad_id = squad_chat_messages.squad_id 
  AND squad_members.user_id = auth.uid()
));

CREATE POLICY "Squad members can send messages"
ON public.squad_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM squad_members 
    WHERE squad_members.squad_id = squad_chat_messages.squad_id 
    AND squad_members.user_id = auth.uid()
  )
);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_chat_messages;