# Supabase Setup Guide

This guide documents the Supabase configuration for the Habit Tracker V2 application.

## Project Information

**Project Name**: Habit Tracker V2
**Project URL**: `https://yzisfgxjyugfnqcaqlgw.supabase.co`
**Project Reference**: `yzisfgxjyugfnqcaqlgw`
**Region**: [Your selected region]
**Created**: 2025-10-18

## API Keys

**Anon/Public Key** (safe to use in frontend):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aXNmZ3hqeXVnZm5xY2FxbGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTI3OTcsImV4cCI6MjA3NjM2ODc5N30.qkODYa0aMOgloveE4L-9T2blCvpr6W-6_Zccpfs2AII
```

**Service Role Key** (NEVER expose in frontend - server-side only):
- Stored securely in Supabase dashboard: Project Settings → API
- Do NOT commit this key to git
- Only use for server-side operations or database migrations

## Database Schema

The database consists of three main tables:

### 1. `habits` Table
Stores user's tracked habits with categories and status.

**Columns**:
- `habit_id` (TEXT, PRIMARY KEY) - Unique habit identifier
- `user_id` (UUID, FOREIGN KEY) - Links to auth.users
- `name` (TEXT, 1-100 chars) - Habit name
- `category` (TEXT, max 50 chars) - Optional category
- `status` (TEXT) - Either 'active' or 'inactive'
- `created_date` (TIMESTAMPTZ) - Auto-set on creation
- `modified_date` (TIMESTAMPTZ) - Auto-updated on changes

**Constraints**:
- Unique index on `(user_id, LOWER(name))` - prevents duplicate habit names (case-insensitive)
- Check constraint: name length 1-100 chars
- Check constraint: status must be 'active' or 'inactive'

### 2. `logs` Table
Stores daily log entries for each habit.

**Columns**:
- `log_id` (TEXT, PRIMARY KEY) - Unique log identifier
- `habit_id` (TEXT, FOREIGN KEY) - Links to habits table
- `user_id` (UUID, FOREIGN KEY) - Links to auth.users (denormalized for RLS)
- `date` (DATE) - The date of the log entry
- `status` (TEXT) - Either 'done', 'not_done', or 'no_data'
- `notes` (TEXT, max 5000 chars) - Optional notes
- `created_date` (TIMESTAMPTZ) - Auto-set on creation
- `modified_date` (TIMESTAMPTZ) - Auto-updated on changes

**Constraints**:
- Unique constraint on `(habit_id, date)` - one log per habit per day
- Check constraint: status must be 'done', 'not_done', or 'no_data'
- Check constraint: notes max 5000 chars
- Foreign key cascade delete: logs deleted when habit is deleted

### 3. `metadata` Table
Stores app metadata for each user (sync state, version, etc.).

**Columns**:
- `user_id` (UUID, PRIMARY KEY) - Links to auth.users
- `sheet_version` (TEXT) - App version (default '2.0')
- `last_sync` (TIMESTAMPTZ) - Last sync timestamp
- `created_date` (TIMESTAMPTZ) - Auto-set on creation
- `modified_date` (TIMESTAMPTZ) - Auto-updated on changes

**Auto-creation**: Metadata row is automatically created when a user signs up (via trigger).

## Row-Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data.

**Policy Pattern** (applied to all three tables):
- `SELECT`: Users can view only their own records (`auth.uid() = user_id`)
- `INSERT`: Users can insert only their own records
- `UPDATE`: Users can update only their own records
- `DELETE`: Users can delete only their own records

**Security Guarantee**: Even with direct database access, users cannot see or modify other users' data.

## Database Triggers

### 1. Auto-update `modified_date`
**Trigger Function**: `update_modified_date()`
**Applied to**: `habits`, `logs`, `metadata`
**Purpose**: Automatically updates `modified_date` to current timestamp on any UPDATE operation

### 2. Auto-create user metadata
**Trigger Function**: `create_user_metadata()`
**Applied to**: `auth.users` (AFTER INSERT)
**Purpose**: Automatically creates a metadata row when a new user signs up

## Authentication

**Method**: Email/Password (Supabase Auth)
**Provider**: Email (enabled by default)
**Email Confirmations**: Configured in Supabase dashboard
**Future**: Google OAuth can be added later without schema changes

## Environment Variables

Add these to your `.env.local` file:

```env
VITE_SUPABASE_URL=https://yzisfgxjyugfnqcaqlgw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aXNmZ3hqeXVnZm5xY2FxbGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTI3OTcsImV4cCI6MjA3NjM2ODc5N30.qkODYa0aMOgloveE4L-9T2blCvpr6W-6_Zccpfs2AII
```

## Running Migrations

The initial schema migration is in `supabase/migrations/001_initial_schema.sql`.

**To apply the migration**:
1. Go to Supabase SQL Editor
2. Copy the contents of `001_initial_schema.sql`
3. Paste and execute

**Migration includes**:
- ✅ Table creation (habits, logs, metadata)
- ✅ Indexes for performance
- ✅ RLS policies for all tables
- ✅ Triggers for auto-updates
- ✅ Constraints for data validation

## Testing the Setup

### Verify Tables
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Verify RLS Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('habits', 'logs', 'metadata');
```

### Verify Policies
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('habits', 'logs', 'metadata')
ORDER BY tablename, cmd;
```

### Verify Triggers
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('habits', 'logs', 'metadata', 'users');
```

## Supabase Dashboard Quick Links

- **SQL Editor**: https://yzisfgxjyugfnqcaqlgw.supabase.co/project/yzisfgxjyugfnqcaqlgw/sql
- **Table Editor**: https://yzisfgxjyugfnqcaqlgw.supabase.co/project/yzisfgxjyugfnqcaqlgw/editor
- **Authentication**: https://yzisfgxjyugfnqcaqlgw.supabase.co/project/yzisfgxjyugfnqcaqlgw/auth/users
- **API Settings**: https://yzisfgxjyugfnqcaqlgw.supabase.co/project/yzisfgxjyugfnqcaqlgw/settings/api

## Free Tier Limits

- **Database Size**: 500 MB
- **API Requests**: Unlimited
- **Bandwidth**: 5 GB/month
- **Auth Users**: 50,000 monthly active users

These limits are more than sufficient for this application.

## Next Steps

1. ✅ Supabase project created
2. ✅ Database schema deployed
3. ✅ RLS policies verified
4. ✅ Triggers tested
5. ⏳ Install `@supabase/supabase-js` in frontend
6. ⏳ Create Supabase client in `src/lib/supabaseClient.ts`
7. ⏳ Implement authentication service
8. ⏳ Implement data service for CRUD operations

---

**Last Updated**: 2025-10-18
**Migration Version**: 001
