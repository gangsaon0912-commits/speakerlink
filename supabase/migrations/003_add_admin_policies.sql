-- Add admin policies for instructors table
-- Allow admin to view all instructors
CREATE POLICY "Admin can view all instructors" ON public.instructors
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );

-- Allow admin to update all instructors
CREATE POLICY "Admin can update all instructors" ON public.instructors
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );

-- Allow admin to delete all instructors
CREATE POLICY "Admin can delete all instructors" ON public.instructors
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );

-- Allow admin to insert instructors
CREATE POLICY "Admin can insert instructors" ON public.instructors
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );

-- Add admin policies for profiles table
-- Allow admin to view all profiles
CREATE POLICY "Admin can view all profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );

-- Allow admin to update all profiles
CREATE POLICY "Admin can update all profiles" ON public.profiles
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );

-- Allow admin to delete all profiles
CREATE POLICY "Admin can delete all profiles" ON public.profiles
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );

-- Allow admin to insert profiles
CREATE POLICY "Admin can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'admin@test.com'
        )
    );
