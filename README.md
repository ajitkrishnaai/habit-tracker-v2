# Habit Tracker V2

A mobile-first Progressive Web App (PWA) for tracking daily habits with complete data ownership. Built with React, TypeScript, and Supabase.

## Features

- **Daily Habit Logging** - Quick toggle switches for marking habits as done/not done
- **Progress Tracking** - View streaks, completion percentages, and pattern analysis
- **Offline-First** - Full functionality without internet connection, auto-sync when online
- **Data Privacy** - Your data is stored in Supabase with Row-Level Security (RLS)
- **Mobile-Optimized** - PWA with service workers for offline capability and installation

## Tech Stack

- **Frontend**: React 18.2 + TypeScript 5.2 + Vite 5.0
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth with email/password
- **Offline Storage**: IndexedDB with background sync
- **Styling**: CSS with mobile-first responsive design
- **Testing**: Vitest (unit tests) + Playwright (E2E tests)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/habit-tracker-v2.git
cd habit-tracker-v2
npm install
```

### 2. Supabase Setup

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Run the database migration from `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor
3. Run the trigger fix migration from `supabase/migrations/002_fix_metadata_trigger.sql`
4. Enable email/password authentication in Supabase Dashboard → Authentication → Providers
5. Get your project credentials from Settings → API

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

Replace the placeholders with your actual Supabase credentials from step 2.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Commands

### Development
```bash
npm run dev      # Start dev server on http://localhost:5173
npm run build    # Build for production (outputs to /dist)
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Testing
```bash
npm test                  # Run unit tests in watch mode
npm test -- --run         # Run unit tests once
npm run test:coverage     # Run tests with coverage report
npm run test:e2e          # Run Playwright E2E tests
npm run test:e2e:ui       # Run E2E tests with interactive UI
npm run test:e2e:debug    # Debug E2E tests with Playwright Inspector
```

## Project Structure

```
habit-tracker-v2/
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/            # Page-level components
│   ├── services/         # Data services (Supabase, IndexedDB, sync)
│   ├── lib/              # Supabase client initialization
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions (validation, calculations)
│   └── test/             # Test setup and mocks
├── supabase/
│   ├── migrations/       # Database schema migrations
│   └── seed.sql          # Sample data for development
├── tasks/                # Project planning and task lists
├── agents/               # AI agent rules for development workflow
└── public/               # Static assets and PWA manifest
```

## Key Features Explained

### Offline-First Architecture

- **Local Storage**: All data cached in IndexedDB for instant access
- **Background Sync**: Operations queued when offline, synced automatically when online
- **Conflict Resolution**: Last-write-wins based on timestamps
- **Retry Logic**: Failed syncs retry with exponential backoff (30s, 60s, 120s)

### Data Security

- **Row-Level Security (RLS)**: Enforced at the database level - users can only access their own data
- **Automatic User ID Injection**: All data operations automatically scoped to authenticated user
- **No Custom Backend**: Pure client-side app, Supabase handles all backend logic

### Performance

- **Optimistic UI**: Immediate visual feedback, sync happens in background
- **Minimal Bundle Size**: ~520 KB gzipped production build
- **Fast Load Times**: <3s initial load on 4G networks

## Testing

- **Unit Tests**: 747/749 passing (99.7% coverage)
- **E2E Tests**: Playwright tests for critical user flows
- **Test Environment**: Vitest + happy-dom for fast unit tests

Known test failures (2 tests):
- Date validation edge cases (timezone handling issues)
- Documented in `TEST_REPORT_TASKS_1-6.md`

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete project documentation for AI-assisted development
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed Supabase configuration guide
- **[MIGRATION_LOG.md](./MIGRATION_LOG.md)** - Migration decisions and lessons learned
- **[tasks/](./tasks/)** - PRDs and implementation task lists

## Contributing

This is a personal project, but feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Roadmap

- [x] Supabase migration (Google Sheets → Supabase PostgreSQL)
- [ ] Additional features (TBD)
- [ ] Production deployment
- [ ] PWA enhancements (push notifications, background sync improvements)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in `CLAUDE.md` and `SUPABASE_SETUP.md`
