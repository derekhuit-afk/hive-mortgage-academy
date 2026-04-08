-- Hive Mortgage Academy Schema
-- Run this once in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS hma_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  nmls_number text NOT NULL,
  plan text NOT NULL DEFAULT 'foundation',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hma_module_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  module_number int NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(student_id, module_number)
);

CREATE TABLE IF NOT EXISTS hma_quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  module_number int NOT NULL,
  score int NOT NULL DEFAULT 0,
  answers jsonb,
  passed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hma_certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  student_email text,
  student_name text,
  nmls_number text,
  issued_at timestamptz DEFAULT now(),
  certificate_number text UNIQUE NOT NULL
);

-- Disable RLS for service role access
ALTER TABLE hma_students DISABLE ROW LEVEL SECURITY;
ALTER TABLE hma_module_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE hma_quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE hma_certificates DISABLE ROW LEVEL SECURITY;

-- Applications table for recruiting funnel
CREATE TABLE IF NOT EXISTS hma_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  nmls_number text,
  market text,
  production text,
  experience text,
  why text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hma_applications DISABLE ROW LEVEL SECURITY;

-- Add Stripe columns to hma_students (run if not already present)
ALTER TABLE hma_students 
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS hma_students_email_idx ON hma_students(email);
CREATE INDEX IF NOT EXISTS hma_students_stripe_sub_idx ON hma_students(stripe_subscription_id);
