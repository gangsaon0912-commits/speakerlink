-- Add missing fields to instructors table
ALTER TABLE public.instructors 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Update existing records to have default values
UPDATE public.instructors 
SET 
  full_name = COALESCE(full_name, '이름 없음'),
  email = COALESCE(email, '이메일 없음'),
  location = COALESCE(location, '위치 없음'),
  is_verified = COALESCE(is_verified, FALSE)
WHERE full_name IS NULL OR email IS NULL OR location IS NULL OR is_verified IS NULL;

-- Make fields NOT NULL after setting default values
ALTER TABLE public.instructors 
ALTER COLUMN full_name SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN location SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instructors_email ON public.instructors(email);
CREATE INDEX IF NOT EXISTS idx_instructors_is_verified ON public.instructors(is_verified);
CREATE INDEX IF NOT EXISTS idx_instructors_location ON public.instructors(location);
