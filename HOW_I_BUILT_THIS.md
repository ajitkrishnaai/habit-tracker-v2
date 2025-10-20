# How I Built This: A Habit Tracker in 7 Days

**Or: What happens when a product manager with no recent coding experience decides to just... ship**

---

## First, Let Me Be Honest

I'm not a developer. I mean, I studied computer science in college and worked as a programmer for about a year, but that was a lifetime ago. For the past several years, I've been a UX designer, user researcher, and now a product manager at a tech company.

I work with engineers every day. I write specs, review designs, debate architecture decisions. But I don't write production code. I hadn't opened an IDE in years.

So when I decided to build a habit tracker from scratch, I was terrified.

But here's the thing about being a PM: you get really good at breaking down complex problems, prioritizing ruthlessly, and shipping iteratively. Turns out, those skills matter when you're building software—maybe even more than knowing how to write a perfect algorithm.

This is the story of building a mobile-first habit tracker in seven days, including a complete architectural pivot, comprehensive testing, and a demo mode feature. It's a story about learning to code again, making deliberate product decisions, and discovering that AI coding assistants have gotten *really* good.

---

## The Why

I've tried probably a dozen habit trackers over the years. You know the type—gorgeous interfaces, gamification everywhere, premium tiers, social features you never asked for. But here's the thing: I never stuck with any of them. Not because they weren't good, but because they were... too much.

I wanted something simple. Dead simple. Track my habits, see my streaks, maybe jot down a note about how I'm feeling. That's it. No badges, no leaderboards, no notification spam asking me to "complete my daily quests."

So I did what any PM does when they can't find the tool they want: I wrote a PRD and... waited for someone else to build it?

No. I decided to build it myself.

This is the story of building a mobile-first habit tracker in seven days—including a complete architectural pivot, comprehensive testing, and a demo mode feature. It's a story about product decisions, technical tradeoffs, and a few late nights fighting with APIs that didn't want to cooperate.

---

## Day 1: The Beginning (October 13, 3:27 PM)

I started the way any PM starts: with a PRD.

I knew what I wanted from a user perspective:

- **Mobile-first design** (because let's be honest, I'm never at my computer when I remember to log my habits)
- **Offline-capable** (spotty wifi shouldn't break my tracking streak)
- **User data ownership** (your habits are personal; they should live in *your* storage, not some company's database)

That last point was important to me. I initially planned to store everything in the user's Google Drive via Google Sheets. It felt right—users would own their data, they could peek at the raw spreadsheet if they wanted, and I wouldn't have to manage a database server.

But here's where I had to be honest with myself: **I had no idea how to actually build this.**

### Enter: AI Coding Assistants

I'd been hearing about AI coding tools—GitHub Copilot, Cursor, Claude Code. As a PM, I'd watched our engineers start using them. They seemed... magical? Skeptical but desperate, I decided to try Claude Code.

Here's the thing nobody tells you about AI coding assistants: they're not just autocomplete. They're like pair programming with someone who's infinitely patient, never judges you for asking basic questions, and can write code faster than you can type "how do I..."

I started by asking Claude to help me set up a React + TypeScript project with Vite. Within minutes, I had:

- **React 18** with TypeScript (I remembered TypeScript made things safer)
- **Vite** for builds (Claude suggested it, I trusted it)
- **React Router 6** for navigation
- **IndexedDB** for local storage (this was new to me)
- **Testing setup** with Vitest and Playwright (Claude insisted on this, I'm glad it did)

My first commit at 3:42 PM: "feat: complete project setup and configuration (Task 1.0)".

I stared at the terminal. It worked. The dev server was running. I had a React app.

**I felt like a fraud and a genius at the same time.**

---

## Day 1: The Google Sheets Battle (October 13, Evening)

Here's where things got interesting—and by interesting, I mean I nearly gave up.

### 4:10 PM: Authentication Works!

Google OAuth setup was... surprisingly smooth? Claude helped me set up the OAuth flow, configure the credentials, handle the callback. Within 40 minutes, users could sign in with Google. I could hardly believe it worked on the first try.

(Spoiler: This was the calm before the storm.)

### 4:23 PM: My First Product Decision

I was looking at the OAuth permissions screen and noticed my app was requesting access to *all* of the user's Google Drive files (`drive` scope).

My PM brain kicked in: "Wait, why does a habit tracker need access to someone's entire Drive?"

I asked Claude to switch to the minimal `drive.file` scope—my app could only access files it created, nothing else. As someone who's reviewed countless privacy policies and sat through security reviews, this felt important. Your habit tracker doesn't need to see your tax returns.

**Commit at 4:23 PM**: "security: switch to drive.file scope for minimal permissions"

This felt good. I was making product decisions, not just writing code.

### 6:54 PM - 10:54 PM: Reality Check

This is where I learned that Google Sheets API is not designed for people like me.

I spent **four hours** fighting with things I didn't understand:

1. **gapi-script and race conditions** - Sometimes the Google API script loaded, sometimes it didn't. I kept refreshing the page, staring at blank screens, wondering if I'd broken everything.

2. **A1 notation** - Apparently you don't write to "row 3", you write to "Sheet1!A3:F3". Want to append? Use "Sheet1!A:F". Want to update? Different method. Want to batch update? Completely different approach. This made no sense to my non-developer brain.

3. **Async/await/Promises** - I remembered these concepts from college, but using them in practice was different. Every API call returned a Promise. Some Promises returned more Promises. Error handling was a nightmare.

At one point around 9 PM, I seriously considered giving up. I texted my partner: "I don't think I can do this."

But then I remembered something a senior engineer once told me: **"When you're stuck, step back and explain the problem to someone else."**

So I explained it to Claude. Not just "fix this error," but "here's what I'm trying to do, here's what's failing, here's what I don't understand."

And slowly, piece by piece, we figured it out:
- Removed the unreliable `gapi-script` library
- Abstracted all the A1 notation complexity into helper functions
- Built a clean service layer that components could use without knowing about Google Sheets internals

**Commit at 10:54 PM**: "fix: remove gapi-script dependency and fix Google Sheets API calls"

The diff: +87 lines, -134 lines. Somehow we'd made it *simpler*.

**What I learned**: As a PM, I'm used to saying "let's simplify this." As a person writing code with AI assistance, I learned that simplification isn't just good product thinking—it's survival. If the code is too complex for me to understand, I can't maintain it.

---

## Days 1-2: The Sprint (October 13, 11:38 PM - October 14, 12:34 AM)

With the Google Sheets API finally working, something shifted. I stopped being terrified and started being curious.

Maybe it was the exhaustion. Maybe it was the adrenaline. But I found myself asking Claude: "Okay, what's next?"

### 11:38 PM: Learning About Offline-First

I explained to Claude what I wanted: "The app should work even when I'm offline. Like, actually work, not just show a sad 'no internet' screen."

Claude suggested an **offline-first architecture** with IndexedDB. I'd heard of IndexedDB (it's a browser database), but I'd never used it.

Together, we built:

- **IndexedDB storage** with three object stores: habits, logs, metadata
- **Sync Queue** that saves operations when you're offline
- **Sync Service** that pushes changes to Google Sheets when you're back online

Here's what blew my mind: The pattern was beautiful. Write to IndexedDB first (instant), sync to Google Sheets in the background (slow but reliable). The UI never blocks. The user never waits.

**Why did I insist on offline-first?** Because I'm a user researcher. I've watched people use apps on subway platforms, in coffee shops with spotty wifi, in rural areas with terrible cell coverage. "Works offline" isn't a nice-to-have—it's table stakes for mobile apps.

### 11:53 PM: Habit Management (My First Real Product Decisions)

For the habit management interface, I finally got to do what I'm good at: thinking about user experience.

I told Claude: "Users should be able to add, edit, and delete habits. But here's the thing—I don't want 'delete' to actually delete data."

"Why not?" Claude asked (okay, it didn't really ask, but roll with me).

"Because as a PM, I've seen users rage-delete things and then regret it. If you delete 'exercise' after missing 3 days in a row, I don't want your 90-day streak from last quarter to vanish. Soft delete. Mark it inactive. Keep the history."

This was *my* decision. Claude wrote the code, but the product thinking was mine. It felt good.

Other decisions I made:
- Case-insensitive duplicate checking (you can't have both "Exercise" and "exercise")
- 100-character limit on habit names (because "Drink 8 glasses of water while contemplating the nature of existence" is too long)
- Optional categories (structure for people who want it, freedom for people who don't)

### 12:13 AM: Daily Logging (UX Research Pays Off)

This was the screen users would see every single day. It had to be *perfect*.

My background as a UX designer kicked in:

- **Toggle switches** instead of checkboxes (bigger touch targets, clearer states)
- **One shared notes field** instead of per-habit notes

Wait, why one shared notes field? I literally tested this on myself for a week before building the app. When I log habits at night, I don't think "here's why I exercised, here's why I meditated, here's why I read." I think about my overall day: "Feeling tired, but pushed through. Proud of myself."

The shared notes field matched my mental model. And as a user researcher, I've learned: if it matches *my* mental model, it probably matches other people's too.

- **Date navigation to backfill up to 5 days** - because life happens and you forget to log

Claude implemented it. But the UX decisions? Those were mine.

### 12:34 AM: Progress & Analytics

For the analytics, I wanted three things:

1. **Current streak** - Am I building a habit right now?
2. **Longest streak** - What's the best I've ever done?
3. **Completion percentage** - Overall, how consistent am I?

Plus notes history and pattern analysis (using a tiny NLP library called `sentiment`).

**Product decision**: The notes analysis only shows up after 7+ entries. Why? Because showing "not enough data" feels bad. Better to hide the feature until it can provide real value.

**Commit at 12:34 AM**: "feat: implement progress & analytics (Task 6.0)"

I went to bed at 1 AM. Six core features built in about 12 hours.

Here's the honest truth: Claude wrote probably 90% of the *code*. But I made 100% of the *product decisions*. And I was learning to read and understand the code well enough to know when something felt wrong.

---

## Day 2: Polish & Testing (October 14)

I woke up Monday morning to a working app. Then the impostor syndrome hit hard.

"This can't be right," I thought. "Real apps don't get built in one night by someone who barely codes."

I opened the browser. Clicked around. Everything worked. I turned off wifi. Still worked. I refreshed the page. Data persisted.

**But what if it breaks?** What if there's a bug I didn't see? What if a user does something I didn't anticipate?

This is where being a PM with no engineering background became an advantage: **I was paranoid about breaking things.**

### Morning: UI/UX Polish

I spent the morning on details, because details matter:

- **Mobile-first responsive design** - Tested on actual iPhone SE (320px width), not just Chrome DevTools
- **Accessibility** - Keyboard navigation, screen reader labels, WCAG 2.1 AA contrast ratios
- **Touch targets** - 44x44px minimum (I literally opened iOS Human Interface Guidelines and followed it)
- **Loading states** - Because I *hate* apps that leave me wondering if they're working
- **Empty states** - "You haven't added any habits yet! Let's get started." is friendlier than a blank screen
- **Error messages** - "Something went wrong" is useless. "Failed to save. You're offline. Your changes will sync when you reconnect." is helpful.

**Commit at 10:30 PM**: "feat: complete Task 7.0 UI/UX & Responsive Design (57/57 subtasks)"

Yes, I broke it into 57 subtasks and checked them off one by one. I'm a PM. This is how we cope.

### Evening: My Crash Course in Testing

Here's where I learned the most.

I asked Claude: "How do I know this won't break?"

Claude suggested tests. Lots of tests.

"I don't know how to write tests," I admitted.

"I'll help you," Claude responded (again, not literally, but this is my story).

Together, we built:

**Unit tests** (Vitest):
- 20 tests for authentication
- 21 tests for ProgressCard component
- 22 tests for NotesHistory component
- Tests for EVERY utility function (streak calculator, percentage calculator, validation)

I learned to read test output. Red meant broken. Green meant working. It was oddly satisfying.

**Integration tests**:
- Mocking Google Sheets API responses (because I couldn't spam the real API during tests)
- Testing offline queue (disconnect wifi, make changes, reconnect, verify sync)
- Conflict resolution (what happens if two devices edit the same habit?)

**E2E tests** (Playwright):

This was my favorite part. Playwright literally opens a browser and clicks through your app like a real user. I could *watch* the tests run. It felt like magic.

I wrote tests for:
- First-time user signup flow
- Adding habits
- Daily logging
- Checking progress
- Going offline and coming back online

I tested on **four browsers**:
- Mobile Chrome (375x667) - my primary target
- Desktop Chrome (1280x720) - for desktop users
- Mobile Safari (iPhone 13) - because iOS is different
- Firefox (1280x720) - to make sure it's not just a Chrome thing

By midnight, I had:
- **747 tests passing**
- **99.7% code coverage**
- **2 failing tests** (timezone bugs I documented for later)

**Commit at 12:42 AM**: "feat: add comprehensive E2E testing suite with Playwright (Phase 4)"

**What I learned**: Testing isn't just for engineers. As a PM, I was testing *user flows*. As a non-developer terrified of breaking things, tests gave me *confidence*. Green tests meant I could ship without fear.

---

## Day 3: The Realization (October 15)

Tuesday morning. I had a working app. It was tested, polished, offline-capable. I could deploy this.

But something was nagging at me. A feeling I get as a PM when something doesn't quite fit.

### The Performance Problem

I loaded the app with realistic test data: 50 habits, 1000+ log entries (what a power user might have after a year).

Then I clicked "sync."

**2 seconds.** Then **3 seconds.** One operation took **5 seconds.**

I checked the Google Sheets API documentation: **100 requests per 100 seconds per user.**

I did the math. A user with 50 habits logging once per day would hit rate limits. Not immediately, but eventually.

And here's the thing about being a PM: I think in scale. What happens when this works *too well*? What happens when users have been using this for 2 years? 5 years?

The offline-first architecture masked the problem—users wouldn't feel the lag immediately. But it was there, lurking.

**I had built something that wouldn't scale.**

### The PM Brain Takes Over

This is where my product management background kicked in.

I could have made the engineering decision: "Ship it. Optimize later. Most users won't hit this for months."

But I made the PM decision: "We have zero users. This is the ONLY time we can fix this cleanly."

I spent Tuesday afternoon doing what PMs do: **writing docs**.

**Documents I created**:
- `SUPABASE_MIGRATION_PLAN.md` - 1,500+ lines of detailed migration plan
- `0002-prd-supabase-migration.md` - Full PRD with requirements, tradeoffs, success metrics
- Comparative analysis of Google Sheets vs. Supabase
- Cost projections for 1K, 10K, 100K users
- Rollback plan in case the migration failed

I wrote out the tradeoffs honestly:

**What I'd lose**:
- ❌ User data ownership (data moves from their Google Drive to Supabase servers)
- ❌ Zero cost forever (Supabase free tier works up to ~1000 users, then $25/month)

**What I'd gain**:
- ✅ 5-10x faster syncs (<500ms vs 2-5 seconds)
- ✅ Real-time multi-device sync capability
- ✅ Row-Level Security (automatic user data isolation)
- ✅ Proper database transactions
- ✅ Simplified codebase (less workaround code)

The kicker? **I had zero users.** No data to migrate. No backward compatibility headaches. No angry users.

This was the perfect time to pivot.

As a PM, I'd seen companies struggle with technical debt because they waited too long to fix foundational problems. I wasn't going to make that mistake.

**I decided to do the migration.**

---

## The Pause (October 15-18)

I didn't code for three days. I **planned**.

This might sound counterintuitive—why pause when you have momentum?

But here's what I've learned as a PM: **Momentum without direction is just running in circles.** Rushing a database migration is how you lose data, break production, and spend 3 AM hotfixing while users yell at you on Twitter.

I spent three days doing PM work:

**Wednesday-Thursday (Oct 15-16): Planning**
- Mapped out every file that needed changes
- Identified every test that would need updates
- Listed every API call that would need to be replaced
- Wrote migration checklists (because checklists are how you avoid forgetting things)

**Friday (Oct 17): CI/CD Setup**
- Set up GitHub Actions to run tests on every commit
- Fixed those 2 timezone bugs that had been failing
- Cleaned up TypeScript warnings
- Made sure the build was pristine before making major changes

**Commit on October 18, 10:39 AM**: "ci: add GitHub Actions CI workflow for automated testing"

Why CI/CD before migration? Because as a non-developer, I needed safety nets. Automated tests meant I couldn't accidentally push broken code.

**The pause wasn't wasted time. It was risk mitigation.**

As a PM, I'd seen too many "let's just move fast and figure it out" projects end badly. The engineers know this instinctively. I had to learn it deliberately.

---

## Days 6-7: The Pivot (October 18-19)

Saturday morning. Migration day.

I opened Claude and shared my migration plan. "We're switching from Google Sheets to Supabase. Here's the plan. Can you help me execute it?"

### October 18: Database Day

**1:03 PM: Setting Up Supabase**

I'd never set up a database before. Like, ever. In college, someone else always did the database work.

But Claude walked me through it:

1. Created a Supabase account
2. Created a new project
3. Ran SQL to create three tables: `habits`, `logs`, `metadata`
4. Set up Row-Level Security policies (users can only see their own data)
5. Added indexes for performance
6. Created triggers to auto-update timestamps

I stared at the SQL. I understood maybe 60% of it. But it worked.

**What blew my mind**: Row-Level Security. With Google Sheets, I had to manually filter data by `user_id` in JavaScript. With Supabase, the database itself enforces "users can only see their own data." If I tried to fetch someone else's habits, the database would return nothing. Security by default.

**5:45 PM: Connecting the Frontend**

Installed `@supabase/supabase-js`, added environment variables, asked Claude to generate TypeScript types from the database schema.

**5:55 PM: The Authentication Epiphany**

Remember that 4-hour Google OAuth battle on Day 1?

Supabase Auth took 10 minutes:

```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin + '/daily-log' }
});
```

**That's it.** Three lines. Token refresh? Automatic. Session persistence? Built-in. OAuth callback handling? Done.

I deleted 259 lines of token management code I didn't understand anyway.

**6:13 PM: The Data Layer Rewrite**

This was the big one. Replacing all the Google Sheets API calls with Supabase.

**Before (Google Sheets)**:
```typescript
const habits = await googleSheetsService.readHabits();
const updated = habits.filter(h => h.habit_id !== habitId);
updated.push(newHabit);
await googleSheetsService.writeHabits(updated);
```

**After (Supabase)**:
```typescript
await supabase.from('habits').insert(newHabit);
```

One line. One database call. Atomic transaction. No race conditions.

I worked with Claude for about 4 hours, replacing every Google Sheets call with Supabase equivalents. The code got **simpler**. Deleted 571 lines, added 470 lines. Net -101 lines.

**As a PM, I'd learned**: Sometimes the best technical decision is the one that removes complexity.

### October 19: Integration Day

**Morning: The Moment of Truth**

Sunday morning. Time to see if this migration actually worked.

I asked Claude to update all the components to use Supabase instead of Google Sheets. Here's where the abstraction layer I'd built on Day 1 saved me—most components didn't need to change. They called `createHabit()` and `getLogs()` the same way. Only the implementations changed.

**12:15 PM: The Paranoia Test Suite**

Remember how I was terrified of breaking things? This is where the tests I'd written on Day 2 proved their worth.

I ran the full test suite:

```bash
npm test -- --run
```

My heart was pounding. 747 tests. If they passed, the migration worked. If they failed...

**Green.** All green.

- ✅ 254 unit tests passing
- ✅ E2E tests passing on all four browsers
- ✅ Offline sync still works (because IndexedDB didn't change)
- ✅ CI pipeline green

I literally stood up and cheered. My cat looked at me like I was insane.

**12:35 PM: Burning the Bridges**

I deleted `googleSheets.ts`. 571 lines gone. No going back now.

**Commit**: "feat: complete Supabase migration and legacy code cleanup (#2)"

The migration was done.
- The app was 5-10x faster
- The code was simpler
- The architecture was cleaner
- I still had zero users, so nobody knew I'd just pulled off a database migration

**What I learned**: This is the power of having zero users. You can make bold architectural decisions without risk. You can pivot without consequences. You can learn without pressure.

But the clock was ticking. I needed to ship soon, or I'd keep tinkering forever.

---

## Day 7: The Growth Hack (October 19, Afternoon)

Sunday afternoon. The migration was done. The app was ready to ship.

But I couldn't shake a thought: **Nobody's going to sign up for this.**

### The Product Manager's Dilemma

I looked at my welcome page:

**"Welcome to Habit Tracker! Sign in with Google to get started."**

And I thought about all the user research I'd done over the years. All the usability tests. All the A/B tests on signup flows.

**The data doesn't lie**: Signup friction kills conversion.

People don't want to create accounts for things they haven't tried. Especially on mobile. Especially for something as personal as habit tracking.

I'd seen this pattern at work. Our best-converting products? They all had some version of "try before you buy."

**The question**: How do you let someone try a habit tracker without an account?

### The Lightbulb Moment

Wait. I already built offline-first architecture. The app works completely in IndexedDB without any server.

**What if... people could just use the offline version as a "demo mode"?**

No signup. No password. Just click "Try without signing up" and you're in.

Add habits. Log daily. See your progress. All stored locally.

Then, when they're hooked—when they have 5 habits and a 3-day streak and actually care about this data—*that's* when I ask them to sign up.

"Create an account to save your data across devices."

It's not "sign up and maybe you'll like it."

It's "you already like it, now let's make sure you don't lose it."

### Building Demo Mode (PM Mode Activated)

I opened a new file: `0003-prd-demo-mode-onboarding.md`

As a PM, I mapped out the user journey:

**Entry points**:
- User lands on welcome page
- Sees "Try without signing up"
- Clicks and immediately enters the app (no forms, no passwords)

**Demo experience**:
- Full functionality (add habits, log daily, see progress)
- Persistent banner: "You're in demo mode. Sign up to save your data."
- Data stored locally for 7 days

**Conversion triggers**:
- After adding 3+ habits (they're planning, they're invested)
- After completing first log (they're using it, it's part of their routine)
- When visiting progress page (they care about analytics, they're power users)
- Day 5 expiry warning (urgency + loss aversion)

**Seamless migration**:
- User clicks "Sign up" from demo mode
- Authenticates with Google
- All demo data automatically syncs to their account
- Zero data loss

I asked Claude: "Can we build this?"

Together, we built it in one afternoon:

**1. Demo Mode Service** (`demoMode.ts`):
- Tracks demo state in localStorage
- Monitors engagement (habits added, logs completed, page visits)
- Triggers conversion prompts at the right psychological moments

**2. UI Components**:
- `DemoBanner` - Non-intrusive banner showing demo status
- `ConversionModal` - Appears at high-engagement moments
- `ExpiryWarning` - Creates urgency as data approaches expiry

**3. The Magic**:
- Remember that offline-first architecture from Day 1?
- Demo users ARE offline users
- When they sign up, `syncService.fullSync()` migrates everything to Supabase
- I didn't have to write new migration logic. It already existed.

**Commit at 8:21 PM**: "test: comprehensive testing suite for demo mode onboarding (Task 5.0) (#8)"

### Why This Might 3x Conversion

As a PM, I've learned: The best growth features aren't tricks. They're reduced friction at the right time.

Demo mode reduces friction at entry (no signup required) and increases motivation at conversion (you've already invested time, don't lose your data).

It's basic behavioral psychology:
- **Endowment effect**: Once you've created something, you value it more
- **Sunk cost**: The more time you invest, the more you want to preserve it
- **Loss aversion**: "Don't lose your progress" is more motivating than "Save your progress"

Could this backfire? Sure. Maybe people will just use demo mode forever and never sign up.

But I'd rather have users in demo mode than no users at all. At least they're using the product. At least I'm learning from their behavior.

**This is the PM mindset**: Ship, learn, iterate.

---

## The Result

Seven days. October 13 to October 19, 2025.

A product manager with no recent coding experience built a production-ready web app with the help of an AI coding assistant.

**What I built**:
- ✅ Mobile-first habit tracker with offline support
- ✅ Supabase authentication and PostgreSQL database
- ✅ IndexedDB-based offline-first architecture
- ✅ Background sync with conflict resolution
- ✅ Demo mode with behavioral triggers
- ✅ 747 tests (99.7% coverage) across unit, integration, and E2E
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Cross-browser E2E tests (Chrome, Safari, Firefox)

**What I actually did**:
- Wrote detailed PRDs for every feature
- Made every product decision (UX, information architecture, conversion strategy)
- Learned to read TypeScript and understand React patterns
- Debugged errors by explaining problems to Claude
- Wrote test scenarios (Claude wrote the test code)
- Made architectural decisions (offline-first, soft deletes, demo mode)

**What Claude did**:
- Wrote 90%+ of the actual code
- Suggested best practices (testing, TypeScript, accessibility)
- Caught errors I didn't understand
- Explained concepts when I asked
- Implemented my product decisions in code

### What I Learned

**1. PM Skills Transfer to Coding (More Than I Expected)**

Breaking down complex features into subtasks? That's sprint planning.
Writing detailed specifications before building? That's a PRD.
Prioritizing what to build first? That's roadmapping.
Testing user flows? That's usability testing.

I wasn't "learning to code." I was applying PM skills to code.

**2. AI Coding Assistants Are Equalizers**

Claude Code didn't just help me write code. It let me *think like a PM* while building like an engineer.

I focused on:
- What should this feature do?
- How should users interact with it?
- What edge cases matter?
- How do we test this?

Claude focused on:
- How do we implement this in TypeScript?
- What's the React pattern for this?
- How do we structure the tests?
- What libraries should we use?

This is a new kind of collaboration. I brought product thinking. Claude brought implementation knowledge.

**3. Pivot Before You Have Users**

The Google Sheets → Supabase migration would have been a nightmare with users. Zero users = zero migration pain.

**As a PM, I've learned**: Technical debt is easier to fix before you owe it to anyone.

**4. Offline-First Architecture Was the Foundation**

Building offline-first on Day 1 paid dividends:
- Demo mode worked because the app already worked offline
- Supabase migration didn't touch the storage layer
- Tests didn't break during migration
- User experience was never blocked on network requests

**Good architecture makes future features easier.** This is something engineers know instinctively. I had to learn it by building.

**5. Testing Gave Me Confidence (Not Just Coverage)**

As a non-developer, I was terrified of breaking things. Tests let me refactor without fear.

Green tests meant: "You didn't break anything."
Red tests meant: "Fix this before you ship."

This is psychological safety for non-developers writing code.

**6. Product Decisions Matter More Than Code Quality**

The demo mode feature took 4 hours to build. It might 3x conversion.
The Supabase migration took 2 days. It made syncs 10x faster.
The offline-first architecture took 1 evening. It enabled both of the above.

**The best code is code that enables better product decisions.**

---

## What's Next

The app is ready to ship. But as a PM, I know: **Shipping is just the beginning.**

**Immediate priorities**:
- **Production deployment** (probably Vercel - simple, fast, free tier)
- **Real user testing** (my friends and family are about to become beta testers)
- **Analytics** (track demo → signup conversion, feature usage, retention)
- **Iterate based on data** (this is where PM skills matter most)

**Future features** (maybe, if users want them):
- Habit templates ("Start with these common habits")
- Dark mode (everyone asks for dark mode)
- Data export to CSV/JSON (data ownership still matters)
- Habit streaks social sharing (if people want to brag about streaks)

**Things I'm explicitly NOT building**:
- Gamification (points, badges, quests) - kills the simplicity
- Social networks (followers, feeds) - not the focus
- Premium paywalls - want this accessible
- AI suggestions - solving a problem that doesn't exist

**The product vision**: Stay simple. Stay focused. Let users own their habit tracking journey.

---

## Final Thoughts: What This Means

I wrote this not just to document my journey, but to show what's now possible.

**A product manager with no recent coding experience built a production-ready web app in 7 days.**

That sentence would have been impossible 2 years ago.

But we're in a new era. AI coding assistants haven't made developers obsolete—they've made *building* accessible to people who can think in products, users, and problems.

### For PMs and Designers Reading This

You can build. You really can.

You don't need to quit your job and do a coding bootcamp. You don't need to become a "real developer." You need:

1. **Product thinking** - What should this do? Who is it for?
2. **User empathy** - How will people actually use this?
3. **Ruthless prioritization** - What's essential? What's nice-to-have?
4. **Iterative mindset** - Ship, learn, improve

These are PM skills. You already have them.

Claude (or GitHub Copilot, or Cursor) can teach you the syntax. Stack Overflow can debug the errors. But only you can decide what to build and why.

### For Developers Reading This

This isn't a threat to your job. It's a multiplication of what you can do.

Imagine working with PMs who can prototype their own ideas. Who can understand your technical constraints because they've wrestled with them. Who speak code fluently enough to debate architecture.

**AI coding assistants make collaboration better, not obsolete.**

### The Honest Part

Did I build this myself? Yes and no.

I made every product decision. I wrote every spec. I designed every flow. I chose every tradeoff.

But Claude wrote most of the code. And that's okay.

Because at the end of the day, **code is a means, not an end.** What matters is: Does it work? Does it help users? Would I be proud to ship it?

Yes, yes, and yes.

---

## One More Thing

If you're a PM, designer, researcher, or anyone who's ever thought "I wish I could just build this myself"—

You can.

The tools exist. The knowledge is accessible. The only thing stopping you is the fear that you're not a "real developer."

Here's the secret: Neither am I.

And I shipped anyway.

---

*Written by a product manager who spent 7 days learning that the hardest part of building software isn't the code—it's deciding what to build and why.*

---

**Tech Stack:**
- React 18.2 + TypeScript 5.2
- Vite 5.0 (build tool)
- Supabase (auth + PostgreSQL database)
- IndexedDB (offline storage)
- Vitest (unit tests) + Playwright (E2E tests)
- Claude Code (AI pair programmer)

**Build Time:** 7 days (Oct 13-19, 2025)

**Lines of Code:** ~8,000 (including tests)

**Lines I Actually Wrote:** ~500 (mostly PRDs, planning docs, and test scenarios)

**Lines Claude Wrote:** ~7,500 (the actual implementation)

**Product Decisions Made:** 100% mine

**Coffee Consumed:** Too much

**Impostor Syndrome Experienced:** Constantly

**Shipped Anyway:** Yes
