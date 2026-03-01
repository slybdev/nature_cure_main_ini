/*
  NATURE CURES INITIATIVE - ADMIN OVERHAUL SQL
  Run this in your Supabase SQL Editor.
*/

-- 1. Add images array to products if not exists
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Fix Product RLS policies to allow DELETE
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Ensure storage bucket for products exists (Run this via Supabase Dashboard or API)
-- Note: You should create a public bucket named 'products' in the Supabase Storage dashboard.
