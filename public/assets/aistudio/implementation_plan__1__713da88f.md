# PM Invest · High-Concurrency Scaling & Database Optimization (1,000+ Users)

A high-performance architectural plan to scale PM Invest from single-session prototyping to supporting 1,000+ simultaneous investors with sub-100ms response times, zero connection pool exhaustion, and strict data privacy.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural decisions below resolve the performance bottlenecks identified in the database synchronization engine while maintaining the luxury Architectural Minimalist interface:

- **Data Scoping & Privacy (Engineering Advice Applied)**:
  - **Regular Investors**: The app will only fetch the authenticated user's profile (`.eq('id', currentUser.id)`), their own property investments (`.eq('userId', currentUser.id)`), and their personal transaction ledger (capped at the latest 25 items). Regular investors will never download the platform's global user table or other investors' transactions.
  - **Administrators**: Control Panel queries global aggregates and user lists using server-side pagination (`.range(from, to)`) rather than unbounded `SELECT *`.
- **Sync & Polling Architecture (Engineering Advice Applied)**:
  - **Removal of 12-Second Polling**: The unconditional 12-second `fetchAllSupabaseData` polling interval is completely detached.
  - **Supabase Realtime WebSockets**: Live updates arrive via Postgres CDC (Change Data Capture) channels subscribed specifically to the user's records.
  - **Action-Triggered Invalidation**: Balances and transactions refresh immediately following concrete investor events (deposits, unit purchases, withdrawals, Friday payouts).
  - **Tab-Focus Safety Heartbeat**: A lightweight 90-second heartbeat runs only when the browser tab is actively focused (`document.visibilityState === 'visible'`).
- **Atomic Balance Processing (Confirmed Choice)**:
  - Enforce Postgres atomic stored procedures (`process_wallet_transaction`) so simultaneous Friday yields and Paystack credit webhooks execute atomically without client-side race conditions.

---

## 1. Overview & Core Concept

### What It Does
Upgrades PM Invest's state and database synchronization architecture so the platform can support 1,000+ concurrent active investors simultaneously without hitting Supabase connection limits, generating bloated network payloads, or causing UI lag.

### Key Value
- **Zero Connection Exhaustion**: Lowers database query volume by over 92% (from 40,000 queries/min down to event-driven push).
- **Sub-100ms UI Latency**: Eliminates multi-megabyte JSON payloads on mobile devices by fetching only personal investor assets.
- **Financial Integrity**: Guarantees atomic wallet operations for Friday 12:00 PM yields and automated Paystack deposits.

---

## 2. User Experience & Visual Design

The user experience remains identical to the approved **Architectural Minimalist** luxury design (alabaster travertine, bone limestone, crisp typography, and quiet tabular figures). The performance upgrades happen under the hood:

- **Instant Tab Switching**: Navigation between *Property Dossiers*, *DIFC Custody*, *Friday Ledger*, and *Wallet* becomes instantaneous because the browser no longer re-parses thousands of unrelated user records.
- **Connection Health Indicator**: Quiet, unobtrusive latency and sync indicators in the Admin Control Panel without disruptive popups or badges.
- **Optimistic UI with Background Confirmation**: Immediate visual feedback on investments and deposits, backed by atomic database guarantees.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Scoped Queries vs. Global State Hydration
- **Chosen Approach**: Query only the current user's records (`userId = currentUser.id`) in `UserDashboard` and unauthenticated landing views. Restrict full-table views to `AdminPanel`.
- **Why**: Under the existing implementation, 1,000 users each downloading all platform transactions generated ~50MB of network traffic and ~40,000 queries every minute. Scoped queries reduce this to a single lightweight row (<2KB) per user.
- **Trade-off**: The client no longer holds the full platform directory in memory, which is standard production security practice.

### Decision 2: Event-Driven Realtime vs. Periodic Polling
- **Chosen Approach**: Replace the 12-second interval with Supabase Realtime channels (`postgres_changes` filtered by `userId = eq.${currentUser.id}`).
- **Why**: WebSockets maintain a single persistent connection and push data only when an actual database change occurs, cutting idle database CPU usage to near zero.
- **Fallback**: A gentle 90-second heartbeat triggers only when the tab is active to guard against transient mobile socket disconnects.

### Decision 3: Atomic Stored Procedures vs. Client-Side Math
- **Chosen Approach**: Balance increments (deposits, yield disbursements, withdrawals) execute via database-level atomic transactions (`UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`).
- **Why**: Eliminates race conditions when multiple Friday payouts or payments clear simultaneously.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Vercel / Cloud CDN Edge                         │
│             Static React 19 SPA (Travertine Luxury Theme)              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│       Investor Session        │         │      Administrator View       │
│      (UserDashboard.tsx)      │         │       (AdminPanel.tsx)        │
└───────────────────────────────┘         └───────────────────────────────┘
       │                                                         │
       │ Scoped User Queries                                     │ Paginated Ledger Queries
       │ .eq('userId', user.id)                                  │ .range(0, 50) + Aggregates
       ▼                                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Supabase Connection Pool                        │
│                   PgBouncer (Transaction Mode :6543)                   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database Engine                         │
│                                                                        │
│  ├── public.users                (Indexed on id, email, referralCode)  │
│  ├── public.investments          (Indexed on userId, status)           │
│  ├── public.transactions         (Indexed on userId, createdAt DESC)   │
│  ├── public.system_settings      (Single global cached config)         │
│  └── stored procedure: process_wallet_transaction (Atomic ACID)        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Supabase Realtime WebSocket Push                     │
│          Channel: realtime:public:transactions:userId=eq.{id}          │
└────────────────────────────────────────────────────────────────────────┘
```

### Proposed Execution Steps

1. **Optimize Supabase Sync Layer (`src/lib/supabase.ts`)**:
   - Add scoped fetch methods: `fetchInvestorData(userId: string)` to query only the active user's investments, transactions (capped at 25), and profile.
   - Refactor `fetchAllSupabaseData` to be called strictly on demand by the Admin Control Panel.
2. **Refactor Application Context (`src/context/StateContext.tsx`)**:
   - Remove the hardcoded 12-second `setInterval(refreshFromSupabase, 12000)`.
   - Implement user-scoped Realtime subscriptions on login.
   - Attach targeted action invalidations when a deposit, investment, or withdrawal occurs.
3. **Verify Database Indexes & RPC in SQL (`supabase_schema.sql`)**:
   - Ensure `idx_investments_user_id` and `idx_transactions_user_id_created` are defined for instant indexed lookups.
   - Provide atomic stored procedure script for high-concurrency wallet updates.
4. **Compile & Lint Verification**:
   - Execute `lint_applet` and `compile_applet` to confirm zero regression across all dashboard views.
