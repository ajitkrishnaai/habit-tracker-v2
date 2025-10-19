/**
 * Supabase Test Mocks
 *
 * Provides mock implementations of Supabase client for testing.
 * These mocks simulate the Supabase API without making real network calls.
 */

import { vi } from 'vitest';
import type { Database, Habit, Log, Metadata } from '../types/database';

/**
 * Mock Supabase Response
 * Matches the structure returned by Supabase client methods
 */
export interface MockSupabaseResponse<T> {
  data: T | null;
  error: MockSupabaseError | null;
}

/**
 * Mock Supabase Error
 */
export interface MockSupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Mock Auth Session
 */
export interface MockAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

/**
 * Mock data stores for in-memory database simulation
 */
export class MockSupabaseDataStore {
  habits: Habit[] = [];
  logs: Log[] = [];
  metadata: Metadata[] = [];
  currentSession: MockAuthSession | null = null;

  reset() {
    this.habits = [];
    this.logs = [];
    this.metadata = [];
    this.currentSession = null;
  }

  setSession(session: MockAuthSession | null) {
    this.currentSession = session;
  }
}

/**
 * Create a mock Supabase query builder
 */
export function createMockQueryBuilder<T>(
  store: MockSupabaseDataStore,
  tableName: keyof Database['public']['Tables']
) {
  const filters: Array<(item: any) => boolean> = [];
  let selectedFields: string[] | null = null;
  let singleResult = false;
  let orderByField: string | null = null;
  let orderByAscending = true;

  const builder = {
    // SELECT operation
    select: (fields: string = '*') => {
      if (fields !== '*') {
        selectedFields = fields.split(',').map(f => f.trim());
      }
      return builder;
    },

    // WHERE clauses
    eq: (field: string, value: any) => {
      filters.push((item: any) => item[field] === value);
      return builder;
    },

    neq: (field: string, value: any) => {
      filters.push((item: any) => item[field] !== value);
      return builder;
    },

    in: (field: string, values: any[]) => {
      filters.push((item: any) => values.includes(item[field]));
      return builder;
    },

    is: (field: string, value: any) => {
      filters.push((item: any) => item[field] === value);
      return builder;
    },

    // ORDER BY
    order: (field: string, options?: { ascending?: boolean }) => {
      orderByField = field;
      orderByAscending = options?.ascending ?? true;
      return builder;
    },

    // LIMIT
    limit: (_count: number) => {
      // Store limit for later use (currently not implemented)
      return builder;
    },

    // Single result
    single: () => {
      singleResult = true;
      return builder;
    },

    // Execute query and return results
    then: async (resolve: (value: MockSupabaseResponse<T>) => void) => {
      try {
        // Get the data array from store
        let data: any[];
        if (tableName === 'habits') {
          data = [...store.habits];
        } else if (tableName === 'logs') {
          data = [...store.logs];
        } else if (tableName === 'metadata') {
          data = [...store.metadata];
        } else {
          data = [];
        }

        // Apply filters
        for (const filter of filters) {
          data = data.filter(filter);
        }

        // Apply ordering
        if (orderByField) {
          data.sort((a, b) => {
            const aVal = a[orderByField as keyof typeof a];
            const bVal = b[orderByField as keyof typeof b];
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return orderByAscending ? comparison : -comparison;
          });
        }

        // Apply field selection
        if (selectedFields) {
          data = data.map(item => {
            const selected: any = {};
            for (const field of selectedFields!) {
              if (field in item) {
                selected[field] = item[field];
              }
            }
            return selected;
          });
        }

        // Return single or array
        if (singleResult) {
          if (data.length === 0) {
            resolve({ data: null, error: { message: 'No rows found' } });
          } else if (data.length > 1) {
            resolve({ data: null, error: { message: 'Multiple rows returned' } });
          } else {
            resolve({ data: data[0] as T, error: null });
          }
        } else {
          resolve({ data: data as T, error: null });
        }
      } catch (err) {
        resolve({
          data: null,
          error: { message: (err as Error).message }
        });
      }
    }
  };

  return builder;
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabaseClient(store: MockSupabaseDataStore = new MockSupabaseDataStore()) {
  return {
    // Query builder for tables
    from: (tableName: keyof Database['public']['Tables']) => {
      return {
        select: (fields: string = '*') => createMockQueryBuilder(store, tableName).select(fields),

        insert: async (data: any) => {
          const now = new Date().toISOString();
          const newItem = {
            ...data,
            created_date: now,
            modified_date: now
          };

          if (tableName === 'habits') {
            store.habits.push(newItem);
          } else if (tableName === 'logs') {
            store.logs.push(newItem);
          } else if (tableName === 'metadata') {
            store.metadata.push(newItem);
          }

          return { data: newItem, error: null };
        },

        update: async (updates: any) => {
          const updateBuilder = {
            eq: async (field: string, value: any) => {
              let updated: any = null;
              const now = new Date().toISOString();

              if (tableName === 'habits') {
                const index = store.habits.findIndex((h: Habit) => (h as any)[field] === value);
                if (index !== -1) {
                  store.habits[index] = {
                    ...store.habits[index],
                    ...updates,
                    modified_date: now
                  };
                  updated = store.habits[index];
                }
              } else if (tableName === 'logs') {
                const index = store.logs.findIndex((l: Log) => (l as any)[field] === value);
                if (index !== -1) {
                  store.logs[index] = {
                    ...store.logs[index],
                    ...updates,
                    modified_date: now
                  };
                  updated = store.logs[index];
                }
              } else if (tableName === 'metadata') {
                const index = store.metadata.findIndex((m: Metadata) => (m as any)[field] === value);
                if (index !== -1) {
                  store.metadata[index] = {
                    ...store.metadata[index],
                    ...updates,
                    modified_date: now
                  };
                  updated = store.metadata[index];
                }
              }

              return { data: updated, error: updated ? null : { message: 'Not found' } };
            }
          };
          return updateBuilder;
        },

        delete: async () => {
          const deleteBuilder = {
            eq: async (field: string, value: any) => {
              let deleted: any = null;

              if (tableName === 'habits') {
                const index = store.habits.findIndex((h: Habit) => (h as any)[field] === value);
                if (index !== -1) {
                  deleted = store.habits.splice(index, 1)[0];
                }
              } else if (tableName === 'logs') {
                const index = store.logs.findIndex((l: Log) => (l as any)[field] === value);
                if (index !== -1) {
                  deleted = store.logs.splice(index, 1)[0];
                }
              } else if (tableName === 'metadata') {
                const index = store.metadata.findIndex((m: Metadata) => (m as any)[field] === value);
                if (index !== -1) {
                  deleted = store.metadata.splice(index, 1)[0];
                }
              }

              return { data: deleted, error: deleted ? null : { message: 'Not found' } };
            }
          };
          return deleteBuilder;
        },

        upsert: async (data: any) => {
          const now = new Date().toISOString();
          let upserted: any = null;

          if (tableName === 'metadata') {
            // Metadata uses user_id as primary key
            const index = store.metadata.findIndex((m: Metadata) => m.user_id === data.user_id);
            if (index !== -1) {
              // Update existing
              store.metadata[index] = {
                ...store.metadata[index],
                ...data,
                modified_date: now
              };
              upserted = store.metadata[index];
            } else {
              // Insert new
              upserted = {
                ...data,
                created_date: now,
                modified_date: now
              };
              store.metadata.push(upserted);
            }
          }

          return { data: upserted, error: null };
        }
      };
    },

    // Auth methods
    auth: {
      getSession: async () => {
        return {
          data: { session: store.currentSession },
          error: null
        };
      },

      getUser: async () => {
        if (store.currentSession) {
          return {
            data: { user: store.currentSession.user },
            error: null
          };
        }
        return { data: { user: null }, error: null };
      },

      signInWithOAuth: async (options: any) => {
        // Mock OAuth sign-in
        return { data: { provider: options.provider, url: 'https://mock-oauth-url' }, error: null };
      },

      signOut: async () => {
        store.currentSession = null;
        return { error: null };
      },

      onAuthStateChange: vi.fn((_callback: (event: string, session: any) => void) => {
        // Return unsubscribe function
        // callback parameter is for the actual implementation, not used in mock
        return {
          data: { subscription: { unsubscribe: vi.fn() } }
        };
      })
    }
  };
}

/**
 * Mock test data generators
 */
export const mockTestData = {
  createHabit: (overrides: Partial<Habit> = {}): Habit => ({
    habit_id: `habit_${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'test-user-id',
    name: 'Test Habit',
    category: 'Health',
    status: 'active',
    created_date: new Date().toISOString(),
    modified_date: new Date().toISOString(),
    ...overrides
  }),

  createLog: (overrides: Partial<Log> = {}): Log => ({
    log_id: `log_${Math.random().toString(36).substr(2, 9)}`,
    habit_id: 'habit_test123',
    user_id: 'test-user-id',
    date: new Date().toISOString().split('T')[0],
    status: 'done',
    notes: null,
    created_date: new Date().toISOString(),
    modified_date: new Date().toISOString(),
    ...overrides
  }),

  createMetadata: (overrides: Partial<Metadata> = {}): Metadata => ({
    user_id: 'test-user-id',
    sheet_version: '2.0',
    last_sync: new Date().toISOString(),
    created_date: new Date().toISOString(),
    modified_date: new Date().toISOString(),
    ...overrides
  }),

  createSession: (overrides: Partial<MockAuthSession> = {}): MockAuthSession => ({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    },
    ...overrides
  })
};

/**
 * Create a mock Supabase client with pre-populated data
 */
export function createMockSupabaseClientWithData(options: {
  habits?: Habit[];
  logs?: Log[];
  metadata?: Metadata[];
  session?: MockAuthSession | null;
} = {}) {
  const store = new MockSupabaseDataStore();

  if (options.habits) store.habits = [...options.habits];
  if (options.logs) store.logs = [...options.logs];
  if (options.metadata) store.metadata = [...options.metadata];
  if (options.session !== undefined) store.currentSession = options.session;

  return { client: createMockSupabaseClient(store), store };
}
