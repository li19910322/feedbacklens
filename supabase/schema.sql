-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  paypal_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback forms
CREATE TABLE feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_type TEXT DEFAULT 'general',
  questions JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback responses
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  respondent_email TEXT,
  respondent_name TEXT,
  responses JSONB NOT NULL,
  sentiment_score FLOAT,
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  total_responses INT DEFAULT 0,
  avg_sentiment FLOAT,
  top_themes TEXT[],
  last_updated TIMESTAMP DEFAULT NOW()
);

-- CSV imports
CREATE TABLE csv_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  row_count INT,
  import_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own forms" ON feedback_forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create forms" ON feedback_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON feedback_forms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON feedback_forms
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit responses" ON feedback_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own responses" ON feedback_responses
  FOR SELECT USING (
    form_id IN (
      SELECT id FROM feedback_forms WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_feedback_responses_form_id ON feedback_responses(form_id);
CREATE INDEX idx_feedback_responses_created_at ON feedback_responses(created_at);
CREATE INDEX idx_feedback_forms_user_id ON feedback_forms(user_id);
