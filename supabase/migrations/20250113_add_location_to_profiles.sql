-- Add location column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Add email_verified column to profiles table (if not exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
