# Sovereign UAE Luxury Real Estate Investment Transformation

Transform the entire PM Invest & Treasure Homes platform into an ultra-luxurious, institutional-grade wealth portal with a deep obsidian black, brushed gold, and champagne aesthetic. Introduce a golden shimmering skeleton loader in the UserDashboard that precisely mirrors the property investment cards, showcase full luxury property cards on the homepage with high-resolution photography and verified Dubai addresses, and apply cohesive luxury styling across all components.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions were confirmed during Phase 1 clarification:
>
> - **Visual Identity & Color Theme**: Deep obsidian black (`#05070c` / `#0a0d14`), warm brushed gold (`#d4af37` / `#e5b842` / `amber-500`), and subtle champagne metallic highlights (`#fdfbf7` / `#e8dfc8`). Eliminates stark generic slate/white in favor of an exclusive private-wealth atmosphere.
> - **Homepage Property Showcase**: Full luxury cards featuring high-resolution photography, property name, verified Dubai address, Makani number, 24-week tenure, and weekly Friday cash yield.
> - **Investment Skeleton Screen Loader**: Shimmering golden pulse animation that mimics the exact 2-column and 3-column card structure of the active investment cards and property plans, providing smooth perceived performance while context and Supabase data synchronize.

---

## 1. Overview & Core Concept

### What It Delivers
1. **Full-Spectrum Luxury Aesthetic (Deep Obsidian & Brushed Gold)**:
   - Deep obsidian background canvas (`bg-[#06080e]` and `bg-[#0b0f19]`).
   - Brushed gold accents, warm metallic gradients, and champagne typography.
   - Elegant dark glass cards with golden hairline borders (`border-amber-500/20` and `hover:border-amber-400/50`).
   - Clean, unboxed metadata following the zero-pill discipline (no garish candy badges; elegant typographic separators).

2. **Golden Shimmering Skeleton Loader in UserDashboard**:
   - Renders automatically while `investmentsLoading` or initial context sync is resolving.
   - Mimics the exact layout of the property investment cards:
     - Aspect-ratio thumbnail placeholder with warm gold gradient shimmer.
     - Headline and address line placeholders.
     - Metric grid placeholders (Invested Capital, Weekly Friday Yield, 24-Week Total Returns).
     - Progress bar and button placeholder.
   - Smooth CSS golden pulse animation (`animate-pulse` with custom warm golden shimmer sheen).

3. **Homepage Luxury Property Showcase**:
   - Replaces the basic text rate previews on the landing page (`src/App.tsx`) with full luxury cards matching the Buy Plans tab:
     - Real property photography (`/properties/marina_bay_residences.jpg`, `creek_horizon_suites.jpg`, `downtown_sky_vista.jpg`, etc.).
     - District location tags (`Dubai Marina`, `Downtown Dubai`, `Palm Jumeirah`, `DIFC`).
     - Verified municipal street addresses and Makani numbers.
     - Transparent 24-week cash yield structures with direct Friday payouts.
     - Quick "Explore UAE Property Plans" or "Login to Invest" calls to action.

4. **Holistic Texture & Elevation Refinement**:
   - Global styling updates across navigation headers, statistics cards, modals, and transaction ledgers.
   - Consistent currency formatting and tabular numerals (`font-mono tabular-nums`).
   - Full persistence and real-time synchronization with Supabase.

---

## 2. User Experience & Visual Design

### Visual Identity & Design Tokens

| Token | Class / Hex | Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `bg-[#06080e]` | Deep obsidian foundational background |
| **Surface Card** | `bg-[#0c101c]` / `bg-[#0e1322]` | Rich dark card surface with subtle ambient depth |
| **Card Border** | `border-amber-500/20` | Subtle brushed gold hairline border |
| **Gold Primary** | `text-amber-400` / `bg-amber-500` | Primary action highlights, yields, and key titles |
| **Champagne Accent** | `text-[#f7ecd5]` / `border-[#d4af37]/30` | Secondary headings, modal highlights, and luxury badges |
| **Emerald Yield** | `text-emerald-400` | Weekly Friday cash payout indicators |
| **Muted Metadata** | `text-slate-400` / `text-slate-500` | Unboxed address lines, Makani numbers, and timestamps |

### Component Architecture & Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│               PM INVEST & TREASURE HOMES LUXURY PORTAL                 │
│         Deep Obsidian Canvas · Brushed Gold · Champagne Accents        │
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  HEADER & LIVE TICKER                                              │ │
│ │  Branded Emblem · UAE Sovereign Reserve · Live Trading Ticker Bar  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌──────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │  ACTIVE INVESTMENTS / SKELETON   │ │  WALLET & METRICS OVERVIEW    │ │
│ │  • Golden Shimmer Skeleton Loader│ │  • Available Balance (₦)      │ │
│ │    (Mimics Property Card Layout) │ │  • Accrued Friday Cash Profit │ │
│ │  • Active UAE Property Cards     │ │  • Next Payout Countdown      │ │
│ │    - Real Property Photo         │ │  • Quick Top-Up / Withdraw    │ │
│ │    - Verified Dubai Address      │ └───────────────────────────────┘ │
│ │    - 24-Week Progress Bar        │                                   │
│ │    - [📜 Official Title Deed]    │ ┌───────────────────────────────┐ │
│ └──────────────────────────────────┘ │  UAE PROPERTY PLANS (BUY)   │ │
│                                      │  • Marina Bay Residences      │ │
│ ┌──────────────────────────────────┐ │  • Creek Horizon Suites       │ │
│ │  HOMEPAGE SHOWCASE (LANDING)     │ │  • Downtown Sky Vista         │ │
│ │  • Full Luxury Property Cards    │ │  • Sobha Sanctuary Estates    │ │
│ │  • High-Res Visual Banners       │ │  • Palm Azure Ocean Villa     │ │
│ │  • DLD Registry & Makani Badges  │ │  • Emirates Financial Tower   │ │
│ │  • Instant Registration / Login  │ └───────────────────────────────┘ │
│ └──────────────────────────────────┘                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Implementation Details

### Decision 1: Golden Shimmer Skeleton Screen
- **Chosen Approach**: Build a dedicated `PropertyCardSkeleton` component in `src/components/` that replicates the exact aspect ratio, thumbnail banner, address block, 2-column metrics grid, progress bar, and action button height of active investments and plan cards.
- **Why**: Prevents layout shifts (CLS), reinforces the luxury aesthetic with a warm golden wave shimmer (`from-amber-500/5 via-amber-500/15 to-amber-500/5`), and provides immediate visual feedback while Supabase queries execute.

### Decision 2: Homepage Luxury Cards Integration
- **Chosen Approach**: Replace the minimalistic 3-item text grid in `src/App.tsx` with full-featured luxury property cards matching the `UserDashboard` Invest tab, complete with photo banners (`/properties/...`), location tags, verified street addresses, and clear 24-week yield structures.
- **Why**: Prospective investors immediately see the tangible, high-value Dubai real estate assets backing the platform before signing in.

### Decision 3: Global Obsidian & Brushed Gold Re-skin
- **Chosen Approach**: Update background classes, borders, buttons, and text across `App.tsx`, `UserDashboard.tsx`, `BrandingHeader.tsx`, `UaeDeedModal.tsx`, and shared elements to standard dark luxury tokens (`#06080e`, `#0c101c`, `amber-500`, `amber-400`, `slate-300`).
- **Why**: Delivers an opulent, high-net-worth sovereign wealth atmosphere that elevates investor trust and reflects prime UAE property backing.

---

## 4. Execution Sequence

1. **Skeleton Loader Component (`src/components/PropertyCardSkeleton.tsx`)**:
   - Create reusable skeleton component with shimmering gold gradients for single cards and 2/3-card grids.
   - Integrate into `UserDashboard.tsx` during initial data load and state transitions.

2. **Homepage Luxury Property Showcase (`src/App.tsx`)**:
   - Upgrade the public landing page to render full luxury property cards with image banners, addresses, Makani numbers, and 24-week return summaries.
   - Refine hero section with obsidian and brushed gold palette.

3. **Global Luxury Styling & Texture Overhaul**:
   - Update global dashboard surfaces, wallet cards, transaction tables, and modals with obsidian black backgrounds, warm hairline gold borders, and champagne typography.
   - Ensure high contrast legibility (WCAG AA compliant) and zero-pill clean metadata formatting.

4. **Verification & Testing**:
   - Run `compile_applet` and `lint_applet` to guarantee error-free compilation.
   - Verify smooth skeleton loading transitions and responsive desktop/mobile display.
