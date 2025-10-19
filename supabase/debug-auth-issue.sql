-- =====================================================
-- Diagnostic Script: Debug Authentication Issue
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose the signup error

-- 1. Check if the trigger exists
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_user_metadata';

-- 3. Check RLS policies on metadata table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'metadata';

-- 4. Test if we can manually insert metadata (run this as authenticated user)
-- This will fail if you're not authenticated, which is expected
-- SELECT auth.uid(); -- Should return your user UUID

-- 5. Check for any existing metadata rows
SELECT * FROM metadata LIMIT 5;

-- =====================================================
-- POTENTIAL FIX: Bypass RLS for the trigger function
-- =====================================================
-- If the trigger is failing, we need to allow it to bypass RLS
-- Run this fix:

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper permissions
CREATE OR REPLACE FUNCTION public.create_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Use SECURITY DEFINER to bypass RLS
    INSERT INTO public.metadata (user_id, sheet_version, last_sync)
    VALUES (NEW.id, '2.0', NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Failed to create metadata for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set function owner to postgres (or service_role) to bypass RLS
-- Note: This requires superuser permissions
-- ALTER FUNCTION public.create_user_metadata() OWNER TO postgres;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_metadata();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.metadata TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metadata TO authenticated;

-- =====================================================
-- ALTERNATIVE FIX: Make metadata creation optional
-- =====================================================
-- If the trigger keeps failing, we can make metadata creation
-- happen on first app access instead of during signup
-- (This would require code changes in the frontend)
