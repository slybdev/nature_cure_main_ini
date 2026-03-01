/*
  ADMIN STORAGE & PRODUCT IMAGES SETUP
  Run this in your Supabase SQL Editor.
*/

-- 1. Add images column to products if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Create a public bucket for product images
-- Note: You can also create this manually in the Supabase Dashboard under "Storage"
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies (Admin only for uploads/deletes)
-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'product-images' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'product-images' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
