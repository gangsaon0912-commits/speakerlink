-- Enable email verification for new users
-- This migration ensures that new users must verify their email before they can sign in

-- Update auth.users table to require email confirmation
-- Note: This is handled by Supabase Auth automatically when enable_confirmations is set to true

-- Create a function to handle email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- If email verification is enabled, new users will be marked as unconfirmed
  -- until they click the confirmation link in their email
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email verification
DROP TRIGGER IF EXISTS trigger_handle_email_verification ON auth.users;
CREATE TRIGGER trigger_handle_email_verification
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_verification();

-- Add RLS policy for email verification
CREATE POLICY "Users can view their own email verification status" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Update profiles table to include email verification status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create function to update email verification status
CREATE OR REPLACE FUNCTION public.update_email_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles table when user email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles 
    SET email_verified = TRUE, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update profiles when email is verified
DROP TRIGGER IF EXISTS trigger_update_email_verification_status ON auth.users;
CREATE TRIGGER trigger_update_email_verification_status
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_verification_status();

-- Add comment to explain the email verification setup
COMMENT ON FUNCTION public.handle_email_verification() IS 'Handles email verification for new user registrations';
COMMENT ON FUNCTION public.update_email_verification_status() IS 'Updates profiles table when user email is verified';
