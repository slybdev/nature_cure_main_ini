/*
  NATURE CURES INITIATIVE - CUSTOM EMAIL VERIFICATION SCHEMA
  Run this in your Supabase SQL Editor.
*/

-- 1. Add verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Create verification tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on verification tokens (Admin only)
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- We already have public.is_admin() from previous fixes
CREATE POLICY "Admins can manage verification tokens" ON public.verification_tokens 
FOR ALL USING (public.is_admin());

-- 4. Allow the server-side logic to read/delete tokens (using service_role)
-- No additional policy needed for service_role as it bypasses RLS
