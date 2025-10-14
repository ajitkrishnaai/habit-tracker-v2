/**
 * Test Setup
 *
 * Global test configuration and mocks
 */

import 'fake-indexeddb/auto';

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
