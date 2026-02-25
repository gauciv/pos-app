-- Activation Codes Migration
-- Run this in the Supabase SQL Editor

-- ============================================
-- 1. Add device tracking columns to profiles
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS device_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- ============================================
-- 2. Create activation_codes table
-- ============================================

CREATE TABLE public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX idx_activation_codes_user_id ON public.activation_codes(user_id);

-- RLS (backend uses service_role key which bypasses RLS)
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Simplify handle_new_user trigger
-- ============================================

-- Admin is seeded via SQL, no bootstrap logic needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'collector')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
