-- Add missing fields to instructors table
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
