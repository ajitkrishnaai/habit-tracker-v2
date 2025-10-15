# Migration Plan: Google Sheets → Supabase PostgreSQL

## Executive Summary

This document outlines a comprehensive plan to migrate the Habit Tracker application from Google Sheets to Supabase PostgreSQL. The migration will improve performance (5-10x faster syncs), add real-time multi-device sync, simplify authentication, and reduce codebase complexity while maintaining the offline-first architecture.

**Timeline**: 10 days
**Cost Impact**: $0/month (<1000 users) → $25/month (1000-10,000 users)
**Code Impact**: Net -100 lines (delete 571, add ~470)
**Risk Level**: Medium (requires data migration, but phased rollout minimizes risk)

---

## Why Supabase?

### Benefits Over Google Sheets

| Aspect | Google Sheets | Supabase |
|--------|---------------|----------|
| **Sync Latency** | 2-5 seconds | 200-500ms (5-10x faster) |
| **Query Performance** | Array filtering in JS | SQL with indexes (<10ms) |
| **Authentication** | Manual Google Identity Services | Built-in OAuth (3 clicks) |
| **Multi-device Sync** | Manual refresh only | Real-time subscriptions |
| **Data Security** | Manual user_id filtering | Row-Level Security (RLS) |
| **Transactions** | None | ACID transactions |
| **API Rate Limits** | 100 req/100s/user | Effectively unlimited |
| **User Data Ownership** | ✅ User's Google Drive | ❌ Supabase servers |
| **Cost** | $0 forever | $0 (<1000 users), $25/mo after |

### What We Keep

- ✅ **Offline-first architecture** (IndexedDB remains local cache)
- ✅ **Optimistic UI** (immediate writes to local storage)
- ✅ **Sync queue** (background sync with retry logic)
- ✅ **PWA capabilities** (installable, service workers)
- ✅ **Same data model** (Habit, LogEntry, Metadata types unchanged)

### What We Lose

- ❌ **User data ownership** (data moves from user's Google Drive to Supabase)
- ❌ **Zero cost** (need to upgrade to Pro tier after ~1000 users)

---

## Phase 1: Supabase Project Setup (Day 1)

### 1.1 Create Supabase Project

**Steps**:
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
   - **Organization**: Create new or use existing
   - **Name**: `habit-tracker-prod`
   - **Database Password**: Generate strong password (save in password manager)
   - **Region**: Choose closest to majority of users (e.g., `us-east-1`)
   - **Pricing Plan**: Free (can upgrade later)
3. Wait 2-3 minutes for project provisioning
4. Note the **Project URL** and **Anon Key** from Settings → API

### 1.2 Database Schema Setup

Navigate to **SQL Editor** in Supabase dashboard and run this schema:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced automatically from Supabase Auth)
-- No need to create this - auth.users already exists

-- Habits table
CREATE TABLE public.habits (
    habit_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    category TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    modified_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create indexes for performance
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habits_user_status ON public.habits(user_id, status);
CREATE INDEX idx_habits_created_date ON public.habits(created_date);

-- Row-Level Security (RLS) for habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own habits
CREATE POLICY "Users can view own habits"
    ON public.habits FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own habits
CREATE POLICY "Users can insert own habits"
    ON public.habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own habits
CREATE POLICY "Users can update own habits"
    ON public.habits FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users cannot delete habits (soft delete via status='inactive')
-- No DELETE policy means deletes are blocked

-- Logs table
CREATE TABLE public.logs (
    log_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    habit_id TEXT REFERENCES public.habits(habit_id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'not_done', 'no_data')) DEFAULT 'no_data',
    notes TEXT CHECK (char_length(notes) <= 5000),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one log per habit per day
CREATE UNIQUE INDEX idx_logs_habit_date_unique ON public.logs(habit_id, date);

-- Create indexes
CREATE INDEX idx_logs_habit_id ON public.logs(habit_id);
CREATE INDEX idx_logs_date ON public.logs(date);
CREATE INDEX idx_logs_timestamp ON public.logs(timestamp);

-- Row-Level Security for logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Users can only see logs for their own habits
CREATE POLICY "Users can view own logs"
    ON public.logs FOR SELECT
    USING (
        habit_id IN (
            SELECT habit_id FROM public.habits WHERE user_id = auth.uid()
        )
    );

-- Users can insert logs for their own habits
CREATE POLICY "Users can insert own logs"
    ON public.logs FOR INSERT
    WITH CHECK (
        habit_id IN (
            SELECT habit_id FROM public.habits WHERE user_id = auth.uid()
        )
    );

-- Users can update logs for their own habits
CREATE POLICY "Users can update own logs"
    ON public.logs FOR UPDATE
    USING (
        habit_id IN (
            SELECT habit_id FROM public.habits WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        habit_id IN (
            SELECT habit_id FROM public.habits WHERE user_id = auth.uid()
        )
    );

-- Users can delete logs for their own habits
CREATE POLICY "Users can delete own logs"
    ON public.logs FOR DELETE
    USING (
        habit_id IN (
            SELECT habit_id FROM public.habits WHERE user_id = auth.uid()
        )
    );

-- Metadata table (per-user sync metadata)
CREATE TABLE public.metadata (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    db_version TEXT NOT NULL DEFAULT '1.0'
);

-- RLS for metadata
ALTER TABLE public.metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metadata"
    ON public.metadata FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metadata"
    ON public.metadata FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metadata"
    ON public.metadata FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function to automatically update modified_date
CREATE OR REPLACE FUNCTION update_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_date = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update modified_date on habits
CREATE TRIGGER habits_modified_date
    BEFORE UPDATE ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

-- Function to auto-create metadata on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.metadata (user_id, last_sync, db_version)
    VALUES (NEW.id, NOW(), '1.0')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create metadata when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

**Verification**:
- Go to **Table Editor** → confirm `habits`, `logs`, `metadata` tables exist
- Go to **Authentication** → **Policies** → confirm RLS policies are active

### 1.3 Configure Google OAuth

**Steps**:
1. Navigate to **Authentication** → **Providers** in Supabase dashboard
2. Find **Google** provider and click to expand
3. Toggle **"Enable Sign in with Google"**
4. You'll need a Google Cloud OAuth Client ID:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your existing project (or create new one)
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Habit Tracker - Supabase`
   - **Authorized redirect URIs**: Add `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - Get exact URL from Supabase (shown in Google provider config)
   - Click **Create** and copy **Client ID** and **Client Secret**
5. Paste Client ID and Client Secret into Supabase Google provider config
6. Click **Save**

**Test**:
- Click "Test Connection" button in Supabase (if available)
- Or proceed to Phase 2 and test with actual app

---

## Phase 2: Frontend Dependencies (Day 1)

### 2.1 Install Supabase SDK

```bash
cd "/Users/ajitkrishna/Documents/GitHub/Habit Tracker V2"
npm install @supabase/supabase-js
```

### 2.2 Environment Variables

Create or update `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Remove or comment out old Google Sheets config
# VITE_GOOGLE_CLIENT_ID=...  # No longer needed (Supabase handles OAuth)
```

**Important**: Add `.env.local` to `.gitignore` if not already there.

### 2.3 Update TypeScript Types (Optional)

Create `src/types/supabase.ts` for type safety:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          habit_id: string
          user_id: string
          name: string
          category: string | null
          status: 'active' | 'inactive'
          created_date: string
          modified_date: string
        }
        Insert: {
          habit_id?: string
          user_id: string
          name: string
          category?: string | null
          status?: 'active' | 'inactive'
          created_date?: string
          modified_date?: string
        }
        Update: {
          habit_id?: string
          user_id?: string
          name?: string
          category?: string | null
          status?: 'active' | 'inactive'
          created_date?: string
          modified_date?: string
        }
      }
      logs: {
        Row: {
          log_id: string
          habit_id: string
          date: string
          status: 'done' | 'not_done' | 'no_data'
          notes: string | null
          timestamp: string
        }
        Insert: {
          log_id?: string
          habit_id: string
          date: string
          status?: 'done' | 'not_done' | 'no_data'
          notes?: string | null
          timestamp?: string
        }
        Update: {
          log_id?: string
          habit_id?: string
          date?: string
          status?: 'done' | 'not_done' | 'no_data'
          notes?: string | null
          timestamp?: string
        }
      }
      metadata: {
        Row: {
          user_id: string
          last_sync: string
          db_version: string
        }
        Insert: {
          user_id: string
          last_sync?: string
          db_version?: string
        }
        Update: {
          user_id?: string
          last_sync?: string
          db_version?: string
        }
      }
    }
  }
}
```

---

## Phase 3: Authentication Migration (Days 2-3)

### 3.1 Create Supabase Client

**New file**: `src/services/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true, // Stores session in localStorage
    detectSessionInUrl: true,
  },
});

// Helper to get current user ID
export const getCurrentUserId = (): string | null => {
  const { data: { user } } = supabase.auth.getUser();
  return user?.id || null;
};
```

### 3.2 Update auth.ts

**Replace** the contents of `src/services/auth.ts` with Supabase auth:

```typescript
/**
 * Authentication Service - Supabase Implementation
 *
 * Manages user authentication using Supabase Auth with Google OAuth.
 * Replaces the previous Google Identity Services implementation.
 */

import { supabase } from './supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Initialize authentication
 * Sets up auth state listener
 */
export const initAuth = async (): Promise<void> => {
  console.log('[Auth] Supabase auth initialized');

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Auth] Auth state changed:', event);
    if (event === 'SIGNED_IN') {
      console.log('[Auth] User signed in:', session?.user.email);
    } else if (event === 'SIGNED_OUT') {
      console.log('[Auth] User signed out');
    }
  });

  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('[Auth] Existing session found:', session.user.email);
  }
};

/**
 * Initiate Google OAuth login flow
 * Opens Google's consent screen
 */
export const login = async (): Promise<void> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/daily-log',
      queryParams: {
        access_type: 'online',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[Auth] Login error:', error);
    throw new Error(error.message);
  }

  console.log('[Auth] OAuth redirect initiated');
};

/**
 * Logout user and clear session
 */
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Auth] Logout error:', error);
    throw new Error(error.message);
  }

  console.log('[Auth] User logged out');
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

/**
 * Get current user profile
 * Returns null if not authenticated
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email || 'User',
    picture: user.user_metadata?.avatar_url,
  };
};

/**
 * Get current user ID
 * Returns null if not authenticated
 */
export const getUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

/**
 * Get access token (for potential future use)
 * Note: Supabase SDK handles tokens automatically for all API calls
 */
export const getAccessToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};
```

**Changes Summary**:
- ✅ **Simplified**: ~100 lines (down from 259)
- ✅ **No manual token management**: Supabase SDK handles tokens automatically
- ✅ **No Google Identity Services script**: Supabase provides OAuth UI
- ✅ **Same public API**: All exported functions remain (for compatibility with components)

### 3.3 Remove tokenManager.ts

**Delete**: `src/utils/tokenManager.ts` (no longer needed - Supabase handles token storage)

### 3.4 Update ProtectedRoute Component

**Modify**: `src/components/ProtectedRoute.tsx`

```typescript
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Layout } from './Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(session !== null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(session !== null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Not authenticated - redirect to welcome page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Authenticated - render protected content
  return <Layout>{children}</Layout>;
};
```

---

## Phase 4: Data Layer Migration (Days 4-6)

### 4.1 Create Supabase Data Service

**New file**: `src/services/supabaseDataService.ts` (replaces googleSheets.ts)

```typescript
/**
 * Supabase Data Service
 *
 * Handles all data operations with Supabase PostgreSQL.
 * Provides CRUD operations for habits, logs, and metadata.
 */

import { supabase } from './supabaseClient';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import type { Metadata } from '../types/metadata';

// ============================================================================
// HABITS
// ============================================================================

/**
 * Get all habits for the current user
 * @param activeOnly If true, only return active habits
 */
export const getHabits = async (activeOnly: boolean = false): Promise<Habit[]> => {
  let query = supabase
    .from('habits')
    .select('*')
    .order('created_date', { ascending: true });

  if (activeOnly) {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Supabase] Error fetching habits:', error);
    throw new Error(`Failed to fetch habits: ${error.message}`);
  }

  return (data || []).map(row => ({
    habit_id: row.habit_id,
    name: row.name,
    category: row.category || undefined,
    status: row.status as 'active' | 'inactive',
    created_date: row.created_date,
    modified_date: row.modified_date,
  }));
};

/**
 * Get a single habit by ID
 */
export const getHabit = async (habitId: string): Promise<Habit | null> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('habit_id', habitId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('[Supabase] Error fetching habit:', error);
    throw new Error(`Failed to fetch habit: ${error.message}`);
  }

  return {
    habit_id: data.habit_id,
    name: data.name,
    category: data.category || undefined,
    status: data.status as 'active' | 'inactive',
    created_date: data.created_date,
    modified_date: data.modified_date,
  };
};

/**
 * Create a new habit
 */
export const createHabit = async (habit: Habit): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('habits')
    .insert({
      habit_id: habit.habit_id,
      user_id: user.id,
      name: habit.name,
      category: habit.category || null,
      status: habit.status,
      created_date: habit.created_date,
      modified_date: habit.modified_date,
    });

  if (error) {
    console.error('[Supabase] Error creating habit:', error);
    throw new Error(`Failed to create habit: ${error.message}`);
  }

  console.log('[Supabase] Created habit:', habit.habit_id);
};

/**
 * Update an existing habit
 */
export const updateHabit = async (habit: Habit): Promise<void> => {
  const { error } = await supabase
    .from('habits')
    .update({
      name: habit.name,
      category: habit.category || null,
      status: habit.status,
      modified_date: habit.modified_date,
    })
    .eq('habit_id', habit.habit_id);

  if (error) {
    console.error('[Supabase] Error updating habit:', error);
    throw new Error(`Failed to update habit: ${error.message}`);
  }

  console.log('[Supabase] Updated habit:', habit.habit_id);
};

/**
 * Delete a habit (soft delete - marks as inactive)
 */
export const deleteHabit = async (habitId: string): Promise<void> => {
  const { error } = await supabase
    .from('habits')
    .update({
      status: 'inactive',
      modified_date: new Date().toISOString().split('T')[0],
    })
    .eq('habit_id', habitId);

  if (error) {
    console.error('[Supabase] Error deleting habit:', error);
    throw new Error(`Failed to delete habit: ${error.message}`);
  }

  console.log('[Supabase] Deleted (soft) habit:', habitId);
};

// ============================================================================
// LOGS
// ============================================================================

/**
 * Get logs with optional filters
 * @param habitId Filter by habit ID (optional)
 * @param date Filter by date in YYYY-MM-DD format (optional)
 */
export const getLogs = async (
  habitId?: string,
  date?: string
): Promise<LogEntry[]> => {
  let query = supabase.from('logs').select('*');

  if (habitId) {
    query = query.eq('habit_id', habitId);
  }

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query.order('timestamp', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching logs:', error);
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }

  return (data || []).map(row => ({
    log_id: row.log_id,
    habit_id: row.habit_id,
    date: row.date,
    status: row.status as 'done' | 'not_done' | 'no_data',
    notes: row.notes || undefined,
    timestamp: row.timestamp,
  }));
};

/**
 * Create a new log entry
 */
export const createLog = async (log: LogEntry): Promise<void> => {
  const { error } = await supabase
    .from('logs')
    .insert({
      log_id: log.log_id,
      habit_id: log.habit_id,
      date: log.date,
      status: log.status,
      notes: log.notes || null,
      timestamp: log.timestamp,
    });

  if (error) {
    console.error('[Supabase] Error creating log:', error);
    throw new Error(`Failed to create log: ${error.message}`);
  }

  console.log('[Supabase] Created log:', log.log_id);
};

/**
 * Update an existing log entry
 */
export const updateLog = async (log: LogEntry): Promise<void> => {
  const { error } = await supabase
    .from('logs')
    .update({
      status: log.status,
      notes: log.notes || null,
      timestamp: log.timestamp,
    })
    .eq('log_id', log.log_id);

  if (error) {
    console.error('[Supabase] Error updating log:', error);
    throw new Error(`Failed to update log: ${error.message}`);
  }

  console.log('[Supabase] Updated log:', log.log_id);
};

/**
 * Delete a log entry
 */
export const deleteLog = async (logId: string): Promise<void> => {
  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('log_id', logId);

  if (error) {
    console.error('[Supabase] Error deleting log:', error);
    throw new Error(`Failed to delete log: ${error.message}`);
  }

  console.log('[Supabase] Deleted log:', logId);
};

// ============================================================================
// METADATA
// ============================================================================

/**
 * Get metadata for current user
 */
export const getMetadata = async (): Promise<Metadata | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('metadata')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - return null (will be created on first sync)
      return null;
    }
    console.error('[Supabase] Error fetching metadata:', error);
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }

  return {
    sheet_version: data.db_version, // Map db_version to sheet_version for compatibility
    last_sync: data.last_sync,
    user_id: data.user_id,
    sheet_id: data.user_id, // Use user_id as sheet_id for compatibility
  };
};

/**
 * Update metadata for current user
 */
export const updateMetadata = async (metadata: Partial<Metadata>): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('metadata')
    .upsert({
      user_id: user.id,
      last_sync: metadata.last_sync || new Date().toISOString(),
      db_version: metadata.sheet_version || '1.0',
    });

  if (error) {
    console.error('[Supabase] Error updating metadata:', error);
    throw new Error(`Failed to update metadata: ${error.message}`);
  }

  console.log('[Supabase] Updated metadata');
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS (BONUS FEATURE)
// ============================================================================

/**
 * Subscribe to real-time changes for habits
 * @param callback Function called when habits change
 * @returns Unsubscribe function
 */
export const subscribeToHabits = (
  callback: (payload: any) => void
): (() => void) => {
  const channel = supabase
    .channel('habits-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habits',
      },
      callback
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

/**
 * Subscribe to real-time changes for logs
 * @param callback Function called when logs change
 * @returns Unsubscribe function
 */
export const subscribeToLogs = (
  callback: (payload: any) => void
): (() => void) => {
  const channel = supabase
    .channel('logs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'logs',
      },
      callback
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};
```

### 4.2 Update syncService.ts

**Modify** `src/services/syncService.ts` to use Supabase instead of Google Sheets:

**Key changes**:
1. Replace `import { googleSheetsService }` with `import * as supabaseData`
2. Replace all `googleSheetsService.readHabits()` calls with `supabaseData.getHabits()`
3. Replace all `googleSheetsService.writeHabits()` calls with batch operations
4. Simplify `processOperation()` method to use individual CRUD operations

**Example changes** (lines 191-215):

```typescript
// BEFORE:
async syncFromRemote(): Promise<void> {
  const [habits, logs, metadata] = await Promise.all([
    googleSheetsService.readHabits(),
    googleSheetsService.readLogs(),
    googleSheetsService.readMetadata(),
  ]);
  // ...
}

// AFTER:
import * as supabaseData from './supabaseDataService';

async syncFromRemote(): Promise<void> {
  const [habits, logs, metadata] = await Promise.all([
    supabaseData.getHabits(),
    supabaseData.getLogs(),
    supabaseData.getMetadata(),
  ]);
  // ...
}
```

**Example changes** (lines 269-305, `processOperation` method):

```typescript
// BEFORE:
private async processOperation(operation: any): Promise<void> {
  const { operationType, entityType, data } = operation;

  switch (entityType) {
    case 'habit':
      if (operationType === 'CREATE' || operationType === 'UPDATE') {
        const habits = await googleSheetsService.readHabits();
        const updatedHabits = habits.filter((h: Habit) => h.habit_id !== data.habit_id);
        updatedHabits.push(data);
        await googleSheetsService.writeHabits(updatedHabits);
      }
      // ...
  }
}

// AFTER:
private async processOperation(operation: any): Promise<void> {
  const { operationType, entityType, data } = operation;

  switch (entityType) {
    case 'habit':
      if (operationType === 'CREATE') {
        await supabaseData.createHabit(data);
      } else if (operationType === 'UPDATE') {
        await supabaseData.updateHabit(data);
      } else if (operationType === 'DELETE') {
        await supabaseData.deleteHabit(data.habit_id);
      }
      break;

    case 'log':
      if (operationType === 'CREATE') {
        await supabaseData.createLog(data);
      } else if (operationType === 'UPDATE') {
        await supabaseData.updateLog(data);
      } else if (operationType === 'DELETE') {
        await supabaseData.deleteLog(data.log_id);
      }
      break;

    case 'metadata':
      await supabaseData.updateMetadata(data);
      break;

    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}
```

**Summary of changes**:
- Replace ~15 lines that do "read all → filter → write all" with single CRUD calls
- Simpler, faster, more atomic operations
- No need to read entire dataset for single updates

### 4.3 Update syncQueue.ts (Minimal Changes)

**No major changes needed!** The sync queue logic remains the same. Only minor type updates if needed.

### 4.4 Keep storage.ts Unchanged

**No changes to `src/services/storage.ts`**. IndexedDB remains the local cache - this is the beauty of the offline-first architecture!

---

## Phase 5: Update Page Components (Day 7)

### 5.1 Update WelcomePage.tsx

**Modify** the Google Sign-In button to use new auth service:

```typescript
// BEFORE:
import { login } from '../services/auth';

const handleSignIn = async () => {
  try {
    await login(); // Opens Google Identity Services popup
    // Manually navigate after login
    navigate('/daily-log');
  } catch (error) {
    // ...
  }
};

// AFTER:
import { login } from '../services/auth';

const handleSignIn = async () => {
  try {
    await login(); // Opens Supabase OAuth redirect
    // Supabase will redirect to /daily-log automatically (configured in auth.ts)
  } catch (error) {
    // ...
  }
};
```

### 5.2 Update Other Components

**Check and update** any components that directly call auth functions:
- `Navigation.tsx` (logout button)
- `ManageHabitsPage.tsx` (user profile display)
- `ProgressPage.tsx` (user-specific data)

Most components should work without changes since we kept the same auth.ts API surface.

---

## Phase 6: Data Migration Script (Day 8)

### 6.1 Create Migration Script

**New file**: `scripts/migrate-sheets-to-supabase.ts`

```typescript
/**
 * One-time migration script: Google Sheets → Supabase
 *
 * This script reads data from Google Sheets and imports it into Supabase.
 * Run once per user during migration cutover.
 *
 * Usage:
 *   npm install ts-node
 *   npx ts-node scripts/migrate-sheets-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Import old Google Sheets functions
import {
  readHabits as readSheetsHabits,
  readLogs as readSheetsLogs,
  readMetadata as readSheetsMetadata,
} from '../src/services/googleSheets';

// Supabase config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Service role key (admin)

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables!');
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface UserMigration {
  userId: string;
  email: string;
  sheetId: string;
}

/**
 * Migrate a single user's data
 */
async function migrateUser(migration: UserMigration): Promise<void> {
  console.log(`\n📦 Migrating user: ${migration.email}`);
  console.log(`   Sheet ID: ${migration.sheetId}`);

  try {
    // Step 1: Read from Google Sheets
    console.log('   📖 Reading from Google Sheets...');
    const habits = await readSheetsHabits(migration.sheetId);
    const logs = await readSheetsLogs(migration.sheetId);
    const metadata = await readSheetsMetadata(migration.sheetId);

    console.log(`   Found: ${habits.length} habits, ${logs.length} logs`);

    // Step 2: Create user in Supabase Auth (if not exists)
    // Note: For existing Google OAuth users, they'll be created on first login
    // This step is only needed if migrating users who haven't logged in yet

    // Step 3: Insert habits
    console.log('   💾 Inserting habits...');
    const habitInserts = habits.map(habit => ({
      habit_id: habit.habit_id,
      user_id: migration.userId,
      name: habit.name,
      category: habit.category || null,
      status: habit.status,
      created_date: habit.created_date,
      modified_date: habit.modified_date,
    }));

    const { error: habitsError } = await supabase
      .from('habits')
      .upsert(habitInserts, { onConflict: 'habit_id' });

    if (habitsError) {
      throw new Error(`Failed to insert habits: ${habitsError.message}`);
    }

    // Step 4: Insert logs
    console.log('   💾 Inserting logs...');
    const logInserts = logs.map(log => ({
      log_id: log.log_id,
      habit_id: log.habit_id,
      date: log.date,
      status: log.status,
      notes: log.notes || null,
      timestamp: log.timestamp,
    }));

    // Insert in batches of 1000 (Supabase limit)
    for (let i = 0; i < logInserts.length; i += 1000) {
      const batch = logInserts.slice(i, i + 1000);
      const { error: logsError } = await supabase
        .from('logs')
        .upsert(batch, { onConflict: 'log_id' });

      if (logsError) {
        throw new Error(`Failed to insert logs batch: ${logsError.message}`);
      }
      console.log(`   Inserted logs ${i + 1} - ${Math.min(i + 1000, logInserts.length)}`);
    }

    // Step 5: Insert metadata
    console.log('   💾 Inserting metadata...');
    const { error: metadataError } = await supabase
      .from('metadata')
      .upsert({
        user_id: migration.userId,
        last_sync: metadata?.last_sync || new Date().toISOString(),
        db_version: metadata?.sheet_version || '1.0',
      });

    if (metadataError) {
      throw new Error(`Failed to insert metadata: ${metadataError.message}`);
    }

    console.log(`   ✅ Migration complete for ${migration.email}`);
  } catch (error) {
    console.error(`   ❌ Migration failed for ${migration.email}:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Google Sheets → Supabase Migration Tool\n');

  // TODO: Replace with actual user list
  // You can get this from:
  // 1. Your auth logs (list of Google user IDs)
  // 2. Metadata in IndexedDB (query all users' local storage)
  // 3. Manual list from your user tracking system

  const usersToMigrate: UserMigration[] = [
    {
      userId: 'google-oauth-user-id-1',
      email: 'user1@example.com',
      sheetId: 'sheet-id-from-metadata-1',
    },
    {
      userId: 'google-oauth-user-id-2',
      email: 'user2@example.com',
      sheetId: 'sheet-id-from-metadata-2',
    },
    // Add all users here
  ];

  console.log(`Found ${usersToMigrate.length} users to migrate\n`);

  // Confirm before proceeding
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>(resolve => {
    rl.question('Proceed with migration? (yes/no): ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('Migration cancelled.');
    process.exit(0);
  }

  // Migrate each user
  let successCount = 0;
  let failCount = 0;

  for (const user of usersToMigrate) {
    try {
      await migrateUser(user);
      successCount++;
    } catch (error) {
      failCount++;
      // Continue with next user
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   Total: ${usersToMigrate.length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some migrations failed. Check errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All migrations completed successfully!');
  }
}

// Run migration
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### 6.2 Run Migration

```bash
# Set up environment
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"  # From Supabase dashboard

# Install dependencies
npm install ts-node

# Run migration
npx ts-node scripts/migrate-sheets-to-supabase.ts
```

**Important**: Get the **Service Role Key** (not Anon Key) from Supabase Dashboard → Settings → API. This key bypasses RLS for admin operations.

---

## Phase 7: Testing (Days 9-10)

### 7.1 Local Testing Checklist

**Authentication**:
- [ ] Sign in with Google OAuth works
- [ ] User is redirected to /daily-log after login
- [ ] User profile displays correctly
- [ ] Sign out works
- [ ] Session persists across page refreshes

**Habits Management**:
- [ ] Create new habit → saves to Supabase + IndexedDB
- [ ] Edit habit → updates in Supabase + IndexedDB
- [ ] Delete habit → marks as inactive in Supabase + IndexedDB
- [ ] View habits list → shows only user's habits (RLS working)

**Daily Logging**:
- [ ] Toggle habit done/not done → saves to Supabase + IndexedDB
- [ ] Add notes → saves to Supabase + IndexedDB
- [ ] Navigate between dates → loads correct logs
- [ ] Back-dating (5 days) works

**Progress & Analytics**:
- [ ] Streak calculation correct
- [ ] Completion percentage correct
- [ ] Notes analysis works (7+ entries with notes)

**Offline Functionality**:
- [ ] Disconnect WiFi → app still works (reads from IndexedDB)
- [ ] Create/edit habits offline → queued in sync queue
- [ ] Create/edit logs offline → queued in sync queue
- [ ] Reconnect WiFi → sync queue processes automatically
- [ ] Verify changes synced to Supabase

**Multi-device Sync** (NEW FEATURE):
- [ ] Open app on Device A → make changes
- [ ] Open app on Device B → changes appear (after refresh or real-time)
- [ ] Make changes on both devices → last-write-wins conflict resolution

### 7.2 Performance Testing

**Measure sync latency**:
- Current (Google Sheets): 2-5 seconds
- Target (Supabase): <500ms

**Test with various data sizes**:
- [ ] 10 habits, 100 logs → fast
- [ ] 50 habits, 1000 logs → still fast
- [ ] 100 habits, 10,000 logs → acceptable

### 7.3 Security Testing

**Row-Level Security validation**:
- [ ] User A cannot see User B's habits (test with 2 accounts)
- [ ] User A cannot modify User B's data (test API directly)
- [ ] Unauthenticated requests blocked

### 7.4 Integration Testing

Run existing test suite:
```bash
npm test -- --run
```

**Expected results**:
- Most tests should pass without changes (storage.ts, utils unchanged)
- Update auth tests to use Supabase mocks
- Update sync tests to use Supabase mocks

---

## Phase 8: Deployment

### 8.1 Update Environment Variables

**Production .env**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 8.2 Build and Deploy

```bash
# Build production bundle
npm run build

# Deploy to your hosting (e.g., Google Cloud Run, Vercel, Netlify)
# Example for Google App Engine:
gcloud app deploy
```

### 8.3 Update OAuth Redirect URIs

In Google Cloud Console → OAuth Credentials:
- Add production redirect URI: `https://your-production-domain.com/daily-log`
- Keep Supabase redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### 8.4 Monitor First Week

**Key metrics to watch**:
- Authentication success rate
- Sync latency (should be <500ms)
- Error rates (Supabase dashboard → Logs)
- User complaints about data loss or sync issues

**Rollback plan**:
- If critical issues: revert to Google Sheets version
- Keep Google Sheets data intact for 2 weeks (don't delete)
- Feature flag to switch between backends if needed

---

## Phase 9: Cleanup (After 2 Weeks)

### 9.1 Remove Old Code

Once migration is stable:
```bash
# Delete old Google Sheets service
rm src/services/googleSheets.ts

# Delete token manager (if not already deleted)
rm src/utils/tokenManager.ts

# Update .gitignore to remove old env vars
```

### 9.2 Update Documentation

- Update `CLAUDE.md` with new architecture
- Update `README.md` with Supabase setup instructions
- Document new environment variables

---

## Cost Projections

### Free Tier Limits

**Supabase Free Tier**:
- 500 MB database storage
- 1 GB file storage (not used)
- 2 GB bandwidth/month
- 50,000 monthly active users

**Estimated capacity**:
- Average user: ~10 KB (10 habits × 100 logs each)
- 500 MB = ~50,000 users
- **Realistic free tier capacity: 1,000-2,000 active users**

### Upgrade Path

| Users | Plan | Cost | Storage | Bandwidth |
|-------|------|------|---------|-----------|
| 0-1,000 | Free | $0/mo | 500 MB | 2 GB |
| 1,000-10,000 | Pro | $25/mo | 8 GB | 250 GB |
| 10,000+ | Team | $599/mo | 200 GB | 2.5 TB |

**When to upgrade**: When you hit 500 MB storage (~1,000 active users with history)

---

## Rollback Plan

If migration fails or critical issues arise:

### Quick Rollback (Same Day)

1. **Revert code changes**:
   ```bash
   git revert <migration-commit-hash>
   npm install
   npm run build
   ```

2. **Redeploy old version**:
   ```bash
   gcloud app deploy  # Or your deployment method
   ```

3. **Google Sheets still has data** (read-only during migration)

### Data Recovery

- All Google Sheets data remains intact during migration
- Users can continue using old version
- No data loss if rollback needed

---

## Success Metrics

**Migration successful if**:
- ✅ All users can authenticate with Google OAuth
- ✅ Sync latency <500ms (5-10x improvement)
- ✅ Zero data loss (all habits + logs migrated)
- ✅ Offline functionality works (IndexedDB cache)
- ✅ Multi-device sync works (new feature)
- ✅ RLS prevents cross-user data access
- ✅ No increase in error rates
- ✅ User satisfaction maintained or improved

---

## FAQ

### Q: Will users need to re-authenticate?
**A**: Yes, one time. They'll sign in with Google OAuth through Supabase (seamless experience).

### Q: What happens to data in Google Sheets?
**A**: Keep it as backup for 2 weeks, then optionally delete (or keep indefinitely as archive).

### Q: Can users export their data?
**A**: Yes, add export feature: query Supabase → download as JSON/CSV.

### Q: What if Supabase goes down?
**A**: App continues working offline (IndexedDB). Sync resumes when Supabase back up.

### Q: Can we self-host Supabase?
**A**: Yes! Supabase is open source. Can migrate to self-hosted later if needed.

### Q: Is real-time sync required?
**A**: No, it's a bonus feature. App works fine with manual refresh (like current version).

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Set up Supabase project** (Day 1)
3. **Start Phase 1** (database schema)
4. **Test thoroughly** on staging/dev environment
5. **Migrate test users first** (beta testing)
6. **Gradual rollout** to production (10% → 50% → 100%)

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Migration Support**: Create issue in this repo or contact team

---

**End of Migration Plan**

*Last Updated: 2025-10-14*
