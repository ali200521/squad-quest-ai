-- ============================================
-- SQUAD QUEST AI - COMPLETE DATABASE SETUP
-- ============================================
-- This file contains all SQL queries to set up the Squad Quest AI database from scratch
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CORE TABLES
-- ============================================

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create skill areas table
CREATE TABLE public.skill_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skill_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill areas"
  ON public.skill_areas FOR SELECT
  TO authenticated
  USING (true);

-- Create user skill levels table
CREATE TABLE public.user_skill_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_area_id UUID REFERENCES public.skill_areas(id) ON DELETE CASCADE NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  assessment_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_area_id)
);

ALTER TABLE public.user_skill_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all skill levels"
  ON public.user_skill_levels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own skill levels"
  ON public.user_skill_levels FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. LEARNING CONTENT TABLES
-- ============================================

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_area_id UUID REFERENCES public.skill_areas(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Array of slides with content
  difficulty_level INTEGER DEFAULT 1,
  estimated_duration INTEGER, -- in minutes
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (true);

-- Create class progress table
CREATE TABLE public.class_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  current_slide INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

ALTER TABLE public.class_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.class_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON public.class_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_area_id UUID REFERENCES public.skill_areas(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array of questions with answers
  difficulty_level INTEGER DEFAULT 1,
  time_limit INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create quizzes"
  ON public.quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  answers JSONB NOT NULL,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. CHALLENGE AND SQUAD TABLES
-- ============================================

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_area_id UUID REFERENCES public.skill_areas(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- 'multiple_choice', 'coding', 'scenario'
  content JSONB NOT NULL, -- Challenge questions/problems
  difficulty_level INTEGER DEFAULT 1,
  time_limit INTEGER, -- in seconds
  max_squad_size INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed'
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

-- Create squads table
CREATE TABLE public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  average_level DECIMAL(4,2),
  total_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'forming', -- 'forming', 'ready', 'competing', 'finished'
  opponent_squad_id UUID REFERENCES public.squads(id),
  bot_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

COMMENT ON COLUMN public.squads.bot_mode IS 'Indicates if this squad is part of a bot test match (triggers AI chat responses)';

CREATE POLICY "Anyone can view squads"
  ON public.squads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create squads"
  ON public.squads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update squads"
  ON public.squads
  FOR UPDATE
  USING (true);

-- Create squad members table
CREATE TABLE public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'leader', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view squad members"
  ON public.squad_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join squads"
  ON public.squad_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create challenge submissions table
CREATE TABLE public.challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER DEFAULT 0,
  time_taken INTEGER, -- in seconds
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, squad_id, user_id)
);

ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Squad members can view squad submissions"
  ON public.challenge_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_members.squad_id = challenge_submissions.squad_id
      AND squad_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can submit own answers"
  ON public.challenge_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. MATCHMAKING TABLES
-- ============================================

-- Create match_requests table for 1v1 swipe matching
CREATE TABLE IF NOT EXISTS public.match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, from_user_id, to_user_id)
);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

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

-- Create match_queue table for 1v1 normal mode
CREATE TABLE IF NOT EXISTS public.match_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.match_queue IS 'Queue for 1v1 challenge matchmaking';
COMMENT ON COLUMN public.match_queue.status IS 'Current status: waiting (in queue), matched (opponent found), cancelled (user left queue)';

CREATE POLICY "Users can join queue"
  ON public.match_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own queue entries"
  ON public.match_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own queue entries"
  ON public.match_queue FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for faster matching
CREATE INDEX idx_match_queue_waiting ON public.match_queue(challenge_id, status, created_at)
WHERE status = 'waiting';

-- ============================================
-- 5. REAL-TIME COMMUNICATION
-- ============================================

-- Create squad_chat_messages table
CREATE TABLE IF NOT EXISTS public.squad_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.squad_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Squad members can view squad messages"
  ON public.squad_chat_messages
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.squad_members
    WHERE squad_members.squad_id = squad_chat_messages.squad_id
    AND squad_members.user_id = auth.uid()
  ));

CREATE POLICY "Squad members and service role can send messages"
  ON public.squad_chat_messages
  FOR INSERT
  WITH CHECK (
    -- Allow service role (for bot messages)
    auth.jwt() ->> 'role' = 'service_role'
    OR
    -- Allow squad members (for real user messages)
    (auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_members.squad_id = squad_chat_messages.squad_id
      AND squad_members.user_id = auth.uid()
    ))
  );

-- Enable realtime for challenge_submissions
ALTER TABLE public.challenge_submissions REPLICA IDENTITY FULL;

-- Enable realtime for squad_chat_messages
ALTER TABLE public.squad_chat_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'challenge_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_submissions;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_chat_messages;

-- ============================================
-- 6. TRIGGERS AND FUNCTIONS
-- ============================================

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_skill_levels_updated_at
  BEFORE UPDATE ON public.user_skill_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_progress_updated_at
  BEFORE UPDATE ON public.class_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. SEED DATA
-- ============================================

-- Insert initial skill areas
INSERT INTO public.skill_areas (name, description, icon) VALUES
  ('Frontend Development', 'HTML, CSS, JavaScript, React, and modern web frameworks', '💻'),
  ('Backend Development', 'APIs, databases, server-side logic, and architecture', '⚙️'),
  ('Full Stack', 'Complete web application development from frontend to backend', '🚀'),
  ('Mobile Development', 'iOS, Android, and cross-platform mobile apps', '📱'),
  ('DevOps', 'CI/CD, containers, cloud infrastructure, and automation', '☁️'),
  ('Data Science', 'Analytics, machine learning, and data visualization', '📊');

-- Create bot profiles with fixed UUIDs
INSERT INTO public.profiles (id, username, display_name, current_level, total_xp)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CodeNinja', 'CodeNinja', 3, 2500),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'DevMaster', 'DevMaster', 4, 3200),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'BugHunter', 'BugHunter', 2, 1800),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'PixelPro', 'PixelPro', 3, 2700),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'DataDragon', 'DataDragon', 4, 3500)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  current_level = EXCLUDED.current_level,
  total_xp = EXCLUDED.total_xp;

-- Add skill levels for bots across all skill areas
INSERT INTO public.user_skill_levels (user_id, skill_area_id, level, xp, assessment_completed)
SELECT
  p.id,
  sa.id,
  FLOOR(RANDOM() * 4 + 1)::INTEGER, -- Random level 1-5
  FLOOR(RANDOM() * 1000)::INTEGER, -- Random XP 0-1000
  true
FROM public.profiles p
CROSS JOIN public.skill_areas sa
WHERE p.id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000005'::uuid
)
ON CONFLICT (user_id, skill_area_id)
DO UPDATE SET
  level = EXCLUDED.level,
  xp = EXCLUDED.xp,
  assessment_completed = true;

-- ============================================
-- DATABASE SETUP COMPLETE!
-- ============================================
-- You now have:
-- - 15 core tables with proper relationships
-- - Row Level Security (RLS) policies on all tables
-- - Real-time subscriptions for chat and submissions
-- - Automatic timestamp updates via triggers
-- - 6 skill areas seeded
-- - 5 bot profiles for testing
-- ============================================
