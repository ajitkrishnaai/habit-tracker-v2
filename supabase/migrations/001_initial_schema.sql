-- =====================================================
-- Habit Tracker V2 - Initial Database Schema
-- =====================================================
-- Migration: 001_initial_schema
-- Description: Creates habits, logs, and metadata tables with RLS policies
-- Author: Claude Code
-- Date: 2025-10-18
-- =====================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: habits
-- =====================================================
-- Stores user's tracked habits with categories and status
CREATE TABLE IF NOT EXISTS habits (
    -- Primary identifier (matches client-side UUID format)
    habit_id TEXT PRIMARY KEY,

    -- User ownership (links to auth.users)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Habit details
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    category TEXT CHECK (char_length(category) <= 50),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

    -- Timestamps
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_status ON habits(status);
CREATE INDEX idx_habits_created_date ON habits(created_date DESC);

-- Unique index for case-insensitive habit name per user
CREATE UNIQUE INDEX unique_habit_name_per_user ON habits(user_id, LOWER(name));

-- =====================================================
-- TABLE: logs
-- =====================================================
-- Stores daily log entries for each habit
CREATE TABLE IF NOT EXISTS logs (
    -- Primary identifier (matches client-side UUID format)
    log_id TEXT PRIMARY KEY,

    -- Foreign key to habits (cascade delete when habit is deleted)
    habit_id TEXT NOT NULL REFERENCES habits(habit_id) ON DELETE CASCADE,

    -- User ownership (denormalized for RLS performance)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Log details
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'not_done', 'no_data')),
    notes TEXT CHECK (char_length(notes) <= 5000),

    -- Timestamps
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate logs for same habit on same date
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

-- Indexes for query performance
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_habit_id ON logs(habit_id);
CREATE INDEX idx_logs_date ON logs(date DESC);
CREATE INDEX idx_logs_status ON logs(status);

-- =====================================================
-- TABLE: metadata
-- =====================================================
-- Stores app metadata for each user (sync state, version, etc.)
CREATE TABLE IF NOT EXISTS metadata (
    -- One metadata row per user
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Metadata fields
    sheet_version TEXT DEFAULT '2.0',
    last_sync TIMESTAMPTZ DEFAULT NOW(),

    -- Timestamps
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICY: habits
-- =====================================================
-- Users can only see their own habits
CREATE POLICY "Users can view their own habits"
    ON habits FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own habits
CREATE POLICY "Users can insert their own habits"
    ON habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own habits
CREATE POLICY "Users can update their own habits"
    ON habits FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own habits
CREATE POLICY "Users can delete their own habits"
    ON habits FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICY: logs
-- =====================================================
-- Users can only see their own logs
CREATE POLICY "Users can view their own logs"
    ON logs FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own logs
CREATE POLICY "Users can insert their own logs"
    ON logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own logs
CREATE POLICY "Users can update their own logs"
    ON logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own logs
CREATE POLICY "Users can delete their own logs"
    ON logs FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICY: metadata
-- =====================================================
-- Users can only see their own metadata
CREATE POLICY "Users can view their own metadata"
    ON metadata FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own metadata
CREATE POLICY "Users can insert their own metadata"
    ON metadata FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own metadata
CREATE POLICY "Users can update their own metadata"
    ON metadata FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own metadata
CREATE POLICY "Users can delete their own metadata"
    ON metadata FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- DATABASE TRIGGERS
-- =====================================================
-- Trigger function: Auto-update modified_date on row changes
CREATE OR REPLACE FUNCTION update_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to habits table
CREATE TRIGGER habits_modified_date
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

-- Apply trigger to logs table
CREATE TRIGGER logs_modified_date
    BEFORE UPDATE ON logs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

-- Apply trigger to metadata table
CREATE TRIGGER metadata_modified_date
    BEFORE UPDATE ON metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

-- =====================================================
-- Trigger function: Auto-create metadata on user signup
CREATE OR REPLACE FUNCTION create_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO metadata (user_id, sheet_version, last_sync)
    VALUES (NEW.id, '2.0', NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to auth.users table (runs when new user signs up)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_metadata();

-- =====================================================
-- COMPLETED: Initial schema migration
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables created in Table Editor
-- 3. Test RLS policies with sample data
-- =====================================================
