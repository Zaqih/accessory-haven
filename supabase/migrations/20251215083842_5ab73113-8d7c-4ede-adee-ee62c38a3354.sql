-- Add phone and address columns to profiles table
ALTER TABLE public.profiles ADD COLUMN phone text;
ALTER TABLE public.profiles ADD COLUMN address text;