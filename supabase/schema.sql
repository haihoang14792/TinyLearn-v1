-- ====================================================================
-- TINYLEARN – BÉ KHÁM PHÁ (MẦM NON 12–24 THÁNG)
-- SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES (TEACHERS & ADMINS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'principal')),
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHILDREN (HỒ SƠ TRẺ 12–24 THÁNG)
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  class_name TEXT NOT NULL, -- e.g. "Nhà trẻ D1 (12–18m)"
  avatar_emoji TEXT DEFAULT '👶',
  avatar_bg_color TEXT DEFAULT '#FEF3C7',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOPICS (CHỦ ĐỀ HỌC TẬP)
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🌟',
  category TEXT NOT NULL DEFAULT 'animals',
  age_from INT NOT NULL DEFAULT 12,
  age_to INT NOT NULL DEFAULT 24,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GAMES (TRÒ CHƠI TƯƠNG TÁC)
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'listen_find' 
    CHECK (game_type IN ('listen_find', 'touch_explore', 'match_similar', 'who_disappeared', 'knowledge_bubbles', 'color_match')),
  age_from INT NOT NULL DEFAULT 12,
  age_to INT NOT NULL DEFAULT 24,
  choices_count INT NOT NULL DEFAULT 2 CHECK (choices_count IN (2, 3)),
  instructions TEXT,
  objectives TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUESTIONS (CÂU HỎI & VẬN ĐỘNG KÈM THEO)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  reading_sentence TEXT,
  movement_suggestion TEXT,
  audio_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANSWERS (ĐÁP ÁN & HÌNH MINH HỌA)
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  audio_url TEXT,
  sound_text TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  praise_phrase TEXT DEFAULT 'Giỏi quá! Bé đúng rồi!',
  encouragement_phrase TEXT DEFAULT 'Con thử lại nhé!'
);

-- 9. LESSON PLANS (GIÁO ÁN MẦM NON CHUẨN BỘ GD&ĐT)
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  age_range TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 15,
  content JSONB NOT NULL, -- Full structured objectives, preparations, steps, evaluation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACTIVITY RESULTS (THEO DÕI HOẠT ĐỘNG & ĐÁNH GIÁ TRẺ)
CREATE TABLE IF NOT EXISTS public.activity_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  correct_count INT NOT NULL DEFAULT 0,
  attempt_count INT NOT NULL DEFAULT 0,
  support_count INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  skills_demonstrated TEXT[],
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MEDIA (KHO HỌC LIỆU DÙNG CHUNG CỦA TRƯỜNG)
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'animals',
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'audio', 'svg')),
  file_url TEXT NOT NULL,
  sound_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile and edit it
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Topics & Games: Public or owned by user
CREATE POLICY "Public or owned topics" ON public.topics
  FOR ALL USING (is_public OR auth.uid() = owner_id);

CREATE POLICY "Public or owned games" ON public.games
  FOR ALL USING (is_public OR auth.uid() = owner_id);

CREATE POLICY "Public questions select" ON public.questions
  FOR SELECT USING (TRUE);

CREATE POLICY "Public answers select" ON public.answers
  FOR SELECT USING (TRUE);

-- Children & Activity Results: Restricted to teacher or school
CREATE POLICY "Teacher can manage own children" ON public.children
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Teacher can view activity results" ON public.activity_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.children WHERE children.id = activity_results.child_id AND children.teacher_id = auth.uid())
  );

-- Lesson plans: Owned by teacher
CREATE POLICY "Teacher can manage own lesson plans" ON public.lesson_plans
  FOR ALL USING (auth.uid() = owner_id);

-- Media library: Public read, owner insert/delete
CREATE POLICY "Anyone can read media library" ON public.media
  FOR SELECT USING (TRUE);

CREATE POLICY "Teachers can insert media" ON public.media
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
