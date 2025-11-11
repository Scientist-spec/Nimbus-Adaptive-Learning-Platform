-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'student');

-- Create enum for item types
CREATE TYPE public.item_type AS ENUM ('mcq', 'short_answer', 'code');

-- Create enum for assessment modes
CREATE TYPE public.assessment_mode AS ENUM ('diagnostic', 'formative', 'summative');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create items table (quiz questions)
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type item_type NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB, -- array of options for MCQ
  answer JSONB NOT NULL, -- correct answer(s)
  explanation TEXT,
  hints TEXT[],
  tags TEXT[],
  difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  bloom_level TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Items policies
CREATE POLICY "Everyone can view items"
  ON public.items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors and admins can create items"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Instructors and admins can update items"
  ON public.items FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete items"
  ON public.items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  mode assessment_mode NOT NULL,
  item_ids UUID[],
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors and admins can manage quizzes"
  ON public.quizzes FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Create attempts table
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  mode assessment_mode NOT NULL,
  correct BOOLEAN NOT NULL,
  score NUMERIC,
  time_taken_ms INTEGER,
  used_hint BOOLEAN DEFAULT false,
  response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instructors and admins can view all attempts"
  ON public.attempts FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Create learner_profiles table (mastery tracking)
CREATE TABLE public.learner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  mastery_by_tag JSONB DEFAULT '{}',
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learner profile"
  ON public.learner_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own learner profile"
  ON public.learner_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors and admins can view all learner profiles"
  ON public.learner_profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  -- Create learner profile
  INSERT INTO public.learner_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_learner_profiles_updated_at
  BEFORE UPDATE ON public.learner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();