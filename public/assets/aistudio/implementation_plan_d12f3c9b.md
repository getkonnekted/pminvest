# PM Invest: Architectural Minimalist Luxury Transformation

Transform PM Invest from generic AI template aesthetics into an ultra-high-end Architectural Minimalist private wealth and Dubai real estate co-investment platform, eliminating all gamification widgets, synthetic tickers, and AI badges in favor of verified DIFC SPV asset dossiers, official Dubai Land Department (DLD) deed registries, and quiet executive typography.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during Phase 1 clarification:
> - **Aesthetic Direction**: **Architectural Minimalist** — Curated alabaster travertine canvases (`#FAF8F5`, `#F2EFE9`), warm bone stone surfaces, deep obsidian graphite text (`#121316`), brushed bronze/champagne hairline dividers, and crisp geometric/editorial typography (`Plus Jakarta Sans` with refined serif accents).
> - **Gamification & Synthetic Tickers**: **Complete Removal** — Detach and eliminate `DailyTasksHub`, `DailyGamesHub`, `LiveTradingSimulationCard`, `LivePropertyTradingModal`, and fake sales-toast popups (`LiveActivityToast`). Replace them with institutional property tools: **DIFC SPV Legal Trust Registry**, **DLD Verified Title Deed Dossiers**, and **Underwritten Yield Matrices**.
> - **Home Page Hero & Proof Focus**: **DIFC SPV Registry & DLD Asset Dossiers** — Institutional custody disclosure, notarized land registry certificates, tenant occupancy audit trail, and verified bank payout clearance ledgers.

---

### 1. Overview & Core Concept

- **What It Does**: PM Invest is an institutional-grade UAE luxury real estate co-investment platform operating under Treasure Homes Ltd. Accredited and retail co-investors pool capital into prime Dubai real estate assets (DIFC, Downtown Dubai, Palm Jumeirah, Dubai Marina) with legal title held under a bankruptcy-remote DIFC Special Purpose Vehicle (SPV), generating structured, contractual weekly Friday cash distributions paid in NGN or AED.
- **Target Audience & Persona**: High-conviction diaspora investors, executive professionals, real estate co-owners, and institutional syndication partners seeking tangible asset backing, legal security, and transparent yields rather than speculative digital tokens.
- **Key Value**: Direct exposure to sovereign UAE luxury property with bankruptcy-remote DIFC legal protection, authenticated DLD title deed registration, zero gamified distraction, and predictable Friday bank distributions.

---

### 2. User Experience & Visual Design

#### A. Layout Architecture & Section Flow
Following the strict narrative flow:
$$\text{Investment Proposition} \longrightarrow \text{Institutional Legal Architecture (DIFC SPV)} \longrightarrow \text{Verified Property Dossiers} \longrightarrow \text{Cash Distribution Schedule} \longrightarrow \text{Account Access}$$

1. **Top Bar (Strict 3-Zone Contract)**:
   - **Zone 1 (Brand Wordmark)**: Single clean typography mark: `PM INVEST · TREASURE HOMES` in crisp letter-spaced capitals (`tracking-widest`). No attached pill badges, no location flags glued to the wordmark.
   - **Zone 2 (Editorial Navigation)**: Single-line unboxed text links: `Portfolio Dossiers · Legal Custody & DIFC · Distribution Ledger · Institutional Portal`.
   - **Zone 3 (Executive CTA & Account)**: Single primary action (`Access Private Portal` or `Investor Session`), alongside a minimal theme switch between **Travertine Alabaster** and **Obsidian Slate**.

2. **Hero Viewport**:
   - Single dominant focal statement with generous whitespace: headline `Architectural Co-Investment in Prime Dubai Real Estate` (`clamp(2.5rem, 5vw, 4rem)`, `text-wrap: balance`).
   - Clean, quiet kicker: `Contractual Friday cash yields backed by physical DIFC and Palm Jumeirah luxury property`.
   - Primary action: `View Current Real Estate Syndicate` paired with secondary link `Review DIFC SPV Trust Structure`.
   - Strict removal of: sparkle icons (`Sparkles`), floating gamified tokens, "Someone in Lagos just bought" notification toasts, and synthetic auto-pulsing dots.

3. **Institutional Custody & DIFC SPV Registry Section**:
   - Replaces the generic "Live Reserve Counter" and crypto-style badges.
   - Structured three-part institutional safety breakdown:
     - **DIFC Special Purpose Vehicle (SPV)**: Individual asset ring-fencing under Dubai International Financial Centre Common Law jurisdiction.
     - **Dubai Land Department (DLD) Title Deed Registration**: Verified pre-title deeds (*Oqood*) and title certificates issued under Treasure Homes asset custody.
     - **Tier-1 Custodian Bank Liquidity Reserve**: Contractual escrow accounts backing weekly distributions with verified bank audit balances.

4. **Curated Property Dossiers (Eliminating AI Card Clichés)**:
   - Zero pill badge sandwiches. Metadata (Neighborhood, Completion Status, Projected Net Yield, Lease Occupancy) rendered as clean, unboxed typography with typographic dot separators (`·`).
   - High-fidelity architectural photography: Creek Horizon Suites, Emirates Financial Towers DIFC, Palm Azure Villa, Downtown Sky Vista, Sobha Sanctuary.
   - Expandable **Deed & Underwriting Sheet**: Interactive dossier detailing square footage, tenant leases, and DLD verification numbers.

5. **Investor Dashboard (Clean Executive SaaS)**:
   - **Tab Navigation**: Clean segmented text tabs: `Overview`, `Real Estate Portfolio`, `Distribution Ledger`, `DLD Title Deeds`, `Capital Deposit & Withdrawal`, `Syndicate Network (Referrals)`.
   - **Tabs Removed**: `Trading` (simulated bot trader) and `Tasks` (daily spin wheels / faucet tasks) are completely excised from the DOM and state tree.
   - **Metrics & Numbers**: Strict tabular figures (`font-variant-numeric: tabular-nums`) for all balances, payout dates, and percentages. Flat hairline borders (`1px solid var(--border)`), zero cards nested inside cards.

#### B. Visual Identity & Color System

| Token | Light (Alabaster Travertine) | Dark (Obsidian Slate) | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-canvas` | `#FAF8F5` (Warm Travertine) | `#0B0C10` (Obsidian Charcoal) | 60% Dominant canvas |
| `--color-surface` | `#FFFFFF` (Pure Alabaster) | `#13151B` (Deep Graphite) | 30% Structural cards & headers |
| `--color-surface-subtle` | `#F4F0E8` (Bone Limestone) | `#1A1D26` (Muted Slate) | Secondary tables & inputs |
| `--color-border` | `rgba(184, 150, 78, 0.22)` | `rgba(255, 255, 255, 0.08)` | Hairline dividers (1px) |
| `--color-accent` | `#9C7B38` (Brushed Bronze) | `#D4AF37` (Warm Pale Gold) | 10% High-intent CTAs |
| `--color-text-primary` | `#141518` (Obsidian Black) | `#F5F6F8` (Crisp Chalk) | High-contrast editorial titles |
| `--color-text-secondary` | `#5A5D66` (Warm Charcoal) | `#8E93A0` (Muted Steel) | Unboxed metadata & prose |

#### C. Typography Strategy
- **Display & Section Titles**: `Plus Jakarta Sans` (font-weights 600 & 700) with tight tracking (`tracking-tight`) paired with refined, letter-spaced subheadings (`tracking-widest uppercase text-xs`).
- **Body & Editorial Copy**: `Plus Jakarta Sans` (weights 400 & 500, line-height 1.65, measure 65–75 characters).
- **Financial & Registry Figures**: Tabular numerals with monospace clarity (`font-mono tabular-nums`).

---

### 3. Key Product Decisions & Component Detachments

#### Decision 1: Complete Removal of AI-Gamified Components
- **Detachments**:
  - `DailyTasksHub.tsx` & `DailyGamesHub.tsx`: Completely excised from `UserDashboard.tsx` and home view.
  - `LiveTradingSimulationCard.tsx` & `LivePropertyTradingModal.tsx`: Day-trading simulation widgets removed to eliminate any appearance of unregulated crypto/bot trading.
  - `LiveActivityToast.tsx`: Detached so visitors are never bombarded with fake social proof popups.
  - `Sparkles`, `Flame`, and pulsing green dot indicators: Replaced with quiet architectural iconography (`Building2`, `Shield`, `FileCheck`, `Landmark`).
- **New Institutional Replacements**:
  - `DIFCTrustRegistryModal.tsx` & `UaeDeedModal.tsx`: Interactive legal title inspection and DLD deed verification.
  - `InstitutionalUnderwritingCard.tsx`: Real estate financial model detailing acquisition cost, rental yields, service charges, and net cash flow payout math.

#### Decision 2: Elimination of AI Buzzwords & Marketing Clichés
- **Text Overhaul**:
  - Replace *"Supercharge your wealth with AI property algorithms"* with *"Contractual, asset-backed UAE real estate syndication under DIFC common law custody."*
  - Replace *"Auto-bot daily trading pools"* with *"Institutional rent collection & Friday bank settlement ledger."*
  - Replace *"100% Guaranteed High-Yield AI Returns"* with *"Asset-backed rental yields and capital preservation under Treasure Homes Ltd."*

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PM Invest Application                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Top Bar Contract: 3-Zone Architecture]                              │
│  ┌──────────────────────┬──────────────────────┬────────────────────┐  │
│  │ Brand: PM INVEST     │ Links: Portfolio ·   │ Action: Portal /   │  │
│  │ By Treasure Homes    │ DIFC Trust · Ledger  │ Theme Toggle       │  │
│  └──────────────────────┴──────────────────────┴────────────────────┘  │
│                                                                        │
│  [Routing & Page Views]                                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Home / Public Landing                                           │  │
│  │  ├── Hero: Architectural Statement & Sovereign Positioning       │  │
│  │  ├── DIFC SPV Trust & Escrow Custody Verification Strip          │  │
│  │  ├── Curated UAE Property Dossiers (DLD Deed Inspected)          │  │
│  │  ├── Structured Weekly Friday Distribution Matrix                │  │
│  │  └── Corporate Registry & Treasure Homes Legal Disclosures       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Investor Dashboard (Clean Executive Interface)                  │  │
│  │  ├── Portfolio Overview & Net Liquidity Balance                  │  │
│  │  ├── Active Real Estate Co-Ownership Holdings (with Deeds)      │  │
│  │  ├── Distribution Ledger (Scheduled & Paid Friday Payouts)       │  │
│  │  ├── Capital Management (Bank Transfer & Paystack Escrow)        │  │
│  │  └── Syndicate Referral Network & Marketer Portal                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [State & Data Layer: StateContext + Supabase + Paystack]             │
│  ┌──────────────────────┬──────────────────────┬────────────────────┐  │
│  │ Supabase Realtime DB │ StateContext (React) │ Paystack / NGN     │  │
│  │ Plans, Users, Deeds  │ Auth, Balances, KYC  │ Escrow Settlements │  │
│  └──────────────────────┴──────────────────────┴────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Interactive Component & State Mapping
1. **Dossier Inspection**: Clicking any property opens `UaeDeedModal` containing verified DLD certificate numbers, DIFC SPV registration, location coordinates, and lease occupancy rates.
2. **Co-Investment Purchase**: Directly calls `purchaseInvestment` or `topUpAndPurchaseInvestment` without synthetic trading popups. Generates an authentic legal certificate in user portfolio.
3. **Weekly Friday Payout Settlement**: Maintains existing automated Friday settlement logic, connected to user bank account details with Paystack/manual verification.
4. **Theme Orchestration**: `ThemeContext` seamlessly transitions root classes between `.theme-champagne` (Architectural Alabaster Travertine) and `.theme-obsidian` (Executive Charcoal) without `!important` text inversions.

---

### Verification & Implementation Safeguards

- **No Breaking Logic**: All core backend, auth, Supabase sync, deposit, and Friday payout execution functions in `StateContext.tsx` remain intact.
- **Strict Anti-Slop Audit**: Zero `//` code comments in headers, zero static pill tags, zero decorative pulsing green dots, zero fake arrival popups.
- **Compilation Check**: Execution validated via `compile_applet` with zero TypeScript errors.
