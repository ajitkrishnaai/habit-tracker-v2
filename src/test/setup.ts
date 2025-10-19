/**
 * Test Setup
 *
 * Global test configuration and mocks
 */

import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for Supabase
vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key-for-testing-purposes-only');

// Mock window.crypto for UUID generation
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = {
    randomUUID: () => crypto.randomUUID(),
  } as any;
}

// Mock navigator if not available
if (typeof global.navigator === 'undefined') {
  (global as any).navigator = {
    onLine: true,
  };
}
