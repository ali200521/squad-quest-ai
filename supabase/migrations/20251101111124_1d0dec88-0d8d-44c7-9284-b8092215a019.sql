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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view squads"
  ON public.squads FOR SELECT
  TO authenticated
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

-- Insert initial skill areas
INSERT INTO public.skill_areas (name, description, icon) VALUES
  ('Frontend Development', 'HTML, CSS, JavaScript, React, and modern web frameworks', '💻'),
  ('Backend Development', 'APIs, databases, server-side logic, and architecture', '⚙️'),
  ('Full Stack', 'Complete web application development from frontend to backend', '🚀'),
  ('Mobile Development', 'iOS, Android, and cross-platform mobile apps', '📱'),
  ('DevOps', 'CI/CD, containers, cloud infrastructure, and automation', '☁️'),
  ('Data Science', 'Analytics, machine learning, and data visualization', '📊');