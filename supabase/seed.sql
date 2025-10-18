-- =====================================================
-- Habit Tracker V2 - Seed Data (Optional)
-- =====================================================
-- Purpose: Test data for development and testing
-- IMPORTANT: Do NOT run this in production!
-- =====================================================

-- NOTE: This seed file is for LOCAL TESTING ONLY
-- Replace 'YOUR_USER_ID' with actual user_id from auth.users after signup

-- Example seed data structure:
--
-- INSERT INTO habits (habit_id, user_id, name, category, status, created_date, modified_date)
-- VALUES
--     ('habit_001', 'YOUR_USER_ID', 'Morning Exercise', 'Health', 'active', NOW() - INTERVAL '30 days', NOW()),
--     ('habit_002', 'YOUR_USER_ID', 'Read 30 Minutes', 'Personal Development', 'active', NOW() - INTERVAL '30 days', NOW()),
--     ('habit_003', 'YOUR_USER_ID', 'Meditate', 'Wellness', 'active', NOW() - INTERVAL '20 days', NOW());
--
-- INSERT INTO logs (log_id, habit_id, user_id, date, status, notes, created_date, modified_date)
-- VALUES
--     ('log_001', 'habit_001', 'YOUR_USER_ID', CURRENT_DATE - 5, 'done', 'Great workout!', NOW(), NOW()),
--     ('log_002', 'habit_001', 'YOUR_USER_ID', CURRENT_DATE - 4, 'done', NULL, NOW(), NOW()),
--     ('log_003', 'habit_001', 'YOUR_USER_ID', CURRENT_DATE - 3, 'not_done', 'Too tired', NOW(), NOW()),
--     ('log_004', 'habit_001', 'YOUR_USER_ID', CURRENT_DATE - 2, 'done', NULL, NOW(), NOW()),
--     ('log_005', 'habit_001', 'YOUR_USER_ID', CURRENT_DATE - 1, 'done', NULL, NOW(), NOW()),
--     ('log_006', 'habit_001', 'YOUR_USER_ID', CURRENT_DATE, 'done', 'Feeling strong!', NOW(), NOW());

-- To use this seed file:
-- 1. Sign up a test user via the app
-- 2. Get the user_id from Supabase Auth dashboard or SQL Editor:
--    SELECT id, email FROM auth.users;
-- 3. Replace 'YOUR_USER_ID' with the actual UUID
-- 4. Run this SQL in Supabase SQL Editor

-- =====================================================
-- SEED DATA COMMENTED OUT BY DEFAULT
-- =====================================================
-- Uncomment and modify after creating a test user
