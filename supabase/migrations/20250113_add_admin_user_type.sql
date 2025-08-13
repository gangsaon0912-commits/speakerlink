-- Add 'admin' to user_type check constraint in profiles table
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('instructor', 'company', 'admin'));

-- Update admin@test.com user to have admin user_type
UPDATE public.profiles 
SET user_type = 'admin' 
WHERE email = 'admin@test.com';
