-- =============================================
-- FeedbackLens Database Schema
-- =============================================
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active',
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback forms
CREATE TABLE IF NOT EXISTS feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_type TEXT DEFAULT 'general',
  questions JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  responses_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback responses
CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  respondent_email TEXT,
  respondent_name TEXT,
  responses JSONB NOT NULL,
  sentiment_score FLOAT,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics (aggregated data)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  total_responses INT DEFAULT 0,
  avg_sentiment FLOAT,
  top_themes TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CSV imports log
CREATE TABLE IF NOT EXISTS csv_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  row_count INT,
  import_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments/Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_order_id TEXT UNIQUE,
  plan TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own forms" ON feedback_forms;
DROP POLICY IF EXISTS "Users can create forms" ON feedback_forms;
DROP POLICY IF EXISTS "Users can update own forms" ON feedback_forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON feedback_forms;
DROP POLICY IF EXISTS "Anyone can submit responses" ON feedback_responses;
DROP POLICY IF EXISTS "Users can view own responses" ON feedback_responses;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Feedback forms policies
CREATE POLICY "Users can view own forms" ON feedback_forms
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create forms" ON feedback_forms
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own forms" ON feedback_forms
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own forms" ON feedback_forms
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Feedback responses policies
CREATE POLICY "Anyone can submit responses" ON feedback_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own responses" ON feedback_responses
  FOR SELECT USING (
    form_id IN (
      SELECT id FROM feedback_forms WHERE user_id::text = auth.uid()::text
    )
  );

-- CSV imports policies
CREATE POLICY "Users can view own imports" ON csv_imports
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create imports" ON csv_imports
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_responses_form_id ON feedback_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_created_at ON feedback_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_user_id ON feedback_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Create function to automatically create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment response count
CREATE OR REPLACE FUNCTION increment_response_count(form_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE feedback_forms
  SET responses_count = responses_count + 1
  WHERE id = form_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION increment_response_count(UUID) TO authenticated;
