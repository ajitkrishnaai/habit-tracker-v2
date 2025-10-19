-- =====================================================
-- Habit Tracker V2 - Fix Metadata Trigger
-- =====================================================
-- Migration: 002_fix_metadata_trigger
-- Description: Fixes the metadata auto-creation trigger to handle errors gracefully
-- Author: Claude Code
-- Date: 2025-10-19
-- Issue: Database error during user signup when trigger failed to create metadata
-- =====================================================

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper error handling
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
        -- This allows signup to succeed even if metadata creation fails
        RAISE WARNING 'Failed to create metadata for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_metadata();

-- =====================================================
-- COMPLETED: Metadata trigger fix
-- =====================================================
-- The trigger now has exception handling to prevent user signup failures
-- If metadata creation fails, the user can still sign up successfully
-- The app will create metadata on first access via upsert in updateMetadata()
-- =====================================================
